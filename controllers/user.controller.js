const { response } = require("express");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const request = require("request");
const bcrypt = require("bcryptjs");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

//**IMPORT MODELS */
const {
  User,
  Wallet,
  Transaction,
  PaymentDue,
} = require("../database/models/index");

const paymentCtrl = require("./payment.controller");

// const { initializeTransaction, verifyTransaction } =
//   require("./payment.controller")(request);

const userController = {
  async registerPost(req, res) {
    //register user
    let body = req.body;
    let newUser = new User(body);
    User.findOne({ email: body.email }).then(async (email) => {
      if (email) {
        res.status(400).send({
          status: "FAILED",
          error: "This email is already registered.",
        });
      } else {
        const details = {
          email: body.email,
          narative: body.firstName + " " + body.lastName + "/divasdudes",
          tx_ref: body.email,
          bvn: body.bvn,
        };
        const account = await paymentCtrl.createVisualAccount(details);
        console.log(account);
        if (!account) {
          res.status(500).send({ msg: "Something went wrong1!", account });
        } else {
          const user = await newUser.save();
          let newWallet = new Wallet({
            userId: user.id,
            account_name: user.firstName + " " + user.lastName + "/divasdudes",
            account_number: account.account_number,
            bank: account.bank_name,
          });
          newWallet.save();
          res.status(201).send({ user, account });
        }
        // const userId = user.id;
        // let wallet = new Wallet();
        // wallet.userId = userId;
        // wallet.save();
        // return newUser.createSession();
      }
    });
  },

  async loginPost(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email })
      .then(async (user) => {
        if (!user) {
          res.send({ status: "FAILED", error: "No user found!" });
        } else {
          const hash = await bcrypt.compare(password, user.password);

          if (!hash) {
            res.send({
              status: "FAILED",
              error: "Wrong Password, try agian!",
            });
          } else {
            Wallet.findOne({ userId: user.id }).then(async (wallet, err) => {
              if (!wallet) {
                let newWallet = new Wallet();

                newWallet.userId = user.id;

                newWallet.save();
              }
              user
                .createSession()
                .then((refreshToken) => {
                  //Session created successfully - refreshToken returned.
                  //now we generate an access auth token for the user.

                  return user
                    .generateAccessAuthToken()
                    .then((accessToken) => {
                      //access auth token generated successfully, now we return an object containing  the auth token
                      return { accessToken, refreshToken };
                    })
                    .then((authToken) => {
                      //Now we construct and send  the response to the user with their auth tokens in the header and the user object in the body
                      let i = user.sessions.length;
                      console.log(i);
                      res.status(200).json({
                        status: "SUCCESS",
                        password: user.sessions,
                        user,
                        token: authToken.accessToken,
                      });
                    })
                    .catch((err) => {
                      //   res.status(400).json(err);
                      console.log(err);
                    });
                })
                .catch((err) => console.log(err));
            });
          }

          // else {
          //   Wallet.findOne({ userId: user.id })
          //     .then((wallet, err) => {
          //       if (!wallet) {
          //         let newWallet = new Wallet();

          //         newWallet.userId = user.id;

          //         newWallet.save();
          //       }
          //       res.status(200).json({ status: "SUCCESS", user });
          //     })
          //     .catch((err) => res.send(err));

          //   //   return user
          //   //     .createSession()
          //   //     .then((refreshToken) => {
          //   //       //Session created successfully - refreshToken returned.
          //   //       //now we generate an access auth token for the user.

          //   //       return user
          //   //         .generateAccessAuthToken()
          //   //         .then((accessToken) => {
          //   //           //access auth token generated successfully, now we return an object containing  the auth token
          //   //           return { accessToken, refreshToken };
          //   //         })
          //   //         .then((authToken) => {
          //   //           //Now we construct and send  the response to the user with their auth tokens in the header and the user object in the body

          //   //           res
          //   //             .header("x-refresh-token", authToken.refreshToken)
          //   //             .header("x-access-token", authToken.accessToken)
          //   //             .send(user);
          //   //         })
          //   //         .catch((err) => {
          //   //           //   res.status(400).json(err);
          //   //           console.log(err);
          //   //         });
          //   //     })
          //   //     .catch((err) => console.log(err));
          // }
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  },

  getProfile(req, res, next) {
    let userId = req.user_id;
    User.findById({ _id: userId }).then((user) => {
      res.status(200).send(user);
    });
  },

  updateProfile(req, res, next) {
    let userId = req.user_id;

    User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: req.body,
      }
    ).then(() => {
      res.send({ msg: "Profile Updated Successfully!" });
    });
  },

  payment(req, res, next) {
    const form = _.pick(req.body, ["amount", "email", "paymentType"]);

    form.amount = form.amount * 100;

    let amount = form.amount;

    let tType = "";
    let description = "";
    let img = "";

    if (form.paymentType === "wallet") {
      tType = "deposit";
      description = "You just deposit into your wallet";
      img =
        "https://res.cloudinary.com/kraneabel/image/upload/v1643365493/divasdudes/hand-taking-out-money-wallet-vector-hand-taking-out-money-wallet-vector-illustration-198843248_lg2j0o.jpg";
    }

    if (form.paymentType === "savings") {
      tType = "savings";
      description = "You just pay for your thrift";
      img =
        "https://res.cloudinary.com/kraneabel/image/upload/v1643365493/divasdudes/illustration-character-saving-money-safe_53876-37248_sir3kb.jpg";
    }

    initializeTransaction(form, (err, body) => {
      // console.log(form);
      if (err) {
        console.log(err);
        return;
      }

      let data = JSON.parse(body);
      // response = JSON.parse(body);
      let url = data.data;
      // console.log(data);
      newTransaction = {
        reference: data.data.reference,
        amount: amount / 100,
        date: Date.now(),
        transactionType: tType,
        description: description,
        status: "pending",
        image: img,
        email: form.email,
        url: url.authorization_url,
        userId: req.user_id,
      };

      const transaction = new Transaction(newTransaction);
      let wallet = Wallet.findOne({ userId: req.user_id }).then((wallet) => {
        console.log(wallet);
      });
      if (!wallet || wallet.length < 1) {
        console.log("No wallet");
        let wallet = new Wallet();
        wallet.userId = req.user_id;
        wallet.save();
      }

      transaction
        .save()
        .then(() => {
          if (err) console.log(err);

          // console.log('Save successafully!')
        })
        .catch((err) => {
          console.log(err);
        });
      res.status(200).send(url);
      // console.log(data.data)
    });
  },

  getRef(req, res, next) {
    const ref = req.body.rrr;
    // console.log(ref, req.body)

    verifyTransaction(ref, async (err, body) => {
      let vp = JSON.parse(body);
      console.log(vp);
      const data = _.at(vp.data, ["reference", "amount", "customer.email"]);

      [reference, amount, email] = data;

      Wallet.findOne({ userId: req.user_id })
        .then((wallet) => {
          console.log(amount);
          console.log(wallet);
          console.log("Has Wallet");
          wallet.balance = wallet.balance + amount / 100;

          wallet.save().then((wallet) => console.log(wallet));
        })
        .catch((err) => {
          res.status(400).send("Something went wrong!");
        });

      Transaction.findOne({ reference: vp.data.reference }).then(
        (transaction) => {
          transaction.status = vp.data.status;
          transaction.save();
        }
      );

      // console.log(newTransaction)
    });
  },

  getDueDate(req, res, next) {
    PaymentDue.findOne().then((date) => {
      // console.log(date)
      res.status(200).send(date);
    });
  },
};

module.exports = userController;
