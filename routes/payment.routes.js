const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const userCtrl = require("../controllers/user.controller");
const paymentCtrl = require("../controllers/payment.controller");
const savingCtrl = require("../controllers/savings.controller");
const { route } = require("./user.routes");

//**IMPORT MODELS */
// const { User } = require('../database/models/index')

router.post("/", authCtrl.authenticate, userCtrl.payment);
router.post("/savings", authCtrl.verifyToken, savingCtrl.transactions);
router.post("/ref", userCtrl.getRef);
router.post("/createDuePayment", savingCtrl.createDuePayment);
router.post("/vac", paymentCtrl.createVisualAccount);
router.post("/payments", paymentCtrl.makePaynment);
router.post("/bank-transfer", paymentCtrl.bankTransfer);

//Verification Routes here
router.get("/account-verification", paymentCtrl.accountVerification);
router.get("/bvn", paymentCtrl.bvnVerification);

module.exports = router;
