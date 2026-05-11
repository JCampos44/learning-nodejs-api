const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'name, email y password son requeridos',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese email',
      });
    }

    console.error('Error en register:', error);

    return res.status(500).json({
      message: 'Error interno al registrar el usuario',
    });
  }
}

module.exports = {
  register,
};
