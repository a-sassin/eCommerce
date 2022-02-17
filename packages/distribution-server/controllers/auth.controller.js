const axios = require('axios');
const { getLoginDetails } = require('../services/commonUtilService');

const {
    validateRequest,
    authorize,
    getTenantInfo,
} = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.signUp = async (req, res, next) => {
    try {
        const isInvalidRequest = validateRequest(req.body, {
            password: true,
            firstName: true,
            lastName: true,
            email: true,
        });
        if (isInvalidRequest) {
            throw new ErrorClass(
                'Bad Request. Either missing or Invalid request data',
                400
            );
        }

        const tenantInfo = getTenantInfo();
        const data = req.body;

        let { apiAccessToken } = req.session;
        if (!req.session.apiAccessToken) {
            const authBody = await authorize(
                tenantInfo.API_CLIENT_ID,
                tenantInfo.API_CLIENT_SECRET,
                tenantInfo.OIDC_BASE_URI
            );

            if (!authBody || !authBody.access_token) {
                throw new ErrorClass('Incorrect tenant data', 400);
            }
            apiAccessToken = authBody.access_token;
            req.session.apiAccessExpiresAt = new Date(
                new Date().getTime() + (authBody.expires_in - 10) * 1000
            );
            req.session.apiAccessToken = apiAccessToken;
        }

        const userInfo = {
            schemas: [
                'urn:ietf:params:scim:schemas:core:2.0:User',
                'urn:ietf:params:scim:schemas:extension:ibm:2.0:User',
                'urn:ietf:params:scim:schemas:extension:ibm:2.0:Notification',
            ],
            userName: data.email,
            name: {
                givenName: data.firstName,
                familyName: data.lastName,
            },
            preferredLanguage: 'en-US',
            active: true,
            emails: [
                {
                    value: data.email,
                    type: 'work',
                },
            ],
            password: data.password,
            'urn:ietf:params:scim:schemas:extension:ibm:2.0:Notification': {
                notifyType: 'NONE',
                notifyManager: false,
            },
        };

        const options = {
            method: 'post',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Users`,
            headers: {
                usershouldnotneedtoresetpassword: 'true',
                'Content-Type': 'application/scim+json',
                Authorization: `Bearer ${apiAccessToken}`,
            },
            data: userInfo,
        };
        const response = await axios(options);

        const loginDetails = await getLoginDetails(data.email, data.password);

        const profile = {
            id: response.data.id,
            displayName: `${data.firstName} ${data.lastName}`,
            username: data.email,
            name: {
                familyName: data.firstName,
                givenName: data.lastName,
            },
            emails: [{ value: data.email }],
        };

        req.session.accessToken = loginDetails.response.access_token;
        req.session.profile = profile;
        req.session.passport = profile;

        if (loginDetails.isSuccess) {
            req.session.accessExpiresAt = new Date(
                new Date().getTime() +
                    (loginDetails.response.expires_in - 10) * 1000
            );
            res.status(201).send({
                status: 201,
                id: response.data.id,
                data: {
                    profile,
                    accessToken: loginDetails.response.access_token,
                    apiAccessToken,
                },
            });
        } else {
            throw new ErrorClass(loginDetails.response, loginDetails.status);
        }
    } catch (err) {
        let error;
        if (
            err.response &&
            err.response.status &&
            err.response.status === 409
        ) {
            error = new ErrorClass(
                'User with given email already exists, Please login',
                403
            );
        } else if (
            err.response &&
            err.response.data &&
            err.response.data.detail
        ) {
            error = new ErrorClass(
                err.response.data.detail,
                err.response.status
            );
        } else if (err.response) {
            error = new ErrorClass(
                err.response.statusText,
                err.response.status
            );
        } else {
            error = err;
        }
        next(error);
    }
};
