const express = require('express');
const app = express();

const { getEndpoints } = require('./controllers/endpoints.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const {
  getArticles,
  getArticleById,
  patchArticleById,
} = require('./controllers/articles.controllers');
const {
  getCommentsByArticleId,
  postComment,
} = require('./controllers/comments.controllers');

const { handleCustomErrors } = require('./errors/handleCustomErrors');

app.use(express.json());

app.get('/api', getEndpoints);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.patch('/api/articles/:article_id', patchArticleById);

app.post('/api/articles/:article_id/comments', postComment);

app.use((req, res, next) => {
  res
    .status(404)
    .send({ msg: "The page you're trying to access doesn't exist!" });
});

app.use(handleCustomErrors);

module.exports = app;
