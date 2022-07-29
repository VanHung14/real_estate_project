const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const utils = require('../utils/utils');
const prisma = new PrismaClient()
const randtoken = require('rand-token')
const nodemailer = require('nodemailer')

class UsersController {
// [POST]/users/reset-password-email
async resetPasswordEmail(req, res, next){
    var email = req.body.email;
    let user = await prisma.users.findFirst({where: {
        email: email
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

    //[GET]/users/reset-password?token=
    linkResetPassword(req, res, next){
        var token = req.query.token
        console.log(token)
    }


    //[POST]/users/update-password
    async updatePassword(req, res, next){
        var token = req.body.token;
        var phone = req.body.phone;
        var password = req.body.password;
        const salt = await bcrypt.genSalt(10)   

        let user = await prisma.users.findFirst({where: {
            reset_password_token: token,
            phone : phone
        }})
        if(!user) {
            res.status(400).send('Phone is incorrect!')
        }
        else{
            let date = new Date()
            date.setHours(date.getHours()+7)
            let update = await prisma.users.update({
                
                where: {
                    email: user.email
                },
                data: {
                    password: await bcrypt.hash(req.body.password, salt),
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
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3306/users/reset-password?token=' + token + '">link</a> to reset your password</p>'
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