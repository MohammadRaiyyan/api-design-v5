import { Router } from "express";
import { login, register } from "../controller/authControllers.ts";
import { insertUserSchema } from "../db/schema.ts";
import { validateBody } from "../middleware/validation.ts";


const loginSchema = insertUserSchema.pick({
    email: true,
    password: true,
});

const router = Router();

router.post("/login", validateBody(loginSchema), login);

router.post("/register", validateBody(insertUserSchema), register);

export { router as authRoutes };
