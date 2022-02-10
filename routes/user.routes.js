const express = require('express');
const router = express.Router();


//**IMPORT CONTROLLERS */
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');

//**IMPORT MODELS */
// const { User } = require('../database/models/index')

router.get('/', (req, res)=> {
    res.send();
}) 
router.get('/verify', authCtrl.verifySession, authCtrl.refreshToken)
router.get('/logout', authCtrl.authenticateLogout)
router.get('/profile', authCtrl.authenticate, userCtrl.getProfile)
router.get('/paymentDueDate', userCtrl.getDueDate)


router.post('/',userCtrl.registerPost) 
router.post('/login', userCtrl.loginPost)

router.patch('/updateProfile', authCtrl.authenticate, userCtrl.updateProfile)

module.exports = router;