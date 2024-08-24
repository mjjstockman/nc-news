const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const db = require('../db/connection');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api/topics', () => {
  it('GET:200 gets all topics with a slug and description properties', () => {
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
    it('GET:404 sends appropriate error message for a non-existent endpoint', () => {
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
