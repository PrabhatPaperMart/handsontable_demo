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

    // Return success response code 201 - Rsource Created
    res.status(200).json({ message: `OTP has been sent to ${email}` })
  } catch (error) {
    // Error code 500 - Server side error
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
    // Error code 500 - Server side error
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
    // Error code 500 - Server side error
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
    const newUserDetails = await prisma.user.create({
      data:
        {
          firstName,
          lastName,
          email,
          password: hashedPassword
        }
    });

    // Return success response code 201 - Rsource Created
    res.status(201).json(newUserDetails);

  } catch (error) {
    // Error code 500 - Server side error
    res.status(500).json({
      error: "User registration failed.",
      message: "Either the email is already taken or the request is invalid."
    });
  }
};

// TODO: Implement the User Login function
// For login we only require email and password
// If email is not found, return error
// If password is incorrect, return error
// If email and password are correct: Return success message
const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in Users table
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user not found
    if (!user) {
      return res.status(400).json({
        error: "Login failed",
        details: "Invalid email or password"
      });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Login failed",
        details: "Invalid email or password"
      });
    }

    // Remove password from the handleUserLogin response
    const { password: _, ...userWithoutPassword } = user;
    console.log("user is", user);
    console.log("user without password is", userWithoutPassword);
    // Return success response code - 200
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    // Error code 500 - Server side error
    return res.status(500).json({
      error: "Login failed",
      details: error.message
    });
  }
};

// TODO: Implement the Password Reset function
// For password reset:
// 1. Check if the email exists - if not, return error "Email does not exist"
// 2. If email exists, take the new password and update the password in the database
const handlePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const existingUser = await prisma.User.findUnique({
      where: { email }
    });

    // If user not found, return error
    if (!existingUser) {
      return res.status(404).json({
        error: "Email does not exist",
        message: "No user found with the provided email address"
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    await prisma.User.update({
      where: { email },
      data: { 
        password: hashedNewPassword 
      }
    });

    // Send success response code - 204
    res.status(204).json({
      message: "Password reset successful"
    });

  } catch (error) {
    // Error code 500 - Server side error
    return res.status(500).json({
      error: "Password reset failed",
      details: error.message
    });
  }
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