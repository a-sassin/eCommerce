const fs = require('fs');
const path = require('path');
const { JSToCSS } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');
const { clientConfig, userJsonPath } = require('../constants/constants');

module.exports.saveConfig = async (req, res, next) => {
    try {
        fs.writeFileSync(
            path.join(
                __dirname,
                '../',
                '/distribution/assets/config/',
                'client-config.json'
            ),
            JSON.stringify(req.body, null, 4),
            'utf8'
        );
        fs.writeFileSync(
            path.join(__dirname, '..', 'distribution/assets/css', 'style.css'),
            JSToCSS(req.body),
            'utf8'
        );
        res.status(200).send(req.body);
    } catch (error) {
        const err = new ErrorClass(
            'Error occured while saving the config',
            500
        );
        next(err);
    }
};

module.exports.resetConfig = async (req, res, next) => {
    try {
        const configFilePath = path.join(
            __dirname,
            '../',
            '/distribution/assets/config/',
            'client-config.json'
        );
        fs.copyFileSync(
            path.join(
                __dirname,
                '../',
                '/distribution/assets/config/',
                'client-config-default.json'
            ),
            configFilePath
        );

        const resettedConfigFile = JSON.parse(fs.readFileSync(configFilePath));
        fs.writeFileSync(
            path.join(__dirname, '..', 'distribution/assets/css', 'style.css'),
            JSToCSS(resettedConfigFile),
            'utf8'
        );
        res.status(200).send({
            message: 'operation successfull!',
        });
    } catch (error) {
        console.log('error ', error);
        const err = new ErrorClass(error, 500);
        next(err);
    }
};

module.exports.getClientConfigFile = async (req, res, next) => {
    try {
        const file = JSON.parse(fs.readFileSync(clientConfig, 'utf-8'));

        res.status(200).send({
            data: file,
            status: 200,
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getUserJsonFile = async (req, res, next) => {
    try {
        const file = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));

        res.status(200).send({
            data: file,
            status: 200,
        });
    } catch (err) {
        next(err);
    }
};
