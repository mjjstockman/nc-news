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
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsData);
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

  describe('GET /api/articles/:article_id', () => {
    it('should return 404 for a valid but non-existent article ID', () => {
      return request(app)
        .get('/api/articles/99999')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe('Not Found');
        });
    });

    it('should return 400 for an invalid article ID', () => {
      return request(app)
        .get('/api/articles/astring')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe('Invalid article ID');
        });
    });
  });

  describe('errors', () => {
    it('responds with status 404 and custom err msg for a non-existent endpoint', () => {
      return request(app)
        .get('/api/idonotexist')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("The page you're trying to access doesn't exist!");
        });
    });
  });
});

describe('/api/articles/:article_id', () => {
  it('responds with status 200 and an article obj with the correct properties and values', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: 1594329060000,
          votes: 100,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });
});
