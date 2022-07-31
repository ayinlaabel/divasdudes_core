const jwt = require("jsonwebtoken");

//**IMPORT MODELS */
const { User } = require("../database/models/user.model");

const middlewareController = {
  //Check whether the request has a valid JWT access token
  authenticate(req, res, next) {
    let token = req.header("x-access-token");
    let d = "me";

    //verify token
    jwt.verify(token, User.getJwtSecret(), (err, decoded) => {
      if (err) {
        //There was error
        //The JWT is Invalid so * - DONT AUTHENTICATE -*
        res.status(401).send(err);
      } else {
        //The JWT is vallid
        req.user_id = decoded.userInfo._id;
        req.userRoles = decoded.userInfo.roles;

        next();
        return decoded;
      }
    });

    return d;
  },

  //Verify Refresh Token Middleware (which will be verifying the session)
  verifySession(req, res, next) {
    //grab the refresh token from the request header
    let refreshToken = req.header("x-refresh-token");

    //grab the _id from the request header
    let _id = req.header("_id");

    User.findByIdAndToken(_id, refreshToken)
      .then((user) => {
        if (!user) {
          //user couldn't be found
          return Promise.reject({
            error:
              "User not found. Make sure that the refresh token and user id are correct",
          });
        }

        //if the code reaches here - the user was found
        //therefore the session token exists in the database  - but we still have to check if it has expired or not
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.session.forEach((session) => {
          if (session.token === refreshToken) {
            //check if the session has expired
            if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
              //refresh token has not expired

              isSessionValid = true;
            }
          }
        });

        if (isSessionValid) {
          //The session is valid - call next() to continue the processing with this web request
          next();
        } else {
          //the session is not valid
          return Promise.reject({
            error: "Refresh token has expired or the session is invalid",
          });
        }
      })
      .catch((err) => {
        res.status(401).send(err);
      });
  },

  refreshToken(req, res, next) {
    req.userObject.generateAccessToken().then((accessToken) => {
      res.header("x-access-token", accessToken).send({ accessToken });
    });
  },

  authenticateLogout(req, res, next) {
    let token = req.header("x-access-token");

    // jwt.destory(token)
    req.logout();
  },
  verifyToken(req, res, next) {
    let token = req.headers["x-access-token"];

    if (token) {
      jwt.verify(token, User.getJwtSecret(), (err, decoded) => {
        if (err) {
          //  res.send({message: 'Login action require.'})
          res.status(403).send("You are require to login.");
        } else {
          req.userId = decoded.userInfo._id;
          // res.send({ decoded });
        }
        next();
      });
    } else {
      res.status(403).send({ message: "You need to login." });
    }
  },
};

module.exports = middlewareController;
