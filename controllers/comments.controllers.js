const {
  fetchCommentsByArticleId,
  articleExists,
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
