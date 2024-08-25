exports.handlePostgresErrors = (err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad request: invalid input syntax.' });
  } else if (err.code === '23502') {
    res.status(400).send({ msg: 'Insertion error: not null violation.' });
  } else if (err.code === '23503') {
    res.status(404).send({ msg: 'Not found: foreign key violation.' });
  } else if (err.code === '23505') {
    res.status(409).send({
      msg: 'Conflict: duplicate key values not allowed.',
    });
  } else {
    next(err);
  }
};
