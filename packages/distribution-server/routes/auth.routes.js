const express = require('express');

const router = express.Router();

const controller = require('../controllers/auth.controller');

router.post('/signUp', controller.signUp);

module.exports = router;
