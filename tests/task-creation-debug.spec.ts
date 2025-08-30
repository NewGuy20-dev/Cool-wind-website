import { test, expect } from "@playwright/test";

test.describe("Task creation debugging", () => {
  test("Environment and API health check", async ({ request }) => {
    // Test debug endpoint
    const debugResponse = await request.get("/api/debug/supabase");
    const debugData = await debugResponse.json();
    console.log("Debug data:", debugData);

    expect(debugResponse.ok()).toBeTruthy();
    expect(debugData.environment.SUPABASE_URL).toBeTruthy();
    expect(debugData.connection.success).toBeTruthy();
  });

  test("API task creation with detailed logging", async ({ request }) => {
    const response = await request.post("/api/tasks/auto-create", {
      data: { title: "Test Task", description: "Auto-generated task" }
    });

    const responseBody = await response.json();
    console.log("API Response:", responseBody);

    if (!response.ok()) {
      console.error("API Error Details:", responseBody);
    }

    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
    expect(responseBody.source).toBe("db");
  });
});
