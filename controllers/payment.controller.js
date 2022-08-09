const { response } = require("express");
const https = require("https");
const request = require("request");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// const mySecretKey = "Bearer sk_test_971b0fa295b00773efc4ea47e60afb8958af793d";

// const paymentController = (request) => {
//   const initializeTransaction = (form, myCallback) => {
//     // console.log(form);
//     const options = {
//       url: "https://api.paystack.co/transaction/initialize",
//       headers: {
//         Authorization: mySecretKey,
//         "Content-Type": "application/json",
//         "cache-control": "no-cache",
//       },

//       form,
//     };

//     const callback = (err, response, body) => {
//       return myCallback(err, body);
//     };

//     request.post(options, callback);
//   };

//   const verifyTransaction = (ref, myCallback) => {
//     // console.log(ref)
//     const options = {
//       url:
//         "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
//       headers: {
//         authorization: mySecretKey,
//         "content-type": "application/json",
//         "cache-control": "no-cache",
//       },
//     };
//     const callback = (err, response, body) => {
//       return myCallback(err, body);
//     };
//     request(options, callback);
//   };

//   const verifyPaymentUpdate = (reference) => {};

//   return { initializeTransaction, verifyTransaction };
// };

function generateTransactionReference(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const paymentController = {
  async createVisualAccount(details) {
    const account = await flw.VirtualAcct.create(details);
    // .then((account) => {
    // })
    // .catch((error) => res.status(400).send(error));
    return account.data;
  },

  bvnVerification(req, res, next) {
    const bvn = req.body;
    flw.Misc.bvn(bvn).then((response) => res.send(response));
  },
  async accountVerification(req, res, next) {
    const details = req.body;
    flw.Misc.verify_Account(details).then((accountDetails) => {
      res.send(accountDetails);
    });
  },
  makePaynment(req, res, next) {
    const details = {
      account_bank: "044",
      account_number: "0690000040",
      amount: 200,
      narration: "Payment for things",
      currency: "NGN",
      reference: generateTransactionReference(),
      callback_url: "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
      debit_currency: "NGN",
    };
    flw.Transfer.initiate(details).then(console.log).catch(console.log);
  },
  async bankTransfer(req, res, next) {
    const details = {
      tx_ref: "kraneabel@gmail.com",
      amount: "1500",
      email: "kraneabel@gmail.com",
      currency: "NGN",
    };
    const response = await flw.Charge.bank_transfer(details);
    console.log(response);
  },
};

module.exports = paymentController;
