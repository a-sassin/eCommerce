const express = require('express');

const router = express.Router();

const controller = require('../controllers/user.controller');

router.delete('/delete', controller.deleteUser);
router.delete('/reset', controller.resetUsers);
router.post('/save-users', controller.saveUsers);
router.post('/save-details', controller.saveUserDetails);

module.exports = router;
