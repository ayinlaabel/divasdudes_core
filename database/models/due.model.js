const mongoose = require('mongoose');
const _ = require('lodash');

//JWT secret
const jwtSecret = 'MySecret_Divasdudes'

const paymentDueSchema = new mongoose.Schema({
    date:{
        type: String,
        required: true
    }
});

const PaymentDue = mongoose.model('PaymentDue', paymentDueSchema)

module.exports = { PaymentDue }