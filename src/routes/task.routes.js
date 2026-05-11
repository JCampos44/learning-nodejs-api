const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} = require('../controllers/task.controller');

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: List tasks
 *     description: Return authenticated user tasks.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks list
 *       401:
 *         description: Unauthorized
 */
router.get('/tasks', listTasks);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create task
 *     description: Create a task for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Comprar pan
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Ir al supermercado
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - COMPLETED
 *                 example: PENDING
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/tasks', createTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get task
 *     description: Return a task owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/tasks/:id', getTaskById);

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update task
 *     description: Update title, description or status of a task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Comprar leche
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Ir al supermercado
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - COMPLETED
 *                 example: COMPLETED
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put('/tasks/:id', updateTask);

/**
 * @openapi
 * /api/tasks/{id}/complete:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Complete task
 *     description: Mark a task as completed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task completed
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.patch('/tasks/:id/complete', completeTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete task
 *     description: Soft delete a task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:id', deleteTask);

module.exports = router;
