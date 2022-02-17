const express = require('express');

const router = express.Router();
const controller = require('../controllers/tenantConfigFile.controller');

router.get('/configure-tenant', controller.getTenantConfigFile);

module.exports = router;
