const { handleCustomErrors } = require('../../errors/handleCustomErrors');

describe('handleCustomErrors', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();
  });

  it('responds with status 400 and custom err msg if err has status and msg properties', () => {
    const err = { status: 400, msg: 'Bad Request: Custom Error' };
    handleCustomErrors(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ msg: 'Bad Request: Custom Error' });
  });

  it('calls next(err) if err does not have status and msg properties', () => {
    const err = { message: 'An unexpected error occurred' };
    handleCustomErrors(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
