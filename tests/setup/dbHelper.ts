import db from "../../src/db/connection.ts";
import { entries, habits, habitTags, tags, users, type NewHabit, type NewUser } from "../../src/db/schema.ts";
import { generateToken } from "../../src/utils/jwt.ts";
import { hashPassword } from "../../src/utils/passwords.ts";

export const createTestUser = async (user: Partial<NewUser> = {}) => {
    const defaultUser: NewUser = {
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        password: "Test@1234",
        firstName: "Test",
        lastName: "User",
        ...user,
    };
    const hashedPassword = await hashPassword(defaultUser.password);
    const [createdUser] = await db.insert(users).values({
        ...defaultUser,
        password: hashedPassword,
    }).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
    });

    const token = await generateToken({
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
    });
    return {
        user: createdUser,
        token,
        password: defaultUser.password,
    };
}

export const createHabit = async (userId: string, newHabit: Partial<NewHabit> = {}) => {
    const defaultHabit: NewHabit = {
        userId,
        name: `Test Habit ${Date.now()}`,
        description: "This is a test habit",
        frequency: "daily",
        targetCount: 1,
        ...newHabit,
    };
    const [createdHabit] = await db.insert(habits).values(defaultHabit).returning();
    return createdHabit;
}

export const clearDatabase = async () => {
    await db.delete(habits);
    await db.delete(users);
    await db.delete(entries)
    await db.delete(tags);
    await db.delete(habitTags);
}