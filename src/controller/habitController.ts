import { and, desc, eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../db/connection.ts";
import { habits, habitTags } from "../db/schema.ts";
import type { AuthenticatedRequest } from "../middleware/auth.ts";

export async function getHabits(req: AuthenticatedRequest, res: Response) {
	try {
		const userId = req.user?.id;
		const userHabits = await db.query.habits.findMany({
			where: eq(habits.userId, userId),
			with: {
				habitTags: {
					with: { tag: true },
				},
			},
			orderBy: [desc(habits.createdAt)],
		});

		const habitWithTags = userHabits.map((habit) => ({
			...habit,
			tags: habit.habitTags.map((ht) => ht.tag),
			habitTags: undefined,
		}));
		res.status(200).json({
			message: "Fetched habits successfully",
			habits: habitWithTags,
		});
	} catch (error) {
		console.error("Error fetching habits:", error);
		res.status(500).json({ error: "Failed to fetch habits" });
	}
}

export async function getHabit(req: AuthenticatedRequest, res: Response) {
	try {
		const userId = req.user?.id;
		const habitId = req.params.id;
		const userHabit = await db.query.habits.findFirst({
			where: and(eq(habits.userId, userId), eq(habits.id, habitId)),
			with: {
				habitTags: {
					with: { tag: true },
				},
			},
		});

		const habitWithTags = {
			...userHabit,
			tag: userHabit.habitTags.map((ht) => ht.tag),
			habitTags: undefined,
		};
		res.status(200).json({
			message: "Fetched habit successfully",
			habit: habitWithTags,
		});
	} catch (error) {
		console.error("Error fetching habits:", error);
		res.status(500).json({ error: "Failed to fetch habits" });
	}
}

export async function createHabit(req: AuthenticatedRequest, res: Response) {
	try {
		const userId = req.user?.id;
		const { name, description, frequency, targetCount, tagIds } = req.body;
		const newHabit = await db.transaction(async (tx) => {
			const [habit] = await tx
				.insert(habits)
				.values({
					userId,
					name,
					description,
					frequency,
					targetCount,
				})
				.returning();
			if (tagIds && tagIds.length > 0) {
				const habitTags = tagIds.map((tagId) => ({
					habitId: habit.id,
					tagId,
				}));
				await tx.insert(habitTags).values(habitTags);
			}
			return habit;
		});
		res.status(201).json({
			message: "Habit created successfully",
			habit: newHabit,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to create habit" });
	}
}

export async function deleteHabit(req: AuthenticatedRequest, res: Response) {
	try {
		const habitId = req.params.id;
		const userId = req.user?.id;
		await db
			.delete(habits)
			.where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
		res.status(200).json({ message: "Habit deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete habit" });
	}
}

export async function completeHabit(req: AuthenticatedRequest, res: Response) {
	try {
		const habitId = req.params.id;
		const userId = req.user?.id;
		const habit = await db.query.habits.findFirst({
			where: and(eq(habits.id, habitId), eq(habits.userId, userId)),
		});
		if (!habit) {
			res.status(404).json({ error: "Habit not found" });
			return;
		}
		await db
			.update(habits)
			.set({
				isActive: false,
				updatedAt: new Date(),
			})
			.where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
		res.status(200).json({ message: "Habit marked as complete" });
	} catch (error) {
		res.status(500).json({ error: "Failed to complete habit" });
	}
}
export async function updateHabit(req: AuthenticatedRequest, res: Response) {
	try {
		const habitId = req.params.id;
		const userId = req.user?.id;
		const { tagIds, ...updateFields } = req.body;

		const habit = await db.transaction(async (tx) => {
			const [updatedHabit] = await tx
				.update(habits)
				.set({
					...updateFields,
					updatedAt: new Date(),
				})
				.where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
				.returning();
			if (!updatedHabit) {
				res.status(404).json({ error: "Habit not found" });
				return;
			}
			if (tagIds !== undefined) {
				await tx.delete(habitTags).where(eq(habitTags.habitId, habitId));
				if (tagIds.length > 0) {
					const habitTagsToInsert = tagIds.map((tagId) => ({
						habitId: habitId,
						tagId,
					}));
					await tx.insert(habitTags).values(habitTagsToInsert);
				}
			}
			return updatedHabit;
		});
		res.status(200).json({
			message: "Habit updated successfully",
			habit: habit,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to update habit" });
	}
}
