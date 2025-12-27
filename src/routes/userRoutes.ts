import { Router } from "express";
import { authenticateRoute } from "../middleware/auth.ts";

const router = Router();
router.use(authenticateRoute);
router.get("/", (req, res) => {
	// Handle fetching users logic here
	res.send("Get Users ").status(200);
});
router.get("/:id", (req, res) => {
	// Handle creating a new user logic here
	res.send("Single User").status(201);
});

router.put("/:id", (req, res) => {
	// Handle creating a new user logic here
	res.send("Update user").status(201);
});

router.delete("/:id", (req, res) => {
	// Handle creating a new user logic here
	res.send("Delete user").status(201);
});

export { router as userRoutes };
