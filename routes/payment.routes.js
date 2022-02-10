const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');
const paymentCtrl = require('../controllers/payment.controller');

//**IMPORT MODELS */
// const { User } = require('../database/models/index')

router.post('/', authCtrl.authenticate, userCtrl.payment)
router.post('/ref', userCtrl.getRef)
router.get('/verify/:ref', authCtrl.authenticate, userCtrl.getPayment)

module.exports = router;