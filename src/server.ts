import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { isTest } from "../env.ts";
import { authRoutes } from "./routes/authRoutes.ts";
import { habitRoutes } from "./routes/habitRoutes.ts";
import { userRoutes } from "./routes/userRoutes.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	morgan("dev", {
		skip: () => isTest(),
	}),
);
app.get("/health", (req, res) => {
	res.status(200).send("OK");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);

export { app };
export default app;
