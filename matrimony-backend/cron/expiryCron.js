const cron = require('node-cron');
const SharedProfile = require('../models/SharedProfile');

// Run every hour to expire shared profiles
// "0 * * * *" runs at minute 0 of every hour.
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[CRON] Running shared profile expiration job...');
    const now = new Date();
    
    // Find all active profiles that have expired
    const expiredProfiles = await SharedProfile.find({
      status: 'active',
      expiresAt: { $lt: now }
    });

    if (expiredProfiles.length > 0) {
      console.log(`[CRON] Found ${expiredProfiles.length} expired profiles. Archiving...`);
      
      // Update them to expired
      const result = await SharedProfile.updateMany(
        {
          status: 'active',
          expiresAt: { $lt: now }
        },
        {
          $set: { status: 'expired' }
        }
      );
      
      console.log(`[CRON] Successfully expired ${result.modifiedCount} profiles.`);
      
      // Note: We are setting status to 'expired' rather than hard deleting.
      // The API already filters out profiles where expiresAt < now OR status is not 'active',
      // so this is a permanent state change that cleans up active records without 
      // losing historical data (in case admins need to audit what was shared).
    } else {
      console.log('[CRON] No expired profiles found.');
    }
  } catch (error) {
    console.error('[CRON ERROR] Error running expiration job:', error);
  }
});
