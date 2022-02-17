const express = require('express');

const router = express.Router();

const controller = require('../controllers/validation.controller');

router.post('/email', controller.validateIdentity);

module.exports = router;
