import request from "supertest";
import { createServer } from "../../api/server.js";
import express from "express";

let app: express.Application;

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.chdir("../api/");
  app = createServer();
});

describe("API /api/game/resources", () => {
  it("devrait retourner 200 et une liste vide (mock user)", async () => {
    const res = await request(app)
      .get("/api/game/resources")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
  });
});
