const { body, validationResult } = require('express-validator');

const submitValidators = [
  body('type').isString().notEmpty().withMessage('Type required'),
  body('title').isString().notEmpty().withMessage('Title required'),
  body('description').optional().isString(),
  body('priority').optional().isInt({ min: 1, max: 3 }),
];

const statusValidators = [
  body('state').isIn(['waiting', 'active', 'completed', 'failed']).withMessage('Invalid state'),
  body('adminNote').optional().isString()
];

const commentValidators = [
  body('text').isString().notEmpty().withMessage('Comment required')
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

module.exports = { submitValidators, statusValidators, commentValidators, runValidation };
