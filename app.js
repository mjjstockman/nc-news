const express = require('express');
const app = express();

const { getEndpoints } = require('./controllers/endpoints.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticleById } = require('./controllers/articles.controllers');
const { handleCustomErrors } = require('./errors/handleCustomErrors');

app.get('/api', getEndpoints);
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleById);

app.use((req, res, next) => {
  res
    .status(404)
    .send({ msg: "The page you're trying to access doesn't exist!" });
});

app.use(handleCustomErrors);

module.exports = app;
