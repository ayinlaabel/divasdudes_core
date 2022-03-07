const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const res = require('express/lib/response');

//JWT secret
const jwtSecret = 'MySecret_Divasdudes'

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    dob: {
        type: String
    },
    gender: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    roles: {
        type: String,
        default: "user"
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});


//**** Instance Methods */

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    //return the document except the password and session are bad (these shouldn't be made available)
    return _.omit(userObject, ['password', 'sessions']);
}

userSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        //create the JSON Web Token and return that
        jwt.sign({
            userInfo: {
                _id: user._id.toHexString(),
                roles: user.roles
            }
        }
            , jwtSecret, { expiresIn: "2h" }, (err, token) => {
                if (!err) {
                    resolve(token);
                } else {
                    reject();
                }
            });
    })
}

userSchema.methods.generateRefreshAuthToken = function () {
    //these method simply generates a 64bytes hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
    return new Promise((resolve, reject) => {
        //using crypto to create random 64bytes hex string
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}

userSchema.methods.createSession = function () {
    let user = this;

    return user.generateRefreshAuthToken().then(
        (refreshToken) => {
            return saveSessionToDatabase(user, refreshToken);
        }
    ).then((refreshToken) => {
        //saved to database successfully
        //now return the refreshToken
        return refreshToken;
    }).catch(
        (err) => {
            return Promise.reject('failed to save session to database.\n' + err);
        }
    )
}


//** MODEL METHODS (Static Method)*/
userSchema.statics.getJwtSecret = () => {
    return jwtSecret;
}

userSchema.statics.getUserId = () => {
    return localStorage.getItem('userId');
}
userSchema.statics.findByIdAndToken = function (_id, token) {
    //find user by  _id and token
    //use in auth middleware (verifySession)

    let user = this;

    return user.findOne({
        _id,
        'sessions.token': token
    });
}

userSchema.statics.findByCredentials = function (email, password) {
    let user = this;

    return user.findOne({ email }).then(
        (user) => {
            if (!user){ 
                return Promise.reject({status:'FAILED', error:'No user found!'})
            };


            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) res.JSON({status:'SUCCESS', user:res});
                    else {
                        reject({ status:'FAILED', error:'Wrong password' });
                    }
                })
            })
        }
    ).catch(
        err =>{ throw err}
    )
}

userSchema.static.findById = function (_id) {
    let user = this;

    return user.findOne({ _id }).then(

        (user) => {
            console.log(user)
            return user
        }
    ).catch(
        (err) => console.log(err)
    )
}

userSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;

    if (expiresAt > secondsSinceEpoch) {
        //hasn't expired
        return false;
    } else {
        //has expired
        return true;
    }
}

//** MIDDLEWARE */
userSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;

    if (user.isModified('password')) {
        //if the password field is edited/changed then run this code.
        //Generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})


//** HELPER METHODS */

let saveSessionToDatabase = (user, refreshToken) => {
    //save sessions to database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });

        user.save().then(
            () => {
                //saved session successfully
                return resolve(refreshToken);
            }
        ).catch(
            (err) => {
                reject(err);
            }
        )
    })
}

let generateRefreshTokenExpiryTime = () => {
    // let daysUntilExpire = process.env.REFRESH_TOKEN_DAYS_UNTIL_EXPIRE;
    let daysUntilExpire = '10';
    let secondsUtilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUtilExpire);
}

const User = mongoose.model('User', userSchema)

module.exports = { User }