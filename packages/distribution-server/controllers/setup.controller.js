const axios = require('axios');
const { getTenantInfo } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.getApplicationDetails = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const url = tenantInfo.AUTH_SERVER_BASE_URL;
    const appID = req.params?.id || tenantInfo.ISV_APP_ID;
    const appConfig = {
        method: 'get',
        url: `${url}/v1.0/applications/${appID}`,
        headers: {
            Authorization: req.headers.authorization,
        },
    };

    try {
        const response = await axios(appConfig);
        res.status(201).send(response?.data);
    } catch (err) {
        const error = new ErrorClass(err, err?.response?.status || 500);
        next(error);
    }
};

module.exports.updateApplicationDetails = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const url = tenantInfo.AUTH_SERVER_BASE_URL;
    const appID = req.params?.id || tenantInfo.ISV_APP_ID;
    const { icon, defaultIcon, xforce, type, _links, ...payload } = req.body;
    payload.templateId = '1';
    const appConfig = {
        method: 'PUT',
        url: `${url}/v1.0/applications/${appID}`,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: req.headers.authorization,
        },
        data: payload,
    };

    try {
        const response = await axios(appConfig);
        res.status(201).send(response?.data);
    } catch (err) {
        const error = new ErrorClass(err, err?.response?.status || 500);
        next(error);
    }
};
