const express = require("express");
const router = express.Router();

//**IMPORT CONTROLLERS */
const walletCtrl = require("../controllers/wallet.controller");
const authCtrl = require("../controllers/auth.controller");

router.get("/", authCtrl.verifyToken, walletCtrl.getWallet);
router.get(
  "/allTransactions",
  authCtrl.verifyToken,
  walletCtrl.getAllTransactions
);

module.exports = router;
