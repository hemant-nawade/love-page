// Usage: node scripts/hash-password.js "yourPasswordHere"
// Copy the printed hash into ADMIN_PASSWORD_HASH in your .env / Vercel env vars.
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "yourPasswordHere"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
});
