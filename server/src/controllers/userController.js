const prisma = require('../models');

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  console.log("users is", users);
  res.json(users);
};

const createUser = async (req, res) => {
  // No implementation
};

module.exports = {
  getUsers,
  createUser,
}