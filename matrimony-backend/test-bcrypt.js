const bcrypt = require('bcrypt');

const testBcrypt = async () => {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash:', hash);
    const match = await bcrypt.compare(password, hash);
    console.log('Match:', match);
    process.exit(0);
  } catch (err) {
    console.error('Bcrypt Error:', err);
    process.exit(1);
  }
};

testBcrypt();
