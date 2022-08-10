const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../configs/config');
const utils = require('../../utils/utils');
const path = require('path')

let server;

beforeAll(() => { server = require('../../index')} )

describe('/api/messages', () => {
    describe('GET /api/messages', () => {
        it("should return all messages", async () => {
            const token = await generateAdminToken()
            const res = await request(server)
                            .get('/api/messages/')
                            .set('x-access-token', token)   
            expect(res.status).toBe(200)
        })
        it("should return 204 if no messages found", async () => {
            const token = await generateAdminToken()
            const res = await request(server)
                            .get('/api/messages?page=20')
                            .set('x-access-token', token)   
            expect(res.status).toBe(204)
        })
        it("should return 403 if no permission", async () => {
            const token = await generateAuthToken(3, "chauhh@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .get('/api/messages')
                            .set('x-access-token', token)   
            expect(res.status).toBe(403)
        })
    })

    describe('POST /api/message', () => {
        // it('should return message if create message successful', async () => {
        //     const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
        //     const res = await request(server)
        //                     .post('/api/messages')
        //                     .set('x-access-token', token)
        //                     .send({ message: "Chào bạn, mình trao đổi tí được không?", receive_id: 2})
        //     expect(res.status).toBe(200)
        // })

        it('should return 403 if no authentication', async () => {
            const res = await request(server)
                                .post('/api/messages')
            expect(res.status).toBe(403)
        })
    })
})

describe('/api/messages/:id', () => {
    describe('PATCH /api/messages/:id', () => {
        it('should return 200 if update message successful', async () => {
            const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .patch('/api/messages/13')
                                .set('x-access-token', token)   
                                .send({ message: "Mình trao đổi tí được không nào?"})
            expect(res.status).toBe(200)
        })
        it('should return 204 if no messages found', async () => {
            const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .patch('/api/messages/1')
                                .set('x-access-token', token)   
                                .send({ message: "Nhà này trong khu vực đông dân cư"})
            expect(res.status).toBe(204)
        })
        it('should return 403 if no permission', async () => {
            const token = await generateAuthToken(14, "anhth@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .patch('/api/messages/13')
                                .set('x-access-token', token)   
                                .send({ message: "Trao đổi 1 tí được ko?"})
            expect(res.status).toBe(403)
        })
    })

    describe('DELETE /api/messages/:id', () => {
        // it('should return 200 if delete message successful', async () => {
        //     const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
        //     const res = await request(server)
        //                         .delete('/api/messages/18')
        //                         .set('x-access-token', token)   
        //     expect(res.status).toBe(200)
        // })
        it('should return 204 if no messages found', async () => {
            const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .delete('/api/messages/1')
                                .set('x-access-token', token)   
            expect(res.status).toBe(204)
        })
        it('should return 403 if no permission', async () => {
            const token = await generateAuthToken(14, "anhth@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .delete('/api/messages/8')
                                .set('x-access-token', token)   
            expect(res.status).toBe(403)
        })
    })

    describe('GET /api/messages/:id/chat', () => {
        it('should return 200 if get conversation with other user', async () => {
            const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .get('/api/messages/2/chat')
                                .set('x-access-token', token)  
            expect(res.status).toBe(200)
        })
        it('should return 204 if no conversation with other user', async () => {
            const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
            const res = await request(server)
                                .get('/api/messages/3/chat')
                                .set('x-access-token', token)  
            expect(res.status).toBe(204)
        })
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