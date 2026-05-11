const bcrypt = require('bcryptjs');
const prisma = require('../../src/config/prisma');

async function resetAuthData() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser({
  name = 'Juan Perez',
  email = 'juan@example.com',
  password = 'secret123',
} = {}) {
  return prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  });
}

module.exports = {
  createUser,
  resetAuthData,
};
