module.exports = {
  ...require('./handlePostgresErrors'),
  ...require('./handleCustomErrors'),
  ...require('./handleServerErrors'),
};
