const request = require("supertest");
const app = require("../src/app");
const { initializeDatabase, run } = require("../src/config/db");

describe("Expenses API", () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    await run("DELETE FROM idempotency_keys");
    await run("DELETE FROM expenses");
  });

  test("creates an expense and returns it in list with total", async () => {
    const createResponse = await request(app).post("/api/expenses").send({
      amount: "499.99",
      category: "Groceries",
      description: "Weekly household purchase",
      date: "2026-04-24",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data).toMatchObject({
      amount: "499.99",
      category: "Groceries",
      description: "Weekly household purchase",
      date: "2026-04-24",
    });

    const listResponse = await request(app).get("/api/expenses?sort=date_desc");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.meta.total).toBe("499.99");
  });

  test("replays idempotent request without creating duplicate records", async () => {
    const payload = {
      amount: "120.50",
      category: "Transport",
      description: "Taxi",
      date: "2026-04-20",
      idempotencyKey: "test-idempotency-12345",
    };

    const firstResponse = await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", payload.idempotencyKey)
      .send(payload);
    const secondResponse = await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", payload.idempotencyKey)
      .send(payload);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.meta.replayed).toBe(true);
    expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);

    const listResponse = await request(app).get("/api/expenses?category=Transport&sort=date_desc");
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.meta.total).toBe("120.50");
  });
});
