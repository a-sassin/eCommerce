const axios = require('axios');
const fs = require('fs');
const qs = require('qs');
const { tenantConfig } = require('../constants/constants');

function validateRequest(request, params) {
    let isInvalidRequest = Object.keys(params).some(
        (key) => !Object.keys(request).includes(key)
    );
    if (isInvalidRequest) return isInvalidRequest;

    const invalidArray = [null, undefined, 'null', 'undefined', ''];
    for (const key in params) {
        if (params[key] && invalidArray.includes(request[key])) {
            isInvalidRequest = true;
            break;
        }
    }
    return isInvalidRequest;
}

function getTenantInfo() {
    const defaultTenantInfo = [
        {
            TITLE: 'Default',
            AUTH_SERVER_BASE_URL: '',
            ISV_APP_ID: '',
            API_CLIENT_ID: '',
            API_CLIENT_SECRET: '',
            OIDC_REDIRECT_URI: '/oauth/callback',
            OIDC_BASE_URI: '',
            OIDC_CLIENT_ID: '',
            OIDC_CLIENT_SECRET: '',
            THEME_ID: '',
            DEFAULT: true,
        },
    ];
    let tenantInfo;
    try {
        tenantInfo = fs.readFileSync(tenantConfig, 'utf-8');
    } catch (err) {
        const tenantData = JSON.stringify(defaultTenantInfo, null, 4);
        fs.writeFileSync(tenantConfig, tenantData);

        return tenantData;
    }
    return JSON.parse(tenantInfo).find((arr) => arr.DEFAULT);
}

async function authorize(clientID, clientSecret, OIDC_BASE_URI) {
    try {
        const options = {
            method: 'POST',
            url: `${OIDC_BASE_URI}/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientID,
                client_secret: clientSecret,
                scope: 'openid',
            }),
        };
        const response = await axios(options);
        return response.data;
    } catch (err) {
        return err;
    }
}

async function getLoginDetails(email, password) {
    try {
        const tenantInfo = getTenantInfo();
        const loginoptions = {
            method: 'POST',
            url: `${tenantInfo.OIDC_BASE_URI}/token`,
            data: qs.stringify({
                client_id: tenantInfo.OIDC_CLIENT_ID,
                client_secret: tenantInfo.OIDC_CLIENT_SECRET,
                grant_type: 'password',
                username: email,
                password,
                scope: 'openid profile',
                response_type: 'id_token',
            }),
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded;charset=utf-8',
            },
        };
        const loginResponse = await axios(loginoptions);
        return { isSuccess: true, response: loginResponse.data, status: '200' };
    } catch (err) {
        if (err?.response?.data?.error_description) {
            return {
                isSuccess: false,
                response: err.response.data.error_description,
                status: err.response.status,
            };
        }
        return {
            isSuccess: false,
            response: err.response?.data?.detail,
            status: err.response?.status,
        };
    }
}

const cssToJson = (cssStr) => {
    if (!cssStr) return {};
    let tmp = '';
    let openBraces = 0;
    for (let i = 0; i < cssStr.length; i++) {
        const c = cssStr[i];
        if (c === '{') {
            openBraces++;
        } else if (c === '}') {
            openBraces--;
        }
        if (openBraces === 0 && c === ':') {
            tmp += '_--_';
        } else {
            tmp += c;
        }
    }
    cssStr = tmp;
    cssStr = cssStr.split('"').join("'");
    cssStr = cssStr.split(' ').join('_SPACE_');
    cssStr = cssStr.split('\r').join('');
    cssStr = cssStr.split('\n').join('');
    cssStr = cssStr.split('\t').join('');
    cssStr = cssStr.split('!important').join('');
    cssStr = cssStr.split('}').join('"}####"');
    cssStr = cssStr.split(';"').join('"');
    cssStr = cssStr.split(':').join('":"');
    cssStr = cssStr.split('{').join('":{"');
    cssStr = cssStr.split(';').join('","');
    cssStr = cssStr.split('####').join(',');
    cssStr = cssStr.split('_--_').join(':');
    cssStr = cssStr.split('_SPACE_').join(' ');
    if (cssStr.endsWith(',')) {
        cssStr = cssStr.substr(0, cssStr.length - 1);
    }
    if (cssStr.endsWith(',"')) {
        cssStr = cssStr.substr(0, cssStr.length - 2);
    }
    cssStr = `{"${cssStr}}`;
    try {
        const jsn = JSON.parse(cssStr);
        return jsn;
    } catch (e) {
        return null;
    }
};

const allowedCSSProps = ['color', 'backgroundColor', 'fontFamily'];

const JSToCSS = (jsObject) => {
    const result = Object.entries(jsObject)
        .filter(([key, value]) => !!value.selector)
        .map(([key, value]) => {
            return `${value.selector}{\n${Object.entries(value)
                .filter(([k, v]) => allowedCSSProps.includes(k))
                .map(
                    ([k, v]) =>
                        `  ${k
                            .replace(/[A-Z]/g, '-$&')
                            .toLowerCase()
                            .trim()}:${v};`
                )
                .join('\n')}\n}`;
        })
        .join('\n');
    return result;
};
async function getRefresh(refreshToken) {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'POST',
            url: `${tenantInfo.OIDC_BASE_URI}/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                scope: 'openid',
                client_id: tenantInfo.OIDC_CLIENT_ID,
                client_secret: tenantInfo.OIDC_CLIENT_SECRET,
            }),
        };
        const response = await axios(options);
        return { isSuccess: true, data: response.data, status: 200 };
    } catch (error) {
        if (error?.response?.data?.error_description) {
            return {
                isSuccess: false,
                data: `${error.response.data.error} ${error.response.data.error_description}`,
                status: error.response.status,
            };
        }
        return {
            isSuccess: false,
            data: `${error.response.statusText} ${error.response.data.error_description}`,
            status: error.response.status,
        };
    }
}

async function checkTokens(req, res, next) {
    const tenantInfo = getTenantInfo();
    if (req.session) {
        if (
            req.session.accessExpiresAt &&
            getTokenTime(req.session.accessExpiresAt) < getTime()
        ) {
            const response = await getRefresh(req.session.refreshToken);
            if (response.isSuccess) {
                req.session.accessToken = response.data.access_token;
                req.session.refreshToken = response.data.refresh_token;
                req.session.accessExpiresAt = getDate(
                    getTime() + (response.data.expires_in - 10) * 1000
                );
            } else {
                return res.status(response.status).send(response.data);
            }
        }
        if (
            req.session.apiAccessExpiresAt &&
            getTokenTime(req.session.apiAccessExpiresAt) < getTime()
        ) {
            const authBody = await authorize(
                tenantInfo.API_CLIENT_ID,
                tenantInfo.API_CLIENT_SECRET,
                tenantInfo.OIDC_BASE_URI
            );

            if (!authBody.access_token) {
                return res.status(400).send(authBody);
            }
            req.session.apiAccessExpiresAt = getDate(
                getTime() + (authBody.expires_in - 10) * 1000
            );
            req.session.apiAccessToken = authBody.access_token;
        }
    }
    return next();
}

function cors(app) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', process.env.CLIENT_ENDPOINT);
        res.header('Access-Control-Allow-Credentials', true);
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Origin,X-Requested-With,Content-Type,Accept,Authorization'
        );
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,DELETE,PATCH,OPTIONS'
        );
        next();
    });
}

function getTime() {
    return new Date().getTime();
}

function getTokenTime(tokenValue) {
    return new Date(tokenValue).getTime();
}

function getDate(time) {
    return new Date(time);
}

module.exports = {
    validateRequest,
    getTenantInfo,
    authorize,
    cssToJson,
    JSToCSS,
    getLoginDetails,
    getRefresh,
    checkTokens,
    cors,
};
