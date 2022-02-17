const express = require('express');

const router = express.Router();

const controller = require('../controllers/dpcm.controller');

router.post('/data-subject', controller.dataSubject);
router.post('/data-usage', controller.dataUsage);
router.patch('/data-consents', controller.dataConsents);

module.exports = router;
