import { clearDatabase, createTestUser } from "./dbHelper.ts";

describe("Test setup", () => {
	test("Should connect to the test DB", async () => {
		const { token, user } = await createTestUser();
		expect(user).toHaveProperty("id");
		expect(token).toBeDefined();
		await clearDatabase();
	});
});
