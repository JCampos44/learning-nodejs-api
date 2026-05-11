const prisma = require('../config/prisma');

const TASK_STATUSES = ['PENDING', 'COMPLETED'];

function sanitizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    userId: task.userId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    deletedAt: task.deletedAt,
    completedAt: task.completedAt,
  };
}

function parseTaskId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function buildTaskData(body, { includeRequiredTitle = false } = {}) {
  const data = {};
  const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(body, 'description');
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');

  if (includeRequiredTitle || hasTitle) {
    if (!hasTitle || typeof body.title !== 'string' || !body.title.trim()) {
      return {
        error: 'title es requerido y debe ser un texto no vacío',
      };
    }

    data.title = body.title.trim();
  }

  if (hasDescription) {
    if (body.description !== null && typeof body.description !== 'string') {
      return {
        error: 'description debe ser texto o null',
      };
    }

    data.description =
      typeof body.description === 'string' ? body.description.trim() : null;
  }

  if (hasStatus) {
    if (!TASK_STATUSES.includes(body.status)) {
      return {
        error: 'status debe ser PENDING o COMPLETED',
      };
    }

    data.status = body.status;
    data.completedAt = body.status === 'COMPLETED' ? new Date() : null;
  }

  return { data };
}

async function listTasks(req, res) {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json({
    message: 'Tareas obtenidas correctamente',
    tasks: tasks.map(sanitizeTask),
  });
}

async function getTaskById(req, res) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      message: 'id de tarea inválido',
    });
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user.id,
      deletedAt: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: 'Tarea no encontrada',
    });
  }

  return res.status(200).json({
    message: 'Tarea obtenida correctamente',
    task: sanitizeTask(task),
  });
}

async function createTask(req, res) {
  const { data, error } = buildTaskData(req.body, {
    includeRequiredTitle: true,
  });

  if (error) {
    return res.status(400).json({
      message: error,
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: 'Tarea creada correctamente',
      task: sanitizeTask(task),
    });
  } catch (error) {
    console.error('Error en createTask:', error);

    return res.status(500).json({
      message: 'Error interno al crear la tarea',
    });
  }
}

async function updateTask(req, res) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      message: 'id de tarea inválido',
    });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user.id,
      deletedAt: null,
    },
  });

  if (!existingTask) {
    return res.status(404).json({
      message: 'Tarea no encontrada',
    });
  }

  const { data, error } = buildTaskData(req.body);

  if (error) {
    return res.status(400).json({
      message: error,
    });
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      message: 'Debes enviar al menos un campo para actualizar',
    });
  }

  if (!Object.prototype.hasOwnProperty.call(data, 'status')) {
    if (existingTask.status === 'COMPLETED') {
      data.completedAt = existingTask.completedAt;
    }
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data,
    });

    return res.status(200).json({
      message: 'Tarea actualizada correctamente',
      task: sanitizeTask(task),
    });
  } catch (error) {
    console.error('Error en updateTask:', error);

    return res.status(500).json({
      message: 'Error interno al actualizar la tarea',
    });
  }
}

async function completeTask(req, res) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      message: 'id de tarea inválido',
    });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user.id,
      deletedAt: null,
    },
  });

  if (!existingTask) {
    return res.status(404).json({
      message: 'Tarea no encontrada',
    });
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Tarea marcada como completada',
      task: sanitizeTask(task),
    });
  } catch (error) {
    console.error('Error en completeTask:', error);

    return res.status(500).json({
      message: 'Error interno al completar la tarea',
    });
  }
}

async function deleteTask(req, res) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      message: 'id de tarea inválido',
    });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user.id,
      deletedAt: null,
    },
  });

  if (!existingTask) {
    return res.status(404).json({
      message: 'Tarea no encontrada',
    });
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Tarea eliminada correctamente',
      task: sanitizeTask(task),
    });
  } catch (error) {
    console.error('Error en deleteTask:', error);

    return res.status(500).json({
      message: 'Error interno al eliminar la tarea',
    });
  }
}

module.exports = {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
};
