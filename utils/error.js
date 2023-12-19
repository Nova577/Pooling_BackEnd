
class CustomError extends Error {
    constructor(name, message) {
        super(message)
        this.name = name
        Error.captureStackTrace(this, this.constructor)
    }
}

class HttpError extends Error {
    constructor(name, message, status) {
        super(message)
        this.name = name
        this.status = status
        Error.captureStackTrace(this, this.constructor)
    }
}

export {
    CustomError,
    HttpError
}