exports.handleServerErrors = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: 'Internal Server Error' });
};
