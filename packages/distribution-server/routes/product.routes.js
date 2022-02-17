const express = require('express');

const router = express.Router();

const controller = require('../controllers/product.controller');

router.get('/details', controller.getProducts);

router.get('/order-details', controller.getOrders);

router.patch('/add-product', controller.addProduct);

router.patch('/remove-product', controller.removeProduct);

router.patch('/add-orderId', controller.addOrderId);

router.get('/user-products', controller.getUserProducts);

router.get('/user-orders', controller.getUserOrders);

router.delete('/clear-cart', controller.clearCart);

module.exports = router;
