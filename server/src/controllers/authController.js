const prisma = require('../models');
// require('dotenv').config();
const config = require('../config/env');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

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
  // console.log("email user is", config.EMAIL_USER);
  // console.log("email pass is", config.EMAIL_PASS);
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
    // console.log("request body is", req.body);
    const { email } = req.body

    // Validate email
    const isValid = await isValidEmail(email)
    // console.log("is it valid email ?: ", isValid);
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
    // console.log("otp is", otp);

    // Store OTP in database
    await prisma.verifyOtp.create({
      data: {
        email,
        otp,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }
    })

    // Send OTP via email
    await sendOTPEmail(email, otp)

    res.status(200).json({ message: `OTP has been sent to ${email}` })
  } catch (error) {
    // console.error("Full error:", error)
    res.status(500).json({
      error: "Registration process failed",
      details: error.message
    })
  }
};

// TODO: Verify OTP with Email ID
// If OTP is invalid or expired, return error
// If OTP is not found, return error
// If OTP is valid and not expired:
// 1. return Success message
const handleEmailOtpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Find OTP record for this email
    const otpRecord = await prisma.verifyOtp.findUnique({
      where: {
        email
      }
    });

    // Check if OTP record exists
    if (!otpRecord) {
      return res.status(400).json({
        error: `No OTP is registered for this email: ${email}`,
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        error: "OTP has been expired. Please request for a new OTP.",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP provided",
      });
    }

    // Add boolean field in verifyOtp table to check if the OTP is verified or not
    await prisma.verifyOtp.update({
      where: {
        email
      },
      data: {
        isVerified: true
      }
    });
    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({
      error: "OTP verification failed",
      details: error.message
    });
  }
}

// TODO: Verify the Resend OTP with Email ID
// Here, we don't need to verify the email, since that is already verified.
// We just need to generate a new OTP and send it via email.
const handleResendOtp = async (req, res) => {
  try {
    const { email } = req.body
    // Generate OTP
    const newOtp = await generateOTP()
    // console.log("otp is", newOtp);

    // Update existing OTP record - single atomic update operation
    await prisma.verifyOtp.update({
      where: {
        email // Assuming email is unique field
      },
      data: {
        otp: newOtp,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });


    // Send OTP via email
    await sendOTPEmail(email, newOtp)

    res.status(200).json({ message: `New OTP has been sent to ${email}` })
  } catch (error) {
    res.status(500).json({
      error: "Failed to resend OTP",
      details: error.message 
    })
  }
};

// TODO: Implement the User Signup function
// Password and Confirm Password validation done by the Frontend
// Add new User to the database
const handleUserSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log("request is", req.body);
    const newUserDetails = await prisma.user.create(
    {
      data:
        {
          firstName,
          lastName,
          email,
          hashedPassword
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

// TODO: Implement the User Login function
// For login we only require email and password
// If email is not found, return error
// If password is incorrect, return error
// If email and password are correct:
// 1. Return success message
// 2. Store firstName, lastName, email, crypted password in Users table
const handleUserLogin = async (req, res) => {
  // TODO: Implement this function
  try {
    const { email, password } = req.body;

  } catch (error) {
  }

};

const handlePasswordReset = async (req, res) => {
  // TODO: Implement this function
};

module.exports = {
  generateOTP,
  isValidEmail,
  sendOTPEmail,
  handleUserEmailSignup,
  handleEmailOtpVerification,
  handleResendOtp,
  handleUserSignup,
  handleUserLogin,
  handlePasswordReset,
}