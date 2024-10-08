const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const db = require('../db/connection');
const endpointsData = require('../endpoints.json');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api', () => {
  it('GET: responds with status 200 and documents all endpoints', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsData);
      });
  });

  describe('errors', () => {
    it('GET: responds with status 404 and custom error message for a non-existent endpoint', () => {
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
  it('GET: responds with status 200 and all topics with slug and description properties', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics).toHaveLength(3);
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
  it('GET: responds with status 200 and an array of articles without the body property, sorted by date in descending order', () => {
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
    it('GET: responds with status 404 for a valid but non-existent article ID', () => {
      return request(app)
        .get('/api/articles/99999')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe('Not Found');
        });
    });

    it('GET: responds with status 400 for an invalid article ID', () => {
      return request(app)
        .get('/api/articles/astring')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe('Invalid article ID');
        });
    });

    it('GET: responds with status 200 and an article object with the correct properties and values', () => {
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
            created_at: expect.any(String),
            votes: 100,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          });
        });
    });
  });
});

describe('/api/articles/:article_id/comments', () => {
  it('GET: responds with status 200 and all comments for an existing article with the correct properties', () => {
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
          });
          expect(comment.created_at).toEqual(expect.any(String));
          expect(new Date(comment.created_at).toISOString()).toBe(
            comment.created_at
          );
        });
      });
  });

  it('GET: responds with status 200 and an empty array when there are no comments for a valid article', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });

  it('GET: responds with status 404 and a message for a non-existent article', () => {
    return request(app)
      .get('/api/articles/999999/comments')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article not found');
      });
  });

  it('GET: responds with status 400 and a message for an invalid article ID', () => {
    return request(app)
      .get('/api/articles/iamnotvalid/comments')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Invalid article ID');
      });
  });

  it('POST: responds with status 201 and the posted comment', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'super post!',
    };

    return request(app)
      .post('/api/articles/2/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: newComment.body,
          article_id: 2,
          author: newComment.username,
          votes: 0,
          created_at: expect.any(String),
        });
        expect(new Date(body.comment.created_at).toISOString()).toBe(
          body.comment.created_at
        );
      });
  });

  test('POST: responds with status 404 and a message for a non-existent article_id', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'super post!',
    };
    return request(app)
      .post('/api/articles/999999/comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe('Article Not Found'));
  });

  test('POST: responds with status 404 and a message for an invalid article_id', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'super post!',
    };
    return request(app)
      .post('/api/articles/notvalid/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe('Bad Request'));
  });

  test('POST: responds with status 404 and a message for a non-existent username', () => {
    const newComment = {
      username: 'idonotexist',
      body: 'super post!',
    };
    return request(app)
      .post('/api/articles/2/comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe('Username Not Found'));
  });
  test('POST: responds with status 404 and a message if body is missing', () => {
    const newComment = {
      username: 'butter_bridge',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) =>
        expect(msg).toBe('Username and comment are required')
      );
  });

  test('POST: responds with status 404 and a message if username is missing', () => {
    const newComment = {
      body: 'super post!',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) =>
        expect(msg).toBe('Username and comment are required')
      );
  });
});

describe('GET: /api/articles/:article_id', () => {
  it('GET: responds with status 404 and a message if the article_id does not exist', () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe('Not Found'));
  });

  it('GET: responds with status 400 and a message if the article_id is invalid', () => {
    return request(app)
      .get('/api/articles/invalid')
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe('Invalid article ID'));
  });
  describe('PATCH: /api/articles/:article_id', () => {
    it('PATCH: responds with status 200 and the updated article when adding to votes', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 5 })
        .expect(200)
        .then(({ body: { article } }) => expect(article.votes).toBe(105));
    });

    it('PATCH: responds with status 200 and the updated article when removing votes', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -5 })
        .expect(200)
        .then(({ body: { article } }) => expect(article.votes).toBe(95));
    });

    it('PATCH: responds with status 400 and the updated article when removing votes', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -5 })
        .expect(200)
        .then(({ body: { article } }) => expect(article.votes).toBe(95));
    });

    it('PATCH: responds with status 400 and a message if the article_id is invalid', () => {
      return request(app)
        .patch('/api/articles/invalid')
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe('Invalid article ID'));
    });

    it('PATCH: responds with status 404 and a message if the article_id is valid but non-existent', () => {
      return request(app)
        .patch('/api/articles/99999')
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe('Article Not Found'));
    });

    it('PATCH: responds with status 400 and a message if inc_votes is not a number', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 'imnotanumber' })
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe('Bad Request'));
    });
  });
});

describe('/api/comments/:comment_id', () => {
  it('DELETE: responds with status 204 and deletes comment by Id', () => {
    return request(app).delete('/api/comments/1').expect(204);
  });

  it('DELETE: responds with status 404 and a message if comment_id is valid but non-existent', () => {
    return request(app)
      .delete('/api/comments/9999')
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe('Comment Not Found'));
  });

  it('DELETE: responds with status 400 and a message if comment_id is invalid', () => {
    return request(app)
      .delete('/api/comments/not-a-number')
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe('Bad Request'));
  });
});
