const prisma = require('../models');

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

const handleUserLogin = async (req, res) => {
 // TODO: Implement this function
};

const handlePasswordReset = async (req, res) => {
  // TODO: Implement this function
};

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handlePasswordReset,
}