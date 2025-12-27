import { Router } from "express";
import z, { array, number, string, uuid } from "zod";
import { completeHabit, createHabit, deleteHabit, getHabit, getHabits, updateHabit } from "../controller/habitController.ts";
import { authenticateRoute } from "../middleware/auth.ts";
import { validateBody } from "../middleware/validation.ts";

const createHabitSchema = z.object({
    name: string().min(1, "Name is required"),
    description: string().optional(),
    frequency: string().min(1, "Frequency is required"),
    targetCount: number().optional(),
    tagIds: array(uuid()).optional(),
});

const updateHabitSchema = createHabitSchema.partial();

const router = Router();

router.use(authenticateRoute)

router.get("/", getHabits);
router.post("/", validateBody(createHabitSchema), createHabit);
router.patch("/:id", validateBody(updateHabitSchema), updateHabit);
router.get("/:id", getHabit);
router.delete("/:id", deleteHabit);
router.post("/:id/complete", completeHabit);

export { router as habitRoutes };
