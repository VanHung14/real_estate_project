const bcrypt = require('bcrypt')

const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
// const utils = require('../utils/utils');
const prisma = new PrismaClient()
// const randtoken = require('rand-token')
// const nodemailer = require('nodemailer')
const tokenList = {};
class LoginController {

    // [POST]/api/login
    // async login(req, res){
    //     try {
    //         let user =  await prisma.users.findFirst( {where: { email: req.body.email}, })
    //         if(user) {
    //             const validPassword = await bcrypt.compare(req.body.password, user.password)
    //             if(validPassword) {
    //                 const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife, })
    //                 const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
    //                 tokenList[refreshToken] = user;
    //                 const response = {
    //                     token,
    //                     refreshToken,
    //                   }
    //                   res.json(response);
    //             } 
    //             else {
    //                 res.status(400).send('Invalid password!')
    //             }
    //         }
    //         else{
    //             res.status(400).send('Invalid email!')
    //         }
    //     }
    //     catch(err){
    //         res.status(400).send(err)
    //     }
        
    // }

    // [POST]/logout
    // logout(req, res){
        
    //     return res.send('Logout successul!')
    // }
}

module.exports = new LoginController;


// check regrex email
// console.log(validator.validate("hungdv_tts3@rikkeisoft.com"))


