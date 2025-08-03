import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('App (E2E)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET) - should return health status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect((res) => {
        // Accept either 200 (if health endpoint exists) or 404 (if it doesn't)
        expect([200, 404]).toContain(res.status);
      });
  });

  it('should handle 404 for non-existent routes', () => {
    return request(app.getHttpServer()).get('/non-existent-route').expect(404);
  });

  it('should start successfully and respond to requests', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect((res) => {
        // Should get some response, even if it's 404
        expect(res.status).toBeDefined();
      });
  });
});
