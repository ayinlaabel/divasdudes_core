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
};

module.exports = payment;
