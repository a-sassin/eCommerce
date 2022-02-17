const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ErrorClass = require('../services/error.service');
const { userJsonPath } = require('../constants/constants');
const { getTenantInfo } = require('../services/commonUtilService');

const userDelete = async (baseUrl, userId, token) => {
    const options = {
        method: 'DELETE',
        url: `${baseUrl}/v2.0/Users/${userId}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        await axios(options);
        return true;
    } catch (err) {
        return false;
    }
};

const findAccount = async (baseUrl, patientNumber, token) => {
    const options = {
        method: 'get',
        url: `${baseUrl}/v2.0/Users?filter=urn:ietf:params:scim:schemas:extension:ibm:2.0:User:customAttributes.accountId eq "${patientNumber}" and active eq "true"`,
        headers: {
            'Content-Type': 'application/scim+json',
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios(options);
        if (response.data.totalResults) {
            return response.data.Resources[0].id;
        }
        return undefined;
    } catch (err) {
        return undefined;
    }
};

module.exports.deleteUser = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const isDeleted = await userDelete(
        tenantInfo.AUTH_SERVER_BASE_URL,
        req.session.profile.id,
        req.session.apiAccessToken
    );
    if (isDeleted) res.status(204).send('User account deleted');
    else {
        const err = new ErrorClass(
            `Error userId ${req.session.profile.id} may be already deleted or not existing`,
            500
        );
        next(err);
    }
};

module.exports.resetUsers = async (req, res, next) => {
    const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
    const tenantInfo = getTenantInfo();
    const baseUrl = tenantInfo.AUTH_SERVER_BASE_URL;
    const token = req.session.apiAccessToken;
    const newUserJson = [...userJson];

    userJson.forEach(async (user) => {
        const id = await findAccount(baseUrl, user.patientNumber, token);
        if (id) {
            const isDeleted = userDelete(baseUrl, id, token);
            if (isDeleted) delete newUserJson[user.patientNumber];
        }
    });
    if (JSON.stringify(userJson) !== JSON.stringify(newUserJson)) {
        try {
            fs.writeFileSync(
                path.join(userJsonPath),
                JSON.stringify(userJson, null, 4),
                'utf8'
            );
            res.status(200).send('Successfully reset the users');
        } catch (error) {
            const err = new ErrorClass(
                'Error occured while resetting the users',
                500
            );
            next(err);
        }
    }
    res.status(200).send('success');
};

module.exports.saveUserDetails = (req, res, next) => {
    const userData = req.body;
    const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
    if (!userExists(userData.patientNumber.toString(), userJson)) {
        userJson.push(userData);
        try {
            fs.writeFileSync(
                path.join(userJsonPath),
                JSON.stringify(userJson, null, 4),
                'utf8'
            );
            res.status(200).send('Successfully added the user');
        } catch (error) {
            const err = new ErrorClass(
                'Error occured while adding the user',
                500
            );
            next(err);
        }
    } else {
        const err = new ErrorClass('Patient number already exists', 403);
        next(err);
    }
};
function userExists(patientNumber, userJson) {
    if (userJson.length) {
        const userFound = userJson.find(
            (user) => user.patientNumber === patientNumber
        );
        return userFound;
    }
    return false;
}

module.exports.saveUsers = (req, res, next) => {
    const userData = req.body;
    try {
        if (!userData || !userData.length) {
            const err = new ErrorClass(
                'Wrong or Invalid data is being sent',
                400
            );
            return next(err);
        }
        fs.writeFileSync(
            userJsonPath,
            JSON.stringify(userData, null, 4),
            'utf8'
        );
        return res.status(200).send({
            message: 'User-Identities updated successfully!',
            status: 200,
        });
    } catch (error) {
        const err = new ErrorClass('Error occured while saving the data', 500);
        return next(err);
    }
};
