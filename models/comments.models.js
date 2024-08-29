const db = require('../db/connection');

exports.articleExists = (article_id) => {
  return db
    .query(
      `
          SELECT 1
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

exports.insertComment = (article_id, username, body) => {
  return this.articleExists(article_id).then((exists) => {
    if (!exists) {
      return Promise.reject({ status: 404, msg: 'Article Not Found' });
    }
    return db
      .query(
        `
        INSERT INTO comments (article_id, author, body, votes, created_at)
        VALUES ($1, $2, $3, 0, NOW())
        RETURNING *;
      `,
        [article_id, username, body]
      )
      .then(({ rows }) => rows[0])
      .catch((err) => {
        console.error('Database Error:', err);
        throw err;
      });
  });
};
