const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");

    // Proactively drop the old unique index on userinterests to unlock multiple likes per batch
    try {
      const collections = await mongoose.connection.db.listCollections({ name: "userinterests" }).toArray();
      if (collections.length > 0) {
        try {
          await mongoose.connection.db.collection("userinterests").dropIndex("batchId_1_recipientUserId_1");
          console.log("✅ Successfully dropped old restrictive unique index (batchId_1_recipientUserId_1)");
        } catch (e) {
          // Index does not exist or was already dropped, ignore
        }
      }
    } catch (err) {
      console.warn("Index clean-up skipped:", err.message);
    }
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;