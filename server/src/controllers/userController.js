const prisma = require('../models');

exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { name, email } = req.body;
  const newUser = await prisma.user.create({ data: { name, email } });
  res.status(201).json(newUser);
};
