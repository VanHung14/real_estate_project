const bcrypt = require('bcrypt')
// const validator = require("email-validator")
const validatePhone = require('validate-phone-number-node-js')
const emailExistence = require('email-existence')
const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils');
const prisma = new PrismaClient()
const tokenList = {};
class LoginController {

    // [POST]/login
    async login(req, res){

        // const salt = await bcrypt.genSalt(10)
        // console.log(req.body.email, await bcrypt.hash(req.body.password, salt))
        let user =  await prisma.users.findFirst( {where: { email: req.body.email}, })
        if(!user) return res.status(401).send('Invalid email or password')
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if(!validPassword) return res.status(400).send('Invalid email or password')
        else {
            
            const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife, })
            const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
            tokenList[refreshToken] = user;
            
            const response = {
                token,
                refreshToken,
              }
            
              res.json(response);
        }
    }

    // [POST]/refreshToken
    async refreshToken (req, res) {
        const { refreshToken } = req.body;
        console.log('token', refreshToken)
        
        if ((refreshToken) && (refreshToken in tokenList)) {
            try {
                await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);

                const user = tokenList[refreshToken];
          
                const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife,
                });
                const response = {
                  token,
                }
                res.status(200).json(response);
            }
            catch(err){
                console.error(err);
                res.status(403).json({
                  message: 'Invalid refresh token',
                });
            }
        }
        else {
            res.status(400).json({
              message: 'Invalid request',
            });
          }

    }

    // [POST]/register
    async register(req, res) {

        let user = await prisma.users.findFirst( {where: {  OR: [
            { AND: { email : req.body.email} },
            { AND: { phone: req.body.phone } },
          ] } } )
        if(user) return res.status(400).send('This email or phone already registered')

        if(!validatePhone.validate(req.body.phone)) return res.status(400).send('Invalid phone number.')

        // check real email
        const salt = await bcrypt.genSalt(10)   
        emailExistence.check(req.body.email, async function(error, response){
            // console.log(response)
            if(response){
                let date = new Date()
                date.setHours(date.getHours()+7)
                let user = await prisma.users.create({
                    data: {
                        full_name: req.body.full_name,
                        email: req.body.email,
                        password: await bcrypt.hash(req.body.password, salt),
                        phone: req.body.phone,
                        role_id: req.body.role_id,
                        created_at: date,
                        updated_at: date
                    }
                })
                if(user) {
                    res.send(user)
                }
                else{
                    res.status(401).send('Register failed!')
                }
            }
            else {
                res.status(401).send('This email is not available!')
            }
        })
    }

    // [POST]/logout
    logout(req, res){
        
        return res.send('Logout successul!')
    }
}

module.exports = new LoginController;


// check regrex email
// console.log(validator.validate("hungdv_tts3@rikkeisoft.com"))
