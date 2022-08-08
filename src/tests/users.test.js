const request = require('supertest')
const users = require('../routes/users')
const index = require('../index')

describe("POST /api/users", () => {
    describe("given a username and password", () => {
        // test("should respond with a 200 status code", async () => {
        //     const response = await request(index).post("/api/users").send({
        //         email: "tuantv2@rikkeisoft.com",
        //         password: "123456",
        //         role_id: 3,
        //         phone: "0931224554"
        //     })
        //     expect(response.statusCode).toBe(200)
        //     })

        test("login with email password", async () => {
            const response = await request(index).post("/api/users/login").send({
                email: "tuantv2@rikkeisoft.com",
                password: "123456"
            })
            expect(response.statusCode).toBe(200)
        })
        })
    
    describe("when the username and password is missing", () => {
        test("should respond with a status code of 400", async () => {
            const bodyData = [
            {email: "tuantv2@rikkeisoft.com"},
            {password: "123456"},
            {}
            ]
            for (const body of bodyData) {
            const response = await request(index).post("/api/users").send(body)
            expect(response.statusCode).toBe(400)
            }
        })
        })
})

describe("GET /api/user/:id", () => {
    describe("Given a username and password", () => {
        test("Get user by id", () => {
            const res = await request(index).get("/api/users/14").send({
                
            })
            expect(res.statusCode).toBe(200)
        })
    })
})
