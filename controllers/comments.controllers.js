const {
  fetchCommentsByArticleId,
  articleExists,
  insertComment,
} = require('../models/comments.models');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(Number(article_id))) {
    return res.status(400).send({ msg: 'Invalid article ID' });
  }

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

  if (!username || !body) {
    return res.status(400).send({ msg: 'Username and comment are required' });
  }

  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      if (err.status) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then((deleteCount) => {
      if (deleteCount === 0) {
        return res.status(404).send({ msg: 'Comment not found' });
      }
      res.status(204).send();
    })
    .catch((err) => {
      console.error('Error deleting comment:', err);
      next(err);
    });
};
