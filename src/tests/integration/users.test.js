const request = require('supertest')
let server;
const User = require('../../controllers/UsersController')
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')
const config = require('../../configs/config');
const utils = require('../../utils/utils');

var tokenList = {}
describe("POST /api/users", () => {

    beforeEach(() => { server = require('../../index')} )

    describe("register", () => {
        it("should return a user if register sucessful!", async () => {
            const response = await request(server).post("/api/users").send({
                email: "tuantv2@rikkeisoft.com",
                password: "123456",
                role_id: 3,
                phone: "0931224554"
            })
            expect(response.statusCode).toBe(200)
            })
        it("should return 400 if email illegal or phone-number has already registerd!", async () => {
            const response = await request(server).post("/api/users").send({
                email: "rikkeisoft.com",
                password: "123456",
                role_id: 3,
                phone: "0931224554"
            })
            expect(response.statusCode).toBe(400)
            })
        })

    describe("login", () => {
        it("should return a user if login successful", async () => {
            const response = await request(server).post("/api/users/login").send({
                email: "tuantv2@rikkeisoft.com",
                password: "123456"
            })
            
            expect(response.statusCode).toBe(200)
        })
        it("should return 400 if login failed", async () => {
            const response = await request(server).post("/api/users/login").send({
                email: "tuantv2@rikkeisoft.com",
                password: "1234567"
            })
            expect(response.statusCode).toBe(400)
        })  
    })
    
    describe("when the email or password is missing", () => {
        it("should respond with a status code of 400", async () => {
            const bodyData = [
                { email: "tuantv2@rikkeisoft.com"},
                { password: "123456"},
                { }
            ]
            for (const body of bodyData) {
                const response = await request(server).post("/api/users").send(body)
                expect(response.statusCode).toBe(400)
            }
        })
        })
})

describe("GET /api/users/:id", () => {

    beforeEach(() => { server = require('../../index')} )

    it("should return a user if valid id is passed", async () => {
        const token = await generateAdminToken()
        const res = await request(server)
                            .get("/api/users/14")
                            .set('x-access-token', token)
        expect(res.status).toBe(200)
    })

    it("should return 404 if invalid id is passed", async () => {
        const token = await generateAdminToken()
        const res = await request(server)
                            .get("/api/users/15")
                            .set('x-access-token', token)
        expect(res.status).toBe(404)
    })
    it('should return 403 if user is not login or not permission', async () => {
        const res = await request(server).get("/api/users/14")
        expect(res.status).toBe(403)
    })
})

describe("GET /api/users/:rolId/list", () => {

    beforeEach(() => { server = require('../../index')} )

    it("should return a user if valid role id is passed", async () => {
        const token = await generateAdminToken()
        const res = await request(server)
                            .get("/api/users/3/list")
                            .set('x-access-token', token)
        expect(res.status).toBe(200)
    })
    it("should return 404 if invalid role id is passed", async () => {
        const token = await generateAdminToken()
        const res = await request(server)
                            .get("/api/users/4/list")
                            .set('x-access-token', token)
        expect(res.status).toBe(404)
    })
    it('should return 403 if not permission', async () => {
        const res = await request(server).get("/api/users/1/list")
        expect(res.status).toBe(403)
    })
})

describe("PATCH /api/users/:id", () => {

    beforeEach(() => { server = require('../../index')} )
    
    it('should return a user if update user successful!', async () => {
        let id = 3
        let email = "chauhh@rikkeisoft.com"
        let password = "123456"
        let role_id = 2
        const token = await generateAuthToken(id, email, password, role_id)
        const res = await request(server)
                            .patch("/api/users/3")
                            .set('x-access-token', token)
                            .send( {full_name: "Chau Ho Hoang 4", role_id: 2})
        expect(res.status).toBe(200)
    })
    it('should return 403 if not permission!', async () => {
        const bodyData = [
            { email : "chauhh@rikkeisoft.com", password : "123456", role_id : 2},
            { id: 2, email : "chauhh@rikkeisoft.com", password : "123456", role_id : 2}, // sai ID => 403
            { }
        ]

        for (const body of bodyData) {
            const token = await generateAuthToken(body.id, body.email, body.password, body.role_id)
            const res = await request(server)
                                .patch("/api/users/3")
                                .set('x-access-token', token)
                                .send( {full_name: "Chau Ho Hoang 3", role_id: 2})
            expect(res.status).toBe(403)
        }
        
    })
})

describe("POST /api/users/refresh-token", () => {

    beforeEach(() => { server = require('../../index')} )



    it("should return token if refresh Token successful!", async () => {
        // const refreshToken = await request(server).post("/api/users/login").send({
        //     email: "tuantv2@rikkeisoft.com",
        //     password: "123456"
        // })
        // console.log(refreshToken.body.refreshToken)
        const refreshToken = await getRefreshToken()
        const res = await request(server)
                        .post('/api/users/refresh-token')
                        .send( {refreshToken: refreshToken})
        expect(res.status).toBe(200)




    //     const refreshToken = await generateRefreshToken()
    //     console.log("refreshToken:",refreshToken)
    //     const decoded = await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);
    //     console.log("decoded :", decoded)
    //     const res = await request(server)
    //                     .post('/api/users/refresh-token')
    //                     .send( {refreshToken: refreshToken})
    // expect(res.status).toBe(200)
    })
})


describe("POST /api/users/forgot-password", () => {

    beforeEach(() => { server = require('../../index')} )

    // comment in order not to send email
    // it("should return 200 if send email successful", async () => {
    //     const res = await request(server)
    //                         .post("/api/users/forgot-password")
    //                         .send({ email: "hungsoccer1@gmail.com", phone: "0933112112"})
    //     expect(res.status).toBe(200)
    // })
    it("should return 400 if send email failed", async () => {
        const res = await request(server)
                            .post("/api/users/forgot-password")
                            .send({ email: "hungsoccer1"})
        expect(res.status).toBe(404)
    })
})

describe("POST /api/users/reset-password", () => {

    beforeEach(() => { server = require('../../index')} )

    it("should return 200 if reset password successful", async () => {
        const res = await request(server)
                            .put("/api/users/reset-password")
                            .send({ resetPassToken: "zFVsJa9qgiReHDlTl6Av", password: "123456"})
        expect(res.status).toBe(200)
    })
    it("should return 400 if reset password failed", async () => {
        const res = await request(server)
                            .put("/api/users/reset-password")
                            .send({ resetPassToken: "zFVsJa9qgiReHDlTl6Ava"})
        expect(res.status).toBe(400)
    })
})

async function generateAuthToken(id, email, password = 'fakepass', role_id ){
    const salt = await bcrypt.genSalt(10)   
    let passCrypt = await bcrypt.hash(password, salt)
    const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
    return token
}

async function generateAdminToken(id = 1, email = "hungdv_tts@rikkeisoft.com", password = "123456", role_id = 1 ){
    const salt = await bcrypt.genSalt(10)   
    let passCrypt = await bcrypt.hash(password, salt)
    const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
    return token
}

async function generateRefreshToken(id = 1, email = "hungdv_tts@rikkeisoft.com", password = "123456", role_id = 1 ){
    const salt = await bcrypt.genSalt(10)   
    let passCrypt = await bcrypt.hash(password, salt)
    const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
    return refreshToken
}

// login will return token and refreshToken
async function getRefreshToken(email = "hungdv_tts@rikkeisoft.com", password= "123456"){
    const refreshToken = await request(server).post("/api/users/login").send({
        email: "tuantv2@rikkeisoft.com",
        password: "123456"
    })
    return refreshToken.body.refreshToken
}