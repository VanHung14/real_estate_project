// const request = require('supertest')
// const bcrypt = require('bcrypt')
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()
// const jwt = require('jsonwebtoken')
// const config = require('../../configs/config');
// const utils = require('../../utils/utils');
// let server;

// describe('/api/posts', () => {

//     beforeEach(() => { server = require('../../index')} )
//     afterEach(() => { server.close() } )

//     describe('GET /', () => {
//         it('should return all posts', async () => {
//             const token = await generateAdminToken()
//             const res = await request(server)
//                         .get('/api/posts')
//                         .set('x-access-token', token)
//             expect(res.status).toBe(200)
//             expect(res.body.length).toBe(2)
//         })
//     })
// })

// async function generateAuthToken(id, email, password = 'fakepass', role_id ){
//     const salt = await bcrypt.genSalt(10)   
//     let passCrypt = await bcrypt.hash(password, salt)
//     const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
//     const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
//     return token
// }

// async function generateAdminToken(id = 1, email = "hungdv_tts@rikkeisoft.com", password = "123456", role_id = 1 ){
//     const salt = await bcrypt.genSalt(10)   
//     let passCrypt = await bcrypt.hash(password, salt)
//     const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
//     const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
//     return token
// }

// // async function generateRefreshToken(id = 1, email = "hungdv_tts@rikkeisoft.com", password = "123456", role_id = 1 ){
// //     const salt = await bcrypt.genSalt(10)   
// //     let passCrypt = await bcrypt.hash(password, salt)
// //     const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
// //     const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
// //     return refreshToken
// // }