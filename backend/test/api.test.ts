import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/client.js';
import { seedCatalog } from '../src/db/seed.js';
import { createLogger } from '../src/lib/logger.js';

const env = loadEnv({
  NODE_ENV: 'test',
  JWT_SECRET: 'test-secret-that-is-long-enough-for-hs256',
  ADMIN_TOKEN: 'test-admin-token-0123456789',
  LOG_LEVEL: 'silent',
});

const customer = { name: 'Ada Obi', phone: '0803 123 4567' };
const address = { state: 'Lagos', city: 'Ikeja', street: '12 Allen Avenue' };

let api: ReturnType<typeof request>;

beforeEach(() => {
  const { db } = createDb(':memory:');
  seedCatalog(db);
  api = request(createApp({ db, env, logger: createLogger(env) }));
});

describe('catalogue', () => {
  it('lists products and filters by category', async () => {
    const all = await api.get('/v1/products').expect(200);
    const audio = await api.get('/v1/products?category=audio').expect(200);
    expect(all.body.data.length).toBeGreaterThan(audio.body.data.length);
    expect(audio.body.data.every((p: { category: string }) => p.category === 'audio')).toBe(true);
  });

  it('returns 404 for an unknown product', async () => {
    const res = await api.get('/v1/products/nope').expect(404);
    expect(res.body.error.code).toBe('not_found');
  });
});

describe('orders', () => {
  it('prices orders on the server and adds the delivery fee', async () => {
    const res = await api
      .post('/v1/orders')
      .send({
        customer,
        lines: [{ productId: 'oraimo-freepods-4', quantity: 2 }],
        fulfilment: 'delivery',
        address,
        payment: 'transfer',
      })
      .expect(201);

    expect(res.body.data).toMatchObject({ subtotal: 76_000, deliveryFee: 3_500, total: 79_500, status: 'placed' });
    expect(res.body.data.customer.phone).toBe('08031234567');
  });

  it('applies the storage upgrade price', async () => {
    const res = await api
      .post('/v1/orders')
      .send({
        customer,
        lines: [{ productId: 'iphone-17-pro', quantity: 1, storage: '512GB' }],
        fulfilment: 'pickup',
        payment: 'pay-on-delivery',
      })
      .expect(201);
    expect(res.body.data.total).toBe(2_480_000);
  });

  it('rejects orders larger than the stock', async () => {
    await api
      .post('/v1/orders')
      .send({ customer, lines: [{ productId: 'pixel-10-pro', quantity: 4 }], fulfilment: 'pickup', payment: 'transfer' })
      .expect(409);
  });

  it('only lets the store owner advance an order', async () => {
    const { body } = await api
      .post('/v1/orders')
      .send({ customer, lines: [{ productId: 'magsafe-clear-case', quantity: 1 }], fulfilment: 'pickup', payment: 'transfer' });

    await api.patch(`/v1/orders/${body.data.id}/status`).send({ status: 'confirmed' }).expect(403);
    const ok = await api
      .patch(`/v1/orders/${body.data.id}/status`)
      .set('Authorization', `Bearer ${env.ADMIN_TOKEN}`)
      .send({ status: 'confirmed' })
      .expect(200);
    expect(ok.body.data.status).toBe('confirmed');
  });
});

describe('trade', () => {
  const device = { modelId: 'iphone-13', storage: '128GB', grade: 'good', battery: 'above-90', hasBox: false };

  it('quotes a sale and a swap', async () => {
    const sell = await api.post('/v1/trade/quote').send({ device }).expect(200);
    const swap = await api.post('/v1/trade/quote').send({ device, targetProductId: 'iphone-15-uk' }).expect(200);
    expect(sell.body.data.offer).toBeGreaterThan(0);
    expect(swap.body.data.topUp).toBe(780_000 - swap.body.data.offer);
  });

  it('requires a target for swap requests', async () => {
    await api.post('/v1/trade/requests').send({ kind: 'swap', customer, device }).expect(400);
  });
});

describe('auth', () => {
  const account = { name: 'Ada Obi', username: 'Ada.Obi', email: 'ada@example.com', phone: '0803 123 4567', password: 'supersecret' };
  const deviceId = 'device-0123456789abcdef';

  async function signUp() {
    const res = await api.post('/v1/auth/register').send(account).expect(201);
    return res.body.data.token as string;
  }

  it('registers and signs in with a username or an email', async () => {
    await signUp();
    await api
      .post('/v1/auth/register')
      .send({ ...account, email: 'other@example.com' })
      .expect(409);
    await api.post('/v1/auth/login').send({ identifier: 'ada.obi', password: 'wrong-password' }).expect(401);

    const byEmail = await api.post('/v1/auth/login').send({ identifier: 'ADA@example.com', password: account.password }).expect(200);
    const me = await api.get('/v1/auth/me').set('Authorization', `Bearer ${byEmail.body.data.token}`).expect(200);
    expect(me.body.data).toMatchObject({ username: 'ada.obi', email: 'ada@example.com', phone: '08031234567' });
  });

  it('needs the password to turn fingerprint sign-in on or off', async () => {
    const token = await signUp();
    const auth = { Authorization: `Bearer ${token}` };
    await api.post('/v1/auth/biometric').set(auth).send({ deviceId, password: 'nope-nope' }).expect(401);
    await api.post('/v1/auth/biometric').send({ deviceId, password: account.password }).expect(401);

    const { body } = await api.post('/v1/auth/biometric').set(auth).send({ deviceId, password: account.password }).expect(201);
    await api.post('/v1/auth/biometric/login').send({ identifier: 'ada.obi', deviceId, secret: body.data.secret }).expect(200);

    await api.post('/v1/auth/biometric/disable').set(auth).send({ deviceId, password: account.password }).expect(204);
    await api.post('/v1/auth/biometric/login').send({ identifier: 'ada.obi', deviceId, secret: body.data.secret }).expect(401);
  });

  it('rejects fingerprint sign-in with the wrong username or a stale secret', async () => {
    const token = await signUp();
    await api
      .post('/v1/auth/register')
      .send({ ...account, username: 'someone', email: 'someone@example.com' })
      .expect(201);
    const auth = { Authorization: `Bearer ${token}` };
    const first = await api.post('/v1/auth/biometric').set(auth).send({ deviceId, password: account.password });
    const relinked = await api.post('/v1/auth/biometric').set(auth).send({ deviceId, password: account.password });

    await api.post('/v1/auth/biometric/login').send({ identifier: 'someone', deviceId, secret: relinked.body.data.secret }).expect(401);
    await api.post('/v1/auth/biometric/login').send({ identifier: 'ada.obi', deviceId, secret: first.body.data.secret }).expect(401);
    await api
      .post('/v1/auth/biometric/login')
      .send({ identifier: 'ada@example.com', deviceId, secret: relinked.body.data.secret })
      .expect(200);
  });
});
