const express = require('express');

const router = express.Router();

const multer = require('multer');

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'distribution/assets/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'distribution/assets/images/productImages');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const imageUpload = multer({ storage: imageStorage });
const productUpload = multer({ storage: productStorage });

const controller = require('../controllers/themes.controller');

router.post('/saveConfig', controller.saveConfig);

router.post('/resetConfig', controller.resetConfig);

router.get('/configure-client', controller.getClientConfigFile);

router.post('/uploadImage', imageUpload.single('file'), (req, res) => {
    return res.send(req.file);
});

router.post('/uploadProduct', productUpload.single('file'), (req, res) => {
    return res.send(req.file);
});

router.get('/user-json', controller.getUserJsonFile);

module.exports = router;
