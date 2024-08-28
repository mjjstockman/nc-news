const db = require('../db/connection');

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT * FROM articles
        WHERE article_id = $1
        `,
      [article_id]
    )
    .then(({ rows: articles }) => {
      if (articles.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not Found' });
      }
      return articles[0];
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `
      SELECT 
        articles.author, 
        articles.title, 
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id)::INTEGER AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
      `
    )
    .then(({ rows: articles }) => {
      if (articles.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not Found' });
      }
      return articles;
    });
};
