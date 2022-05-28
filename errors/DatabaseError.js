let DatabaseError = function (message, error) {
    Error.call(this, message);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'DatabaseError';
    this.message = message;
    this.status = 500;
    if (error) this.inner = error;
}

DatabaseError.prototype = Object.create(Error.prototype);
DatabaseError.prototype.constructor = DatabaseError;

module.exports = DatabaseError;