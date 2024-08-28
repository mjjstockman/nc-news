const { fetchArticleById } = require('../models/articles.models');
const { fetchArticles } = require('../models/articles.models');

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid article ID' });
  }

  fetchArticleById(article_id)
    .then((article) => {
      article.created_at = new Date(article.created_at).getTime();
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
