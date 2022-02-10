const express = require('express');
const jwt = require('jsonwebtoken');

const { mongoose } = require('./database/mongoose');

const bodyParser = require('body-parser');

const userRoute = require('./routes/user.routes');
const paymentRoute = require('./routes/payment.routes');
const walletRoute = require('./routes/wallet.routes');
const adminRoute = require('./routes/admin.routes');
const { User } = require('./database/models');
const auth = require('./controllers/auth.controller');
const req = require('express/lib/request');

const dotenv = require('dotenv');
dotenv.config();

const app = express();


//** MIDDLEWARE */
//load middleware
app.use(bodyParser.json());

//CORS HEADER MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Credentials", "true");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

// app.use(async function (req, res, next) {
//     let token = req.header('x-access-token')

//     if (token === null) {
//         console.log('You dont have a token');
//         next()
//     } else {
//         //    const decoded = await 
//         jwt.verify(token, User.getJwtSecret(), (err, decoded) => {
//             if (err) throw err;

//             //    console.log(decoded)
//         })
//         console.log(token)
//         if (!req.user_id) {
//             console.log("Not working")
//         }
//     }


//     next();
// })


//** END OF MIDDLEWARE */

//routes
app.use('/v1/users', userRoute);
app.use('/v1/payment', paymentRoute);
app.use('/v1/wallet', walletRoute);
app.use('/v1/admin', adminRoute);


app.listen(9090, () => {
    console.log('Server is listening on port 9090')
})