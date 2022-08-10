const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../configs/config");
const utils = require("../../utils/utils");
const path = require("path");

let server;

beforeAll(() => {
  server = require("../../index");
});

describe("/api/reviews", () => {
  describe("GET /api/reviews", () => {
    it("should return all reviews", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/reviews/")
        .set("x-access-token", token);
      expect(res.status).toBe(200);
    });
    it("should return list reviews by seller id", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/reviews?sellerId=3")
        .set("x-access-token", token);

      expect(res.status).toBe(200);
    });
    it("should return 204 if no reviews found of post has this id", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/reviews?sellerId=2")
        .set("x-access-token", token);
      expect(res.status).toBe(204);
    });
    it("should return 403 if no permission (only for admin )", async () => {
      const token = await generateAuthToken(
        3,
        "chauhh@rikkeisoft.com",
        "123456",
        2
      );
      const res = await request(server)
        .get("/api/reviews")
        .set("x-access-token", token);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/review", () => {
    // it('should return review if create review successful', async () => {
    //     const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
    //     const res = await request(server)
    //                     .post('/api/reviews')
    //                     .set('x-access-token', token)
    //                     .send({ review: "Chủ nhà uy tín", seller_id: 3, rating: 5})
    //     expect(res.status).toBe(200)
    // })

    it("should return 400 if create review failed", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .post("/api/reviews")
        .set("x-access-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 403 if no permission", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        2
      );
      const res = await request(server)
        .post("/api/reviews")
        .set("x-access-token", token)
        .send({ review: "Chủ nhà uy tín", seller_id: 3, rating: 5 });
      expect(res.status).toBe(403);
    });
  });
});

describe("/api/reviews/:id", () => {
  describe("PATCH /api/reviews/:id", () => {
    it("should return 200 if update review successful", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .patch("/api/reviews/7")
        .set("x-access-token", token)
        .send({ review: "Uy tín", rating: 4.5 });
      expect(res.status).toBe(200);
    });
    it("should return 204 if no reviews found", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .patch("/api/reviews/1")
        .set("x-access-token", token)
        .send({ review: "Nhà này trong khu vực đông dân cư" });
      expect(res.status).toBe(204);
    });
    it("should return 403 if no permission", async () => {
      const token = await generateAuthToken(
        14,
        "anhth@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .patch("/api/reviews/6")
        .set("x-access-token", token)
        .send({ review: "Nhà này trong khu vực đông dân cư" });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    it("should return 200 if delete review successful", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .delete("/api/reviews/7")
        .set("x-access-token", token);
      expect(res.status).toBe(200);
    });
    it("should return 204 if no reviews found", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .delete("/api/reviews/1")
        .set("x-access-token", token);
      expect(res.status).toBe(204);
    });
    it("should return 403 if no permission", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .delete("/api/reviews/5")
        .set("x-access-token", token);
      expect(res.status).toBe(403);
    });
  });
});

async function generateAuthToken(id, email, password = "fakepass", role_id) {
  const salt = await bcrypt.genSalt(10);
  let passCrypt = await bcrypt.hash(password, salt);
  const user = new Object({
    id: id,
    email: email,
    password: passCrypt,
    role_id: role_id,
  });
  const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
  return token;
}

async function generateAdminToken(
  id = 1,
  email = "hungdv_tts@rikkeisoft.com",
  password = "123456",
  role_id = 1
) {
  const salt = await bcrypt.genSalt(10);
  let passCrypt = await bcrypt.hash(password, salt);
  const user = new Object({
    id: id,
    email: email,
    password: passCrypt,
    role_id: role_id,
  });
  const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
  return token;
}
