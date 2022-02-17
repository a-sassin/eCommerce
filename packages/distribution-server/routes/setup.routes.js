const express = require('express');

const router = express.Router();

const controller = require('../controllers/setup.controller');

router.get('/getApplicationDetails/:id', controller.getApplicationDetails);

router.put(
    '/updateApplicationDetails/:id',
    controller.updateApplicationDetails
);

module.exports = router;
