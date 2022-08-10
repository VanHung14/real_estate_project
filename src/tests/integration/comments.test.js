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

describe("/api/comments", () => {
  describe("GET /api/comments", () => {
    it("should return all comments", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/comments/")
        .set("x-access-token", token);
      expect(res.status).toBe(200);
    });
    it("should return list comments by post id", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/comments?postId=70")
        .set("x-access-token", token);

      expect(res.status).toBe(200);
    });
    it("should return 204 if no comments found of post has this id", async () => {
      const token = await generateAdminToken();
      const res = await request(server)
        .get("/api/comments?postId=77")
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
        .get("/api/comments")
        .set("x-access-token", token);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/comment", () => {
    it("should return comment if create comment successful", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .post("/api/comments")
        .set("x-access-token", token)
        .send({ comment: "Nhà rất đẹp, thẩm mỹ", post_id: 80 });
      expect(res.status).toBe(200);
    });

    it("should return 400 if create comment failed", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .post("/api/comments")
        .set("x-access-token", token);
      expect(res.status).toBe(400);
    });
  });
});

describe("/api/comments/:id", () => {
  describe("PATCH /api/comments/:id", () => {
    it("should return 200 if update comment successful", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .patch("/api/comments/15")
        .set("x-access-token", token)
        .send({ comment: "Nhà này trong khu vực đông dân cư" });
      expect(res.status).toBe(200);
    });
    it("should return 204 if no comments found", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .patch("/api/comments/1")
        .set("x-access-token", token)
        .send({ comment: "Nhà này trong khu vực đông dân cư" });
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
        .patch("/api/comments/15")
        .set("x-access-token", token)
        .send({ comment: "Nhà này trong khu vực đông dân cư" });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/comments/:id", () => {
    // it('should return 200 if delete comment successful', async () => {
    //     const token = await generateAuthToken(16, "tinhtv_tts@rikkeisoft.com", "123456", 3)
    //     const res = await request(server)
    //                         .delete('/api/comments/13')
    //                         .set('x-access-token', token)
    //     expect(res.status).toBe(200)
    // })
    it("should return 204 if no comments found", async () => {
      const token = await generateAuthToken(
        16,
        "tinhtv_tts@rikkeisoft.com",
        "123456",
        3
      );
      const res = await request(server)
        .delete("/api/comments/13")
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
        .delete("/api/comments/8")
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
