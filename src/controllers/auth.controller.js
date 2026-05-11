const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

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
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: sanitizeUser(user),
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

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'email y password son requeridos',
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error en login:', error);

    return res.status(500).json({
      message: 'Error interno al iniciar sesión',
    });
  }
}

module.exports = {
  login,
  register,
};
