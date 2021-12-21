const {
  body,
  query,
  param
} = require('express-validator');

module.exports = {
  create: [
    body('message').exists().withMessage('message is required').isString().withMessage('message should be string'),
    body('level').customSanitizer(value => value || 'info').exists().isIn(['info','warning','error']),
    body('start').exists().withMessage('start is required').isISO8601({strict: true, }).bail().withMessage('Must be ISO8601 string').customSanitizer(value => value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)[0]),
    body('end').exists().withMessage('end is required').isISO8601({strict: true, }).bail().withMessage('Must be ISO8601 string').customSanitizer(value => value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)[0]),
    body('show_weekly').customSanitizer(value => value || false).exists().isBoolean().withMessage('Must be boolean').customSanitizer(value => value || false),
    body('show_monthly').customSanitizer(value => value || false).exists().isBoolean().withMessage('Must be boolean').customSanitizer(value => value || false),
    body('sticky').customSanitizer(value => value || false).exists().isBoolean().withMessage('Must be boolean'), 
  ],
  read: [
    query('start').optional({checkFalsy: true}).isISO8601({strict: true, }).withMessage('Must be ISO8601 string'),
    query('end').optional({checkFalsy: true}).isISO8601({strict: true, }).withMessage('Must be ISO8601 string'),
    query('show_weekly').customSanitizer(value => value || false).exists().isBoolean().withMessage('Must be boolean').customSanitizer(value => value || false),
    query('show_monthly').customSanitizer(value => value || false).exists().isBoolean().withMessage('Must be boolean').customSanitizer(value => value || false),
  ],
  update: [
    param('id').exists().withMessage('id is required').isInt(),
    body('message').optional({checkFalsy: true}).isString().withMessage('message should be string'),
    body('start').optional({checkFalsy: true}).isISO8601({strict: true, }).bail().withMessage('Must be ISO8601 string').customSanitizer(value => value ? value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)[0] : undefined),
    body('end').optional({checkFalsy: true}).isISO8601({strict: true, }).bail().withMessage('Must be ISO8601 string').customSanitizer(value => value ? value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)[0] : undefined),
    body('show_weekly').optional({checkFalsy: true}).isBoolean(),
    body('show_monthly').optional({checkFalsy: true}).isBoolean(),
    body('sticky').optional({checkFalsy: true}).isBoolean(),
    body('level').optional({checkFalsy: true}).isIn(['info','warning','error'])
  ],
  delete: [
    param('id').exists().isInt()
  ]
};