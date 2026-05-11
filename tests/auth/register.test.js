const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');

describe('Auth / register', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('creates user and hashes password', async () => {
    const payload = {
      name: 'Juan Perez',
      email: 'juan@example.com',
      password: 'secret123',
    };

    const response = await request(app)
      .post('/api/register')
      .send(payload)
      .expect(201);

    expect(response.body.message).toBe('Usuario registrado correctamente');
    expect(response.body.user).toMatchObject({
      name: payload.name,
      email: payload.email,
    });
    expect(response.body.user).not.toHaveProperty('password');

    const userInDb = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb.name).toBe(payload.name);
    expect(await bcrypt.compare(payload.password, userInDb.password)).toBe(true);
  });

  it('returns 400 when required fields missing', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'juan@example.com' })
      .expect(400);

    expect(response.body.message).toBe('name, email y password son requeridos');
  });

  it('returns 409 when email exists', async () => {
    await prisma.user.create({
      data: {
        name: 'Juan Perez',
        email: 'juan@example.com',
        password: await bcrypt.hash('secret123', 10),
      },
    });

    const response = await request(app)
      .post('/api/register')
      .send({
        name: 'Juan Perez 2',
        email: 'juan@example.com',
        password: 'secret123',
      })
      .expect(409);

    expect(response.body.message).toBe('Ya existe un usuario con ese email');
  });
});
