//This file will handle connection login to the database

const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

mongoose.Promise = global.Promise;

//connect to database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
    () =>  console.log('conneted to mongodb successfully...')
). catch(
    err => console.log(err)
)


// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
}