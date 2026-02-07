const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Validation error', details: error.details });
  }
  req.body = value;
  return next();
};

module.exports = { validate };
