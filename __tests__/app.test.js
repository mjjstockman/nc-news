const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const db = require('../db/connection');
const endpointsData = require('../endpoints.json');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('General API Endpoints', () => {
  describe('/api', () => {
    it('GET: responds with status 200 and documents all endpoints', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsData);
        });
    });
  });

  describe('Errors', () => {
    // Nice test! Just remember that you don't need to check this type of error again, once is fine 👍
    // DON'T NEED TO TEST ANY OTHER INCORRECT ENDPOINT??
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
  describe('GET /api/topics', () => {
    it('responds with status 200 and all topics with slug and description properties', () => {
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
});

describe('/api/articles', () => {
  describe('GET /api/articles', () => {
    it('responds with status 200 and an array of articles without the body property, sorted by date in descending order', () => {
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
  });

  describe('GET /api/articles/:article_id', () => {
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
          expect(res.body.msg).toBe('Bad request: invalid input syntax.');
        });
    });

    it('responds with status 200 and an article object with the correct properties and values', () => {
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

    describe('PATCH /api/articles/:article_id', () => {
      it('responds with status 200 and the updated article', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 5 })
          .expect(200)
          .then(({ body: { article } }) => expect(article.votes).toBe(105));
      });
    });
  });

  describe('/api/articles/:article_id/comments', () => {
    describe('GET /api/articles/:article_id/comments', () => {
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
                article_id: 1, // Nice first test, but we should be specifically asserting the article_id as this is what shows us if the query works as expect, if we actually are getting all comments linked to the article we expect.
                author: expect.any(String),
                votes: expect.any(Number),
              });
              // I think it's up to you as to whether you want to keep this in. It does work and I can see why you've done it, but essentially as long as we know a "created_at" value is there (as per line 177) then it's fine without this. 🙂
              // ASK ABOUT THE TIME DIFFERENCE, thought solved by adding in package.json??
              // Only need to test for created_at when specifically looking at created_at??
              expect(comment.created_at).toEqual(expect.any(String));
              expect(new Date(comment.created_at).toISOString()).toBe(
                comment.created_at
              );
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

      it('responds with status 400 and a message for an invalid article ID', () => {
        return request(app)
          .get('/api/articles/iamnotvalid/comments')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('Invalid article ID');
          });
      });
    });

    describe('POST /api/articles/:article_id/comments', () => {
      it('responds with status 201 and the posted comment', () => {
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

      it('responds with status 404 and a message for a non-existent article_id', () => {
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

      it('responds with status 400 and a message for an invalid article_id', () => {
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

      it('responds with status 404 and a message for a non-existent username', () => {
        const newComment = {
          username: 'notAUser',
          body: 'super post!',
        };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(404)
          .then(({ body: { msg } }) => expect(msg).toBe('Username Not Found'));
      });

      it('responds with status 400 and a message when "body" is missing in the request', () => {
        const newComment = { username: 'butter_bridge' };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(400)
          .then(({ body: { msg } }) =>
            expect(msg).toBe('Username and comment are required')
          );
      });

      it('responds with status 400 and a message when "username" is missing in the request', () => {
        const newComment = { body: 'super post!' };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(400)
          .then(({ body: { msg } }) =>
            expect(msg).toBe('Username and comment are required')
          );
      });
    });
  });
});

// ASK........ best way to structure the describe/it blocks?????????
describe('/api/comments', () => {
  describe('DELETE /api/comments/:comment_id', () => {
    it('responds with status 204 and deletes the comment by ID', () => {
      return request(app).delete('/api/comments/1').expect(204);
    });

    it('responds with status 404 and a message for a valid but non-existent comment ID', () => {
      return request(app)
        .delete('/api/comments/999999')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Comment Not Found');
        });
    });

    it('responds with status 400 and a message for an invalid comment ID', () => {
      return request(app)
        .delete('/api/comments/nonsense')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Bad Request');
        });
    });
  });
});
