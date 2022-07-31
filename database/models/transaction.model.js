const mongoose = require('mongoose');
const _ = require('lodash');


const transactionSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    amount: {
        type: String
    },
    date: {
        type: Date,
    },
    description: {
        type: String
    },
    transactionType: {
        type: String
    },
    status:{
        type: String
    },
    reference: {
        type: String
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = { Transaction }