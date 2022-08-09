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
const fs = require('fs')



var tokenList = {}
class UsersController {

    // [GET] /api/users/:roleId/list
    // Only works for admin
    async getListUserByRoleId(req, res, next){
        try{
            let role_id = parseInt(req.params.roleId)
            if(req.user.role_id == 1){
                
                let seller = await prisma.users.findMany({where:
                    {
                        role_id: role_id
                    }
                },
                    )
                    
                if(seller) {
                    res.send(seller)
                }
                else{
                    res.status(404).send('No seller found!')
                }
            }
            else{
                res.status(403).send('No permision! Only works for admin.')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET] /api/users/:id
    // Only works for myself, or admin
    async getUserById(req, res, next){
        try {
            let id = parseInt(req.params.id)
            if(req.user.role_id == 1 || req.user.id == id ){
                let user = await prisma.users.findFirst({where: {
                    id: id
                }})
                if(user){
                    res.send(user)
                }
                else{
                    res.status(404).send('No user found!')
                }
            }
            else{ 
                res.status(403).send('No permission! Only works for myself, or admin')
            }
           
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    

    // [PATCH] /api/users/:id
    // Only works for myself, or admin 
    async updateUser (req, res, next){
        try{
            const salt = await bcrypt.genSalt(10)   
            let full_name = req.body.full_name || undefined
            let password 
            if(req.body.password!=''){
                password = await bcrypt.hash(req.body.password, salt)
            } 
            else{
                password = undefined
            }
            let phone = req.body.phone || undefined
            let role_id = parseInt(req.body.role_id)  || undefined
            let id = parseInt(req.params.id)
            if(req.user.id == 1 || req.user.id == id){
                let data = {}
                let date = new Date()
                date.setHours(date.getHours()+7)        // set up time in VN
                data = {
                    full_name: full_name,
                    password: password,
                    phone: phone,
                    updated_at: date,
                    role_id: role_id
                }
                let update = await prisma.users.update({where: {
                    id: id,
                }, data })
                if(update) {
                    res.send(update)
                }
                else{
                    res.status(404).send('Update user failed!')
                }
            }
            else{
                res.status(403).send('No permission! Only works for myself, or admin ')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [DELETE] /api/users/:id
    // Only works for admin.
    async deleteUser(req, res, next) {
        try {
            let id = parseInt(req.params.id)
            if(req.user.role_id == 1){
                let posts = await prisma.posts.findMany({where: { user_id: id}})
                let postIds = []
                for(var i = 0; i<posts.length; ++i){
                    postIds = posts[i].id
                }
                let imgPath = await prisma.images.findMany({where: { post_id: { in: postIds }}})
                let delList =[]
                for(var i =0; i< imgPath.length; ++i){
                    delList.push(imgPath[i].image_path)
                }
                console.log(delList)
                
                let delUser = await prisma.users.delete({where : { id: id }})   
                if(delUser){
                    if(JSON.stringify(delList) != JSON.stringify([])){
                        deleteImgInByPath(delList)
                    }
                    let delReview = await prisma.reviews.deleteMany({where : { buyer_id: id }})
                    let delMessage = await prisma.messages.deleteMany({where : {
                        OR: [ {
                            sender_id: id
                        }, {
                            receive_id: id
                        }]
                    }})
                    res.send(delUser)
                }
                else{
                    res.status(404).send('Delete user failed!')
                }
            }
            else{
                res.status(403).send('No permission! Only works for admin accounts')
            }

        }
        catch(err) 
        {
            res.status(400).send(err)
        }
    }

    // [POST]/api/users/login
    async login(req, res){
        // console.log(req.body.email)
        // console.log(req.body.password)
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
        // console.log(req.body)
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
                                role_id: parseInt(req.body.role_id) ,
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

    // [POST] /api/users/forgot-password
    async forgotPassword(req, res, next){
        var email = req.body.email;
        var phone = req.body.phone || "";
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
                res.send('Send email successful! resetPassToken: '+ token)
            }
            else{
                res.send('Send email failed!')
            }
        }
        else{
            res.status(404).send('No user founded!')
        }
    }

    //[GET] /users/reset-password?token=
    linkResetPassword(req, res, next){
        // var token = req.query.token
        // console.log(token)
    }

    //[PATCH] /api/users/reset-password
    async resetPassword(req, res, next){  
        var token = req.body.resetPassToken;
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
                res.send(update)
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

async function deleteImgInByReqFiles(array){ // delete by req.files
    // console.log('array', array)
    try { // delete files in local folder when not update new images
        for(var i =0; i< array.length; ++i){
            fs.unlinkSync(array[i].path)
        }
      } catch(err) {
        console.error(err)
      }
}

async function deleteImgInByPath(array){    // delete by path req.body
    // console.log('array', array)
    try { // delete files in local folder when not update new images
        for(var i =0; i< array.length; ++i){
            fs.unlinkSync(array[i])
        }
      } catch(err) {
        console.error(err)
      }
}