const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Signal } = require('../models');
const { authenticate } = require('../middleware');

const router = express.Router();

const createSignalValidation = [
  body('agent_id')
    .notEmpty()
    .withMessage('Agent ID is required'),
  body('signal_type')
    .isIn(['HRV', 'GSR', 'respiration', 'temperature', 'heart_rate'])
    .withMessage('Signal type must be one of: HRV, GSR, respiration, temperature, heart_rate'),
  body('timestamp')
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO date'),
  body('payload.raw')
    .isArray()
    .withMessage('Payload raw data must be an array'),
  body('payload.avg')
    .isNumeric()
    .withMessage('Payload average must be a number'),
  body('payload.sdnn')
    .optional()
    .isNumeric()
    .withMessage('Payload SDNN must be a number'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be a valid JSON object')
];

const getSignalsValidation = [
  query('signal_type')
    .optional()
    .isIn(['HRV', 'GSR', 'respiration', 'temperature', 'heart_rate'])
    .withMessage('Invalid signal type filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['timestamp', '-timestamp', 'signal_type', '-signal_type'])
    .withMessage('Sort must be one of: timestamp, -timestamp, signal_type, -signal_type')
];

router.post('/', authenticate, createSignalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { agent_id, signal_type, timestamp, payload, context = {} } = req.body;

    const signal = new Signal({
      user_id: req.user._id,
      agent_id,
      signal_type,
      timestamp,
      payload,
      context
    });

    await signal.save();

    res.status(201).json({
      success: true,
      message: 'Signal created successfully',
      data: {
        signal
      }
    });
  } catch (error) {
    console.error('Create signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/', authenticate, getSignalsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      signal_type,
      page = 1,
      limit = 10,
      sort = '-timestamp'
    } = req.query;

    const filter = { user_id: req.user._id };

    if (signal_type) {
      filter.signal_type = signal_type;
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);

    const signals = await Signal.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Signal.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Signals retrieved successfully',
      data: {
        signals,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const signal = await Signal.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    res.json({
      success: true,
      message: 'Signal retrieved successfully',
      data: {
        signal
      }
    });
  } catch (error) {
    console.error('Get signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


router.delete('/:id', authenticate, async (req, res) => {
  try {
    const signal = await Signal.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    res.json({
      success: true,
      message: 'Signal deleted successfully'
    });
  } catch (error) {
    console.error('Delete signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;