const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default to 500 if status code not set
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  // Handle specific error types
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    return res.status(404).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    return res.status(400).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;