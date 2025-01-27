require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_USER: process.env.HET_EMAIL_USER,
  EMAIL_PASS: process.env.HET_EMAIL_PASS,
};
