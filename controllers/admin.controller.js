//**IMPORT MODELS */
const { User, Wallet, Transaction, PaymentDue } = require('../database/models/index');
const { getAllTransactions } = require('./wallet.controller');


const adminController =  {

    getAllUsers (req, res, mext) {
        User.find().then(
            (users) =>{
                res.status(200).send(users)
            }
        ).catch(
            (err) => console.log(err)
        )
    },
    getAllTransactions(req, res, next) {
        Transaction.find({}).then(
            (transactions)=> {
                res.status(200).send(transactions)
                // console.log(transactions.length)

            }
        ).catch(
            err => {throw err}
        )
    },

   async createPaymentDueDate(req, res, next){
        try {
            const due = req.body;

            const date = due.date;

            const paymentDueDate = {
                date
            }

            const paymentDue = new PaymentDue(paymentDueDate)

            paymentDue.save(paymentDueDate).then(
                ()=>{
                    console.log('Successfull')
                    res.status(201).send({msg:'Due Date Create'})
                }
            ).catch(
                (err) => console.log(err)
            )


        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = adminController;