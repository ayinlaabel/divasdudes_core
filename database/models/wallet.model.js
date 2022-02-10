const mongoose = require('mongoose');
const _ = require('lodash');

//JWT secret
const jwtSecret = 'MySecret_Divasdudes'

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref:"user"
    },
    balance: {
        type: Number,
        default: 0
    }
});

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = { Wallet }