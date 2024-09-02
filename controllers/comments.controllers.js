const {
  fetchCommentsByArticleId,
  articleExists,
  insertComment,
  removeCommentById,
} = require('../models/comments.models');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  // not needed??
  if (isNaN(Number(article_id))) {
    return res.status(400).send({ msg: 'Invalid article ID' });
  }

  articleExists(article_id)
    // I like the use of a check exists function, but you should not be manually respond with the error like this. The check exists function show reject with an error and allow the catch to deal with it. Once this refactor has been done it also means we should be able to use a Promise.all(...) instead of a .then(...) chain as well.
    // We should also already have a model that tells us if an article id exists (HINT: from a previous task/endpoint)
    // not needed??
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

  if (isNaN(Number(comment_id))) {
    return res.status(400).send({ msg: 'Bad Request' });
  }

  removeCommentById(comment_id)
    .then((deleteCount) => {
      if (deleteCount === 0) {
        return res.status(404).send({ msg: 'Comment Not Found' });
      }
      res.status(204).send();
    })
    .catch((err) => {
      console.error('Error deleting comment:', err);
      next(err);
    });
};
