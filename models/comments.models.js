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

exports.userExists = (username) => {
  return db
    .query(
      `
        SELECT 1
        FROM users
        WHERE username = $1
      `,
      [username]
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
  if (isNaN(Number(article_id))) {
    return Promise.reject({ status: 400, msg: 'Bad Request' });
  }

  return exports
    .articleExists(article_id)
    .then((articleExists) => {
      if (!articleExists) {
        return Promise.reject({ status: 404, msg: 'Article Not Found' });
      }
      return exports.userExists(username);
    })
    .then((userExists) => {
      if (!userExists) {
        return Promise.reject({ status: 404, msg: 'Username Not Found' });
      }
      return db.query(
        `
          INSERT INTO comments (article_id, author, body, votes, created_at)
          VALUES ($1, $2, $3, 0, NOW())
          RETURNING *;
        `,
        [article_id, username, body]
      );
    })
    .then(({ rows }) => rows[0])
    .catch((err) => {
      console.error('Database Error:', err);
      throw err;
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(
      `
    DELETE 
    FROM comments
    WHERE comment_id = $1
    RETURNING *;
    `,
      [comment_id]
    )
    .then(({ rowCount }) => {
      return rowCount;
    });
};
