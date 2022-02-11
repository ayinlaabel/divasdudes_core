const { response } = require('express');
const jwt = require('jsonwebtoken');
const _ = require('lodash')
const request = require('request');


//**IMPORT MODELS */
const { User, Wallet, Transaction, PaymentDue } = require('../database/models/index')
const { initializeTransaction, verifyTransaction } = require('./payment.controller')(request);


const userController = {
    registerPost(req, res) {
        //register user

        let body = req.body;
        let newUser = new User(body);
        User.findOne({email: body.email}).then(
            email => {
                if(email) {
                    res.status(400).send('This email is already registered.')
                }
            }
        ).catch(
            err => {
                console.log(err)
            }
        )
        newUser.save().then(
            (user) => {
                const userId = user.id
                let wallet = new Wallet();
                wallet.userId = userId;
                wallet.save()
                return newUser.createSession()
            }
        ).then(
            (refreshToken) => {
                //Session created successfully - refreshToken returned.
                //now we generate an access auth token for the user.

                return newUser.generateAccessAuthToken().then(
                    (accessToken) => {
                        //access auth token generated successfully, now we return an object containing  the auth token
                        return { accessToken, refreshToken }
                    }
                ).then(
                    (authToken) => {
                        //Now we construct and send  the response to the user with their auth tokens in the headerand the user object in the body

                        res
                            .header('x-refresh-token', authToken.refreshToken)
                            .header('x-access-token', authToken.accessToken)
                            .send(newUser);
                    }
                ).catch(
                    (err) => {
                        res.status(400).send("ERROR: err")
                    }
                );
            }
        )
    },


    loginPost(req, res) {
        let email = req.body.email;
        let password = req.body.password;

        User.findByCredentials(email, password).then(
            (user, err) => {

                if (!user) {
                    res.status(400).send("Invalid Credentials")
                } else {
                    Wallet.findOne({userId: user.id}).then(
                        (wallet, err) =>{
                            if (!wallet) {
                                let newWallet = new Wallet();

                                newWallet.userId = user.id;

                                newWallet.save();
                            }
                        }
                    ).catch(
                        (err) => console.log(err)
                    )

                    return user.createSession().then(
                        (refreshToken) => {
                            //Session created successfully - refreshToken returned.
                            //now we generate an access auth token for the user. 

                            return user.generateAccessAuthToken().then(
                                (accessToken) => {
                                    //access auth token generated successfully, now we return an object containing  the auth token
                                    return { accessToken, refreshToken }
                                }
                            ).then(
                                (authToken) => {
                                    //Now we construct and send  the response to the user with their auth tokens in the headerand the user object in the body

                                    res
                                        .header('x-refresh-token', authToken.refreshToken)
                                        .header('x-access-token', authToken.accessToken)
                                        .send(user);
                                }
                            ).catch(
                                (err) => {
                                    res.status(400).send(err)
                                }
                            );
                        }
                    ).catch(
                        (err) => console.log(err)
                    )
                }

            }
        ).catch(
            err => {
                console.log(err)
                res.status(400).send(err)
            }
        )

    },

    getProfile(req, res, next) {
        let userId = req.user_id;
        User.findById({ _id: userId }).then(
            (user) => {
                res.status(200).send(user)
            }
        )
    },

    updateProfile(req, res, next) {
        let userId = req.user_id;

        User.findByIdAndUpdate({ _id: userId }, {
            $set: req.body
        }).then(
            () => {
                res.send({ 'msg': 'Profile Updated Successfully!' })
            }
        )
    },


    payment(req, res, next) {

        const form = _.pick(req.body, ['amount', 'email', 'paymentType'])

        form.amount = form.amount * 100;

        let amount = form.amount;

        let tType = '';
        let description = '';
        let img = '';


        if (form.paymentType === 'wallet') {
            tType = 'deposit';
            description = 'You just deposit into your wallet'
             img = 'https://res.cloudinary.com/kraneabel/image/upload/v1643365493/divasdudes/hand-taking-out-money-wallet-vector-hand-taking-out-money-wallet-vector-illustration-198843248_lg2j0o.jpg'

        }

        if (form.paymentType === 'savings') {
            tType = 'savings';
             description = 'You just pay for your thrift'
              img = 'https://res.cloudinary.com/kraneabel/image/upload/v1643365493/divasdudes/illustration-character-saving-money-safe_53876-37248_sir3kb.jpg'
        }



        initializeTransaction(form, (err, body) => {
            // console.log(form);
            if (err) {
                console.log(err);
                return;
            }



            let data = JSON.parse(body)
            // response = JSON.parse(body);
            let url = data.data;
            // console.log(data);
            newTransaction = {
                reference: data.data.reference,
                amount: (amount / 100),
                date: Date.now(),
                transactionType: tType,
                description: description,
                status: 'Pending',
                image: img,
                email: form.email,
                url: url.authorization_url,
                userId: req.user_id
            }

            const transaction = new Transaction(newTransaction)

            transaction.save().then(
                () => {
                    if (err) console.log(err)

                    // console.log('Save successafully!')
                }
            ).catch(
                (err) => {
                    console.log(err)
                }
            )
            res.status(200).send(url)
            // console.log(data.data)
        })
    },

    async getPayment(req, res, next) {

        const take = req.params;
        const ref = take.ref;
        // console.log(ref);
        verifyTransaction(ref, async (err, body) => {
            // if (err) {
            //     //handle errors appropriately
            //     console.log(err)
            //     // return res.redirect('/error');
            // }
            let vp = JSON.parse(body);
            const data = _.at(vp.data, ['reference', 'amount', 'customer.email']);

            [reference, amount, email] = data;

            // console.log(vp)
            // let getAmount = amount;

            // let query = { status: vp.data.status };

            // transaction.update(query);
            // console.log(transaction)


            Wallet.findOne({ userId: req.user_id }).then(
                (wallet) => {

                    wallet.balance = wallet.balance + (amount / 100);

                    wallet.save();

                }
            )

            Transaction.findOne({ reference: vp.data.reference }).then(
                (transaction)=>{
                    transaction.status = vp.data.status;
                    transaction.save();

                }
            )



            // console.log(newTransaction)
        })
    },

    getRef(req, res, next) {

        const ref = req.body.rrr;
        // console.log(ref, req.body)
        res.redirect('/payment/verify/' + ref)
    },

    getDueDate(req, res, next) {
        PaymentDue.findOne().then(
            (date) => {
                // console.log(date)
                res.status(200).send(date)
            }
        )
    }
}

module.exports = userController