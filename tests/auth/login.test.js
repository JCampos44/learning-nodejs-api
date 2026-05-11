const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const { createUser, resetAuthData } = require('./auth.helpers');

describe('Auth / login', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await resetAuthData();
  });

  afterAll(async () => {
    await resetAuthData();
    await prisma.$disconnect();
  });

  it('returns token and user when credentials are valid', async () => {
    const user = await createUser();

    const response = await request(app)
      .post('/api/login')
      .send({
        email: user.email,
        password: 'secret123',
      })
      .expect(200);

    expect(response.body.message).toBe('Login exitoso');
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.user).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('returns 400 when email or password missing', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'juan@example.com' })
      .expect(400);

    expect(response.body.message).toBe('email y password son requeridos');
  });

  it('returns 401 when credentials invalid', async () => {
    await createUser();

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'juan@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body.message).toBe('Credenciales inválidas');
  });
});
