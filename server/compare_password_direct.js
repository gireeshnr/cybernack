import bcrypt from 'bcryptjs';

const storedHash = '$2a$10$104VzBZBPidoyQLDqR56hOY3F.ELdqVng1nAUUq9dTC3otr/Xwo.C';
const plainTextPassword = '1234';

bcrypt.compare(plainTextPassword, storedHash, (err, result) => {
  if (err) {
    console.error('Error comparing passwords:', err);
  } else {
    console.log('Password match result:', result);
  }
});
