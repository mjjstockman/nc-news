const express = require('express');
const app = express();

const { getTopics } = require('./controllers/topics.controllers');
const { handleCustomErrors } = require('./errors/handleCustomErrors');
const { handleServerErrors } = require('./errors/handleServerErrors');

app.get('/api/topics', getTopics);

app.use((req, res, next) => {
  res
    .status(404)
    .send({ msg: "The page you're trying to access doesn't exist!" });
});

app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
