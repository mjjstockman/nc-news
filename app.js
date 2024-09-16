const express = require('express');
const app = express();
const cors = require('cors');

const {
  getEndpoints,
  getTopics,
  getArticles,
  getArticleById,
  patchArticleById,
  getCommentsByArticleId,
  postComment,
  deleteCommentById,
} = require('./controllers/index.controllers');

const {
  handlePostgresErrors,
  handleCustomErrors,
  handleServerErrors,
} = require('./errors/index.errors');

app.use(cors());
app.use(express.json());

app.get('/api', getEndpoints);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.patch('/api/articles/:article_id', patchArticleById);
app.post('/api/articles/:article_id/comments', postComment);
app.delete('/api/comments/:comment_id', deleteCommentById);

app.all('/*', (req, res, next) => {
  res
    .status(404)
    .send({ msg: "The page you're trying to access doesn't exist!" });
});

app.use(handlePostgresErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
