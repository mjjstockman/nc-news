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
});

describe('/api/articles', () => {
  it('responds with status 200 and an array of articles without the body property, sorted by date in ascending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy('created_at', { descending: true });
        articles.forEach((article) => {
          expect(article).not.toHaveProperty('body');
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });

  describe('/api/articles/:article_id', () => {
    it('responds with status 404 for a valid but non-existent article ID', () => {
      return request(app)
        .get('/api/articles/99999')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe('Not Found');
        });
    });

    it('responds with status 400 for an invalid article ID', () => {
      return request(app)
        .get('/api/articles/astring')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe('Invalid article ID');
        });
    });

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
});

describe('/api/articles/:article_id/comments', () => {
  it('responds with status 200 and all comments for an existing article with the correct properties', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);
        expect(comments).toBeSortedBy('created_at', { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });

  it('responds with status 200 and all comments for an existing article with the correct properties', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);
        expect(comments).toBeSortedBy('created_at', { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });

  it('responds with status 200 and an empty array when there are no comments for a valid article', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });

  it('responds with status 404 and a message for a non-existent article', () => {
    return request(app)
      .get('/api/articles/999999/comments')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article not found');
      });
  });
});
