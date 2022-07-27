// let express = require('express');
// let cookieParser = require('cookie-parser');
// let app = express()
// app.use(cookieParser());
const utils = require('../utils/utils');

// const jwt = require('jsonwebtoken')
const config = require('../configs/config');


module.exports = async function (req, res, next){
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    // console.log('token', token)
    
    if (token) {
        try {
          const decoded = await utils.verifyJwtToken(token, config.secret);
          req.user = decoded;
          next();
        } catch (err) {
          console.error(err);
          return res.status(401).json({
            message: 'Unauthorized access.',
          });
        }
      } else {
        return res.status(403).send({
          message: 'No token provided.',
        });
      }
}