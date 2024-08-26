const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const db = require('../db/connection');
const endpointsData = require('../endpoints.json');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api', () => {
  it('responds with status 200 and documents all endpoints', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        console.log('Response Body:', body);
        console.log('Expected Data:', endpointsData);
        expect(body.endpoints).toEqual(endpointsData);
      });
  });
});

describe('/api/topics', () => {
  it('responds with status 200 and all topics with slug and description properties', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });

  describe('errors', () => {
    it('responds with status 404 and custom err msg for a non-existent endpoint', () => {
      return request(app)
        .get('/api/idonotexist')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "The page you're trying to access doesn't exist!"
          );
        });
    });
  });
});
