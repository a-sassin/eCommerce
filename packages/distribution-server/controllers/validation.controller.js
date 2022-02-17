const axios = require('axios');
const ErrorClass = require('../services/error.service');
const { getTenantInfo } = require('../services/commonUtilService');

module.exports.validateIdentity = async (req, res, next) => {
    const tenantInfo = getTenantInfo();

    const options = {
        method: 'get',
        url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Users?filter=urn:ietf:params:scim:schemas:core:2.0:User:userName eq "${req.body.email}" and active eq "true"`,
        headers: {
            'Content-Type': 'application/scim+json',
            Authorization: req.headers.authorization,
        },
    };
    try {
        const response = await axios(options);
        if (response.data.totalResults) {
            return res.status(200).send({
                status: 200,
                response: response.data.Resources[0].userName,
            });
        }
        return res.status(200).send({
            status: 200,
            response: 'No Account Found',
        });
    } catch (error) {
        const err = new ErrorClass(
            error?.response?.body,
            error?.response?.status
        );
        return next(err);
    }
};
