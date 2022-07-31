const { response } = require("express");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const request = require("request");
const { authenticate } = require("../controllers/auth.controller");
const authCtrl = require("../controllers/auth.controller");

//**IMPORT MODELS */
const { User, Wallet, Transaction } = require("../database/models/index");
const { initializeTransaction, verifyTransaction } =
  require("./payment.controller")(request);

let auth = authCtrl.authenticate;

const walletController = {
  async getAllTransactions(req, res, next) {
    let token = req.header("x-access-token");
    console.log(token);
    let decoded = await jwt.verify(token, User.getJwtSecret());

    let query = { userId: decoded.userInfo._id };
    Transaction.find(query)
      .then((transactions) => {
        res.status(200).send(transactions);
        // console.log(transactions);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async getWallet(req, res, next) {
    let query = { userId: req.userId };

    Wallet.findOne(query)
      .then((wallet) => {
        // console.log(wallet)
        if (!wallet) {
          let newWallet = new Wallet();

          newWallet.userId = decoded.userInfo._id;

          newWallet.save();
        }

        res.status(200).send(wallet);
      })
      .catch((err) => console.log(err));
  },
};

module.exports = walletController;
