const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const { createUser, resetAuthData } = require('./auth.helpers');

describe('Auth / logout', () => {
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

  it('revokes token and blocks protected route', async () => {
    const user = await createUser();

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: user.email,
        password: 'secret123',
      })
      .expect(200);

    const token = loginResponse.body.token;

    const logoutResponse = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(logoutResponse.body.message).toBe('Logout exitoso');
    expect(logoutResponse.body.tokenRevoked).toBe(true);

    const meResponse = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(meResponse.body.message).toBe('Token inválido o expirado');
  });

  it('returns 401 when bearer token missing', async () => {
    const response = await request(app)
      .post('/api/logout')
      .expect(401);

    expect(response.body.message).toBe('Bearer token requerido');
  });
});
