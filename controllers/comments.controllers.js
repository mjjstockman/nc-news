const {
  fetchCommentsByArticleId,
  articleExists,
  insertComment,
} = require('../models/comments.models');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  articleExists(article_id)
    .then((exists) => {
      if (!exists) {
        return res.status(404).send({ msg: 'Article not found' });
      }
      return fetchCommentsByArticleId(article_id);
    })
    .then((comments) => {
      if (comments) {
        res.status(200).send({ comments });
      }
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  // Validate input
  if (!username || !body) {
    return res.status(400).send({ msg: 'Username and comment are required' });
  }

  // Insert comment into the database
  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      if (err.status) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        next(err); // Handle unexpected errors
      }
    });
};
