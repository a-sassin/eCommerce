const { getTenantInfo } = require('../services/commonUtilService');

module.exports.getTenantConfigFile = async (req, res, next) => {
    try {
        const defaultConfig = getTenantInfo();
        res.status(200).send({
            data: defaultConfig,
            status: 200,
        });
    } catch (err) {
        next(err);
    }
};
