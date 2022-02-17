const fs = require('fs');
const ErrorClass = require('../services/error.service');
const { userJsonPath, clientConfig } = require('../constants/constants');

module.exports.getProducts = (req, res, next) => {
    try {
        const productJson = JSON.parse(
            fs.readFileSync(clientConfig, 'utf-8')
        ).products;
        if (!req.query.productId) {
            return res.status(200).send(productJson);
        }
        const product = productJson.find(
            (item) => item.productId === req.query.productId
        );
        return res.status(200).send({
            data: product,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports.getOrders = (req, res, next) => {
    try {
        const productJson = JSON.parse(
            fs.readFileSync(clientConfig, 'utf-8')
        ).products;
        if (!req.query.orderIds) {
            return res.status(200).send(productJson);
        }
        const product = productJson.find(
            (item) => item.productId === req.query.orderIds
        );
        return res.status(200).send({
            data: product,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports.addProduct = (req, res, next) => {
    try {
        const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        const { username, productId } = req.body;

        const userInfoIndex = findIndex(userJson, username);

        if (userInfoIndex === -1) {
            userJson.push({
                username,
                productsIds: [...productId],
                orderIds: [],
            });

            fs.writeFileSync(
                userJsonPath,
                JSON.stringify(userJson, null, 4),
                'utf-8'
            );

            return res.status(200).send({
                message: 'Product added successfully',
                status: 200,
            });
        }

        if (
            userJson[userInfoIndex].productsIds &&
            userJson[userInfoIndex].productsIds.length >= 1
        ) {
            throw new ErrorClass(
                'Cannot add more than one product into cart',
                400
            );
        }

        productId.forEach((product) => {
            if (!userJson[userInfoIndex].productsIds.includes(product)) {
                userJson[userInfoIndex].productsIds.push(product);
            } else {
                throw new ErrorClass('Product already added to cart', 400);
            }
        });

        fs.writeFileSync(
            userJsonPath,
            JSON.stringify(userJson, null, 4),
            'utf-8'
        );

        return res.status(200).send({
            message: 'Product added successfully',
            status: 200,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports.removeProduct = (req, res, next) => {
    try {
        const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        const { username } = req.body;

        const userInfoIndex = findIndex(userJson, username);

        if (userInfoIndex >= 0) {
            userJson[userInfoIndex].productsIds.shift(0);

            fs.writeFileSync(
                userJsonPath,
                JSON.stringify(userJson, null, 4),
                'utf-8'
            );

            res.status(200).send({
                message: 'Product removed successfully',
                status: 200,
            });
        } else {
            throw new ErrorClass('Product does not exists', 400);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.addOrderId = (req, res, next) => {
    try {
        const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        const { username, orderId } = req.body;
        const userInfoIndex = findIndex(userJson, username);

        if (!userJson[userInfoIndex]?.productsIds.includes(orderId)) {
            throw new ErrorClass('Product does not exists', 400);
        } else {
            userJson[userInfoIndex].orderIds.push(orderId);
            userJson[userInfoIndex].productsIds.pop(orderId);
        }

        fs.writeFileSync(
            userJsonPath,
            JSON.stringify(userJson, null, 4),
            'utf-8'
        );

        return res.status(200).send({
            message: 'Product ordered successfully',
            status: 200,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports.getUserProducts = (req, res, next) => {
    try {
        const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        const { username } = req.query;

        const userInfoIndex = findIndex(userJson, username);

        if (userInfoIndex === -1) {
            return res.status(200).send({
                data: [],
                status: 200,
            });
        }

        return res.status(200).send({
            data: userJson[userInfoIndex].productsIds,
            status: 200,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports.getUserOrders = (req, res, next) => {
    try {
        const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        const { username } = req.query;

        const userInfoIndex = findIndex(userJson, username);

        if (userInfoIndex === -1) {
            return res.status(200).send({
                data: [],
                status: 200,
            });
        }

        return res.status(200).send({
            data: userJson[userInfoIndex],
            status: 200,
        });
    } catch (err) {
        return next(err);
    }
};

function findIndex(userJson, username) {
    return userJson.findIndex((user) => user.username === username);
}

module.exports.clearCart = (req, res, next) => {
    const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
    const updatedUserJson = userJson.filter((user) => {
        return user.username !== req.query.username;
    });
    try {
        fs.writeFileSync(
            userJsonPath,
            JSON.stringify(updatedUserJson),
            'utf-8'
        );
        res.status(200).send({
            message: "Successfully cleared the cart and order id's",
            status: 200,
        });
    } catch (err) {
        next(err);
    }
};
