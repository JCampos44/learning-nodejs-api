const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { login, logout, register } = require('../controllers/auth.controller');

const router = Router();

/**
 * @openapi
 * /api/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register user
 *     description: Create new user with name, email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Perez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', register);

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticate user and return JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @openapi
 * /api/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Revoke current JWT token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authMiddleware, logout);

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Current user
 *     description: Return authenticated user info.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Usuario autenticado',
    user: req.user,
  });
});

module.exports = router;
