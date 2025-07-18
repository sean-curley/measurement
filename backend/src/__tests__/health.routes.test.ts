import request from 'supertest';
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => ({})) }));
import app from '../app';

describe('health check', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'NA' });
  });
});
