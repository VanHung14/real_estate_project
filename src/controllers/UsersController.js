const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const validator = require("email-validator")
const validatePhone = require('validate-phone-number-node-js')
const utils = require('../utils/utils');
const prisma = new PrismaClient()
const randtoken = require('rand-token')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const config = require('../configs/config');


var tokenList = {}
class UsersController {
    // [POST]/api/users/login
    async login(req, res){
        try {
            let user =  await prisma.users.findFirst( {where: { email: req.body.email} })
            if(user) {
                const validPassword = await bcrypt.compare(req.body.password, user.password)
                if(validPassword) {
                    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife, })
                    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
                    tokenList[refreshToken] = user;
                    const response = {
                        token,
                        refreshToken,
                      }
                      res.json(response);
                } 
                else {
                    res.status(400).send('Invalid password!')
                }
            }
            else{
                res.status(400).send('Invalid email!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }


    // [POST]/api/users/refresh-token
    async refreshToken (req, res) {
        const { refreshToken } = req.body;
        console.log('refresh Token:', refreshToken)
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

    // [POST] /api/users
    async register(req, res) {
        try{
            let user = await prisma.users.findFirst( {where: {  OR: [
                { AND: { email : req.body.email} },
                { AND: { phone: req.body.phone } },
              ] } } )
            if(user) res.status(400).send('This email or phone-number has already registered')
            else
            {
                if(!validatePhone.validate(req.body.phone)) res.status(400).send('Invalid phone-number.')
                else
                {
                    const salt = await bcrypt.genSalt(10)   
                    const validateEmail = validator.validate(req.body.email)
                    if(validateEmail){
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
                            res.status(400).send('Register failed!')
                        }
                    }
                    else {
                        res.status(400).send('This email is illegal!')
                    }
                }
            }
        }
        catch(err)
        {
            res.status(400).send(err)
        }
    }

    // [POST] /api/users/reset-password-email
    async resetPasswordEmail(req, res, next){
        var email = req.body.email;
        var phone = req.body.phone;
        let user = await prisma.users.findFirst({where: {
            email: email,
            phone: phone
        }})
        if(user) {
            var token = randtoken.generate(20);
            var sent = await sendEmail(email, token)
            if(sent==1){
                var data = {
                    reset_password_token: token
                }
                await prisma.users.update({where: {
                    email: email,
                    },
                    data})
                res.send('Send email successful! Token: '+ token)
            }
            else{
                res.send('Send email failed!')
            }
        }
        else{
            res.status(400).send('No user founded!')
        }
    }

    //[GET] /users/reset-password?token=
    linkResetPassword(req, res, next){
        var token = req.query.token
        console.log(token)
    }

    //[PUT] /api/users/update-password
    async updatePassword(req, res, next){
        var token = req.body.token;
        var password = req.body.password;
        const salt = await bcrypt.genSalt(10)

        let user = await prisma.users.findFirst({where: {
            reset_password_token: token,
        }})
        if(user) {
            let date = new Date()
            date.setHours(date.getHours()+7)
            let update = await prisma.users.update({
                
                where: {
                    email: user.email
                },
                data: {
                    password: await bcrypt.hash(password, salt),
                    updated_at : date
                }
                
            })
            if(update) {
                res.send('Update successful!')
            }
            else{
                res.status(400).send('Update failed!')
            }
        }
        else{
            res.status(400).send('No user found!')
        }
        

    }
}


module.exports = new UsersController;

//send email
async function sendEmail(email, token) {
 
    var email = email;
    var token = token;
    var mail = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,

        auth: {
            user: 'dinhvanhung173@gmail.com',
            pass: "mpsiygqphyqtmbfo"
        },
        tls: {
            rejectUnauthorized: false
        }
    });
 
    var mailOptions = {
        from: 'dinhvanhung173@gmail.com',
        to: email,
        subject: 'Reset Password Link ',
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3306/api/users/reset-password?token=' + token + '">link</a> to reset your password</p>'
    };

    return new Promise(function (resolve, reject ){
        mail.sendMail(mailOptions,  function(error, info) {
            if (error) {
                reject(0)
            } else {
                resolve(1)
            }
        });
    }
    )
}