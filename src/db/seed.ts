import db from "./connection.ts";
import { entries, habits, habitTags, tags, users } from "./schema.ts";

async function seed() {
	console.log("🌱 Seeding database...");

	try {
		console.log("Clearing existing data...");
		await db.delete(users);
		await db.delete(habits);
		await db.delete(tags);
		await db.delete(entries);
		await db.delete(habitTags);
		console.log("Creating users...");
		const [user1] = await db
			.insert(users)
			.values({
				username: "alice",
				email: "alice@gmail.com",
				password: "hashed_password_1",
				firstName: "Alice",
				lastName: "Smith",
			})
			.returning();
		console.log("Creating tags...");
		const [tag1] = await db
			.insert(tags)
			.values({ name: "Health", color: "#34D399" })
			.returning();
		console.log("Creating habits...");
		const [habit1] = await db
			.insert(habits)
			.values({
				userId: user1.id,
				name: "Morning Jog",
				description: "Jog for 30 minutes every morning",
				frequency: "daily",
				targetCount: 1,
			})
			.returning();
		console.log("Linking tags to habits...");
		await db.insert(habitTags).values({
			habitId: habit1.id,
			tagId: tag1.id,
		});
		console.log("Adding completions...");
		const today = new Date();
		today.setHours(12, 0, 0, 0);
		for (let i = 1; i <= 7; i++) {
			const completionDate = new Date(today);
			completionDate.setDate(today.getDate() - i);
			await db.insert(entries).values({
				habitId: habit1.id,
				completionDate,
				note: `Completed on ${completionDate.toDateString()}`,
			});
		}

		console.log("✅ Seeding completed successfully.");
		console.log("Demo user credentials:");
		console.log("Email: alice@gmail.com");
		console.log("Password: hashed_password_1");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	seed().then(() => process.exit(0));
}
export { seed };
export default seed;
