const express = require('express');
const router = express.Router();

//**IMPORT CONTROLLERS */
const adminCtrl = require('../controllers/admin.controller')



router.get('/', (req, res, next) => {
    console.log('me')
})

router.get('/users', adminCtrl.getAllUsers)
router.get('/transactions', adminCtrl.getAllTransactions)

router.post('/createPaymentDueDate', adminCtrl.createPaymentDueDate);

module.exports = router;