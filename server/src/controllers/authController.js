const prisma = require('../models');
// require('dotenv').config();
const config = require('../config/env');
const nodemailer = require("nodemailer");

const handleUserSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log("request is", req.body);
    const newUserDetails = await prisma.user.create(
    {
      data:
        {
          firstName,
          lastName,
          email,
          password
        }
    });
      res.status(201).json(newUserDetails);
    } catch (error) {
      res.status(400).json(
      {
        error: "Either the email is already taken or the request is invalid."
      }
    );
  }
};

// Email Validation Utility
const isValidEmail = async (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// OTP Generation Utility
const generateOTP = async (req, res) => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email Sending Utility
const sendOTPEmail = async (email, otp) => {
  // Configure your email transporter (replace with your SMTP details)
  console.log("email user is", config.EMAIL_USER);
  console.log("email pass is", config.EMAIL_PASS);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OTP for PPM ERP Registration',
    html: `<p>Your OTP is: <b>${otp}</b>. This OTP will expire in 10 minutes.</p>`
  })
}

// TODO: Verify Email address
// If the email is not valid, return error
// If the email is already in use, return error
// If email is valid and not in use:
// 1. Generate OTP
// 2. Store OTP in database
// 3. Send OTP via email
// 4. Return success message
const handleUserEmailSignup = async (req, res) => {
  try {
    console.log("request body is", req.body);
    const { email } = req.body

    // Validate email
    const isValid = await isValidEmail(email)
    console.log("is it valid email ?: ", isValid);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" })
    }

    // Generate OTP
    const otp = await generateOTP()
    console.log("otp is", otp);

    // Store OTP in database
    await prisma.verifyOtp.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }
    })

    // Send OTP via email
    await sendOTPEmail(email, otp)

    res.status(200).json({ message: `OTP has been sent to ${email}` })
  } catch (error) {
    console.error("Full error:", error)
    res.status(500).json({
      error: "Registration process failed",
      details: error.message
    })
  }
};

const handleUserLogin = async (req, res) => {
 // TODO: Implement this function
};

const handlePasswordReset = async (req, res) => {
  // TODO: Implement this function
};

module.exports = {
  generateOTP,
  isValidEmail,
  sendOTPEmail,
  handleUserEmailSignup,
  handleUserSignup,
  handleUserLogin,
  handlePasswordReset,
}