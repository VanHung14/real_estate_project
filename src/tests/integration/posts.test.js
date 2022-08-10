const request = require('supertest')
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')
const config = require('../../configs/config');
const utils = require('../../utils/utils');
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const {Blob} = require('buffer')
let server;

beforeAll(() => { server = require('../../index')} )

describe('/api/posts', () => {

    // beforeEach(() => { server = require('../../index')} )
    // afterEach(() => { server.close() } )
    
    describe('GET /', () => {
        it('should return all posts', async () => {
            const token = await generateAdminToken()
            const res = await request(server)
                        .get('/api/posts')
                        .set('x-access-token', token)   
            expect(res.status).toBe(200)
        })
        it('should return posts by filter price', async () => {
            const token = await generateAdminToken()
            let str = encodeURI('/api/posts?filter=price&min=1&max=11&search=')
            const res = await request(server)
                        .get(str)
                        .set('x-access-token', token)   
            expect(res.status).toBe(200)
        })
        it('should return posts by filter address', async () => {
            const token = await generateAdminToken()
            let str = encodeURI('/api/posts?filter=address&city=Đà Nẵng&district=Cẩm Lệ&ward=Hòa An&street=Đoàn Văn')
            const res = await request(server)
                        .get(str)
                        .set('x-access-token', token)
            expect(res.status).toBe(200)
        })
        it('should return posts search = title, content', async () => {
            const token = await generateAdminToken()
            let str = encodeURI('/api/posts?search=Nha')
            const res = await request(server)
                        .get(str)
                        .set('x-access-token', token)
            expect(res.status).toBe(200)
        })
        it('should return 404 if no post found', async () => {
            const token = await generateAdminToken()
            let str = encodeURI('/api/posts?search=Biet thu')
            const res = await request(server)
                        .get(str)
                        .set('x-access-token', token)
            expect(res.status).toBe(204)
        })
        it('should return 403 if not login', async () => {
            const res = await request(server)
                        .get('/api/posts')
            expect(res.status).toBe(403)
        })
    })

    describe("POST /", () => {
        it("should return post if create successful", async () => {
            const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
            const decoded = await utils.verifyJwtToken(token, config.secret)
            console.log(token)
            const res = await request(server)
                                .post("/api/posts/")
                                .set('x-access-token', token)
                                .field("Content-Type", "multipart/form-data")
                                .field("title", "Nhà 6 tầng mới xây")
                                .field("city", "Hà Nội")
                                .field("ward", "Hàng Bè")
                                .field("street", "43 Đinh Liệt")
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house13.jpg"))
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house12.jpg"))
            expect(res.status).toBe(200)
        })
        it("should return 401 if address has already register", async () => {
            const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                                .post("/api/posts/")
                                .set('x-access-token', token)
                                .field("Content-Type", "multipart/form-data")
                                .field("title", "Nhà 5 tầng mới xây")
                                .field("city", "Hà Nội")
                                .field("ward", "Hàng Bè")
                                .field("street", "42 Đinh Liệt")
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house11.jpg"))
            expect(res.status).toBe(401)
        })
        it('should return 403 if not login', async () => {
            const res = await request(server)
                                .post("/api/posts/")
            expect(res.status).toBe(403)
        })
    })
})

describe("/api/posts/:id", () => {
    describe("GET /", () => {
        it("should return user by id", async () => {
            const res = await request(server).get('/api/posts/70')
            expect(res.status).toBe(200)
        })
        it("should return 204 by no posts found", async () => {
            const res = await request(server).get('/api/posts/12')
            expect(res.status).toBe(204)
        })
    })
    describe("PATCH /", () => {
        // it("should return user if update successful", async () => {
        //     const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
        //     const res = await request(server)
        //                         .patch('/api/posts/70')
        //                         .set('x-access-token', token)
        //                         .field("Content-Type", "multipart/form-data")
        //                         .field("title", "Nhà 7 tầng mới xây")
        //                         .field("price", 11.2)
        //                         .field("city", "Hà Nội")
        //                         .field("ward", "Hàng Dầu")
        //                         .field("street", "45 Trần Phú")
        //                         // .field("delList", "1660114447062-house8.png")
        //                         // .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house9.jpg"))
        //     expect(res.status).toBe(200)
        // })
        it("should return 400 if this post has been changed before.", async () => {
            const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                                .patch('/api/posts/70')
                                .set('x-access-token', token)
                                .field("Content-Type", "multipart/form-data")
                                .field("title", "Nhà 5 tầng mới xây")
                                .field("city", "Hà Nội")
                                .field("ward", "Hàng Dầu")
                                .field("street", "46 Trần Phú")
                                .field("delList", "1660114447062-house8.png")
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house12.jpg"))
            expect(res.status).toBe(400)
        })
        it("should return 403 if not permisstion", async () => {
            const token = await generateAuthToken(13, "thintq@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                                .patch('/api/posts/70')
                                .set('x-access-token', token)
                                .field("Content-Type", "multipart/form-data")
                                .field("title", "Nhà 5 tầng mới xây")
                                .field("city", "Hà Nội")
                                .field("ward", "Hàng Dầu")
                                .field("street", "46 Trần Phú")
                                .field("delList", "1660114447062-house8.png")
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house12.jpg"))
            expect(res.status).toBe(403)
        })
        it("should return 404 no post found", async () => {
            const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                                .patch('/api/posts/15')
                                .set('x-access-token', token)
                                .field("Content-Type", "multipart/form-data")
                                .field("title", "Nhà 5 tầng mới xây")
                                .field("city", "Hà Nội")
                                .field("ward", "Hàng Dầu")
                                .field("street", "46 Trần Phú")
                                .field("delList", "1660114447062-house8.png")
                                .attach("images", path.resolve(__dirname, "C:/Users/HungDV/Downloads/house12.jpg"))
            expect(res.status).toBe(404)
        })
        
    })

    describe("DELETE /", () => {
        it("should return post if delete successful", async () => {
            const token = await generateAuthToken(3, "chauhh@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .delete('/api/posts/89')
                            .set('x-access-token', token)
            expect(res.status).toBe(200)
        })
        it("should return 404 if no posts found", async () => {
            const token = await generateAuthToken(3, "chauhh@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .delete('/api/posts/89')
                            .set('x-access-token', token)
            expect(res.status).toBe(404)
        })
        it("should return 403 if not permission", async () => {
            const token = await generateAuthToken(3, "chauhh@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .delete('/api/posts/89')
            expect(res.status).toBe(403)
        })
    })

    describe("GET /posts/:id/images", () => {
        it("should return list filenames", async () => {
            const token = await generateAuthToken(12, "thintq@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .get('/api/posts/80/images')
                            .set('x-access-token', token)
            expect(res.status).toBe(200)
        })
        it("should return 404 if no images found", async () => {
            const token = await generateAuthToken(3, "chauhh@rikkeisoft.com", "123456", 2)
            const res = await request(server)
                            .delete('/api/posts/91')
                            .set('x-access-token', token)
            expect(res.status).toBe(404)
        })
        it("should return 403 if not permission", async () => {
            const res = await request(server)
                            .get('/api/posts/80/images')
            expect(res.status).toBe(403)
        })
    })
})







// mock file test harness
// describe("Mock file for file upload testing", function () {
//     it("should be defined", function() {
//         var file = new MockFile();
//         expect(file).not.toBeNull();
//     });

//     it("should have default values", function() {
//         var mock = new MockFile();
//         var file = mock.create();
//         expect(file.name).toBe('mock.txt');
//         expect(file.size).toBe(1024);
//     });

//     it("should have specific values", function () {
//         var size = 1024 * 1024 * 2;
//         var mock = new MockFile();
//         var file = mock.create("pic.jpg", size, "image/jpeg");
//         expect(file.name).toBe('pic.jpg');
//         expect(file.size).toBe(size);
//         expect(file.type).toBe('image/jpeg');
//     });
// });


// function MockFile() { };

// MockFile.prototype.create = function (name, size, mimeType) {
//     name = name || "mock.txt";
//     size = size || 1024;
//     mimeType = mimeType || 'plain/txt';

//     function range(count) {
//         var output = "";
//         for (var i = 0; i < count; i++) {
//             output += "a";
//         }
//         return output;
//     }

//     var blob = new Blob([range(size)], { type: mimeType });
//     blob.lastModifiedDate = new Date();
//     blob.name = name;

//     return blob;
// };

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

// async function generateRefreshToken(id = 1, email = "hungdv_tts@rikkeisoft.com", password = "123456", role_id = 1 ){
//     const salt = await bcrypt.genSalt(10)   
//     let passCrypt = await bcrypt.hash(password, salt)
//     const user = new Object({id: id, email: email, password: passCrypt, role_id: role_id})
//     const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
//     return refreshToken
// }

// async function upload(body) {
//     return fetch('http://localhost:3000', { method: 'POST', body }).then((response) => response.json());
//   }

// describe("test upload file", () => {
//     beforeEach(() => { server = require('../../index')} )
//     afterEach(() => { server.close() } )

//     it('should upload file correctly with test server', async () => {
//         const body = new FormData();
//         body.append(
//           'operations',
//           JSON.stringify({
//             query: `
//               mutation ($file: Upload!) {
//                 singleUpload(file: $file) {
//                   code
//                   message
//                 }
//               }
//             `,
//             variables: {
//               file: null,
//             },
//           }),
//         );
    
//         body.append('map', JSON.stringify({ 1: ['variables.file'] }));
//         body.append('1', 'a', { filename: 'a.txt' });
//         const json = await upload(body);
//         expect(json).toMatchSnapshot();
//       });
// })

// describe("GET /api/posts/:id/images", () => {

// })