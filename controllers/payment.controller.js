const { response } = require('express')
const https = require('https')
const request = require('request')


const mySecretKey = 'Bearer sk_test_971b0fa295b00773efc4ea47e60afb8958af793d'

const paymentController = (request) => {

   const initializeTransaction =  (form, myCallback)  => {
        // console.log(form);
            const options = {
                url: 'https://api.paystack.co/transaction/initialize',
                headers: {
                    Authorization: mySecretKey,
                    'Content-Type': 'application/json',
                    'cache-control': 'no-cache'
                },

                form
            }

            const callback = (err, response, body) => {
                return myCallback(err, body)
            }

           request.post(options, callback);
        
    }

    const  verifyTransaction = (ref, myCallback) => {
        // console.log(ref)
            const options = {
                url : 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),
                headers : {
                    authorization: mySecretKey,
                    'content-type': 'application/json',
                    'cache-control': 'no-cache'
               }
            }
            const callback = (err, response, body)=>{
                return myCallback(err, body);
            }
            request(options, callback);
        }

    const verifyPaymentUpdate = (reference) => {

    }

    return {initializeTransaction, verifyTransaction}
}

module.exports = paymentController