const { Transaction } = require("../database/models/index");
const payment = {
  transactions(req, res, next) {
    const { amount, type, status, reference, note } = req.body;
    if (!amount) {
      console.log("Incorrect input try again");
    }
    const transaction = new Transaction({
      userId: req.userId,
      amount,
      transactionType: type,
      status,
      reference,
      description: note,
      date: new Date(),
    });

    transaction.save().then((transaction) => res.send(transaction));
  },
  createDuePayment(req, res, next) {
    const date = new Date().getDay();
    if (date === 0) {
    }
  },
};

module.exports = payment;
