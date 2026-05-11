const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../config/jwt');
const { isTokenBlacklisted } = require('../config/token-blacklist');

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function authMiddleware(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: 'Bearer token requerido',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (isTokenBlacklisted(payload.jti)) {
      return res.status(401).json({
        message: 'Token inválido o expirado',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(payload.sub),
        deletedAt: null,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no autorizado',
      });
    }

    req.auth = payload;
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
    req.token = token;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
}

module.exports = authMiddleware;
