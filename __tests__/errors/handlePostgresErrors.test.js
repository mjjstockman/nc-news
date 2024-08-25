const { handlePostgresErrors } = require('../../errors/handlePostgresErrors');

describe('handlePostgresErrors', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('responds with status 400 and custom err msg if error code=22P02 (invalid input syntax)', () => {
    const err = { code: '22P02' };

    handlePostgresErrors(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      msg: 'Bad request: invalid input syntax.',
    });
  });

  it('responds with status 400 and custom err msg if error code=23502 (not null violation)', () => {
    const err = { code: '23502' };

    handlePostgresErrors(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      msg: 'Insertion error: not null violation.',
    });
  });

  it('responds with status 404 and custom err msg if error code=23503 (foreign key violation)', () => {
    const err = { code: '23503' };

    handlePostgresErrors(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      msg: 'Not found: foreign key violation.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds with status 409 and custom err msg if error code=23505 (duplicate key violation)', () => {
    const err = { code: '23505' };

    handlePostgresErrors(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      msg: 'Conflict: duplicate key values not allowed.',
    });
  });

  it('calls next(err) if error code is unknown', () => {
    const err = { code: 'unknown' };

    handlePostgresErrors(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
