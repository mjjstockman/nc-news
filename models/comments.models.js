const db = require('../db/connection');

exports.articleExists = (article_id) => {
  return db
    .query(
      `
          SELECT *
          FROM articles
          WHERE article_id = $1
        `,
      [article_id]
    )
    .then(({ rows }) => {
      return rows.length > 0;
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
        SELECT 
          *
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
        `,
      [article_id]
    )
    .then(({ rows: comments }) => {
      return comments;
    });
};
