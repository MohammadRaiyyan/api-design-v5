import { asc, eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../db/connection.ts";
import { tags } from "../db/schema.ts";
import type { AuthenticatedRequest } from "../middleware/auth.ts";

export async function createTag(req: AuthenticatedRequest, res: Response) {
    try {
        const { name, color } = req.body;
        const [tag] = await db.insert(tags).values({ name, color }).returning();
        res.status(201).json({
            message: "Tag created successfully",
            tag
        });
    } catch (error) {
        console.error("Error creating tag:", error);
        res.status(500).json({ error: "Failed to create tag" });
    }
}

export async function getAllTags(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user?.id;
        const allTags = await db.query.tags.findMany({
            where: eq(tags, userId),
            orderBy: [asc(tags.createdAt)]
        });
        res.status(200).json({
            message: "Fetched tags successfully",
            tags: allTags
        });
    } catch (error) {

    }

}