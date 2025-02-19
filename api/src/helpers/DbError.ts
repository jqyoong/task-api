class DbError extends Error {
  code?: number;
  statusCode: number;

  constructor(
    err: Error & {
      code?: number;
    }
  ) {
    super(err.message);
    this.code = err.code;
    this.statusCode = 500;
    this.stack = err.stack;
  }
}

export default DbError;
