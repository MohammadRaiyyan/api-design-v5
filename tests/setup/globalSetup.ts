import { sql } from "drizzle-orm";
import { execSync } from "node:child_process";
import { db } from "../../src/db/connection.ts";
import {
	entries,
	habits,
	habitTags,
	tags,
	users,
} from "../../src/db/schema.ts";

export default async function globalSetup() {
	try {
		console.log("Running global setup: Cleaning up test database...");
		await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE;`);
		await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE;`);
		await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE;`);
		await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE;`);
		await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE;`);
		console.log("Test database cleaned.");
		console.log("🚀 Pushing data base schema");
		execSync(
			`npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
			{
				stdio: "inherit",
				cwd: process.cwd(),
			},
		);

		console.log("✅ Database migrations applied.");
	} catch (error) {
		console.error("❌ Error during global setup:", error);
		throw error;
	}

	return async () => {
		console.log("Global teardown: Cleaning up test database...");
		try {
			await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE;`);
			await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE;`);
			await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE;`);
			await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE;`);
			await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE;`);
			console.log("Test database cleaned up.");
			process.exit(0);
		} catch (error) {
			console.error("❌ Error during global teardown:", error);
			throw error;
		}
	};
}
