import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db/connection.ts";
import { users, type NewUser } from "../db/schema.ts";
import { generateToken } from "../utils/jwt.ts";
import { comparePassword, hashPassword } from "../utils/passwords.ts";
import { sendResponse } from "../utils/response.ts";

export async function register(req: Request<any, any, NewUser>, res: Response) {
	try {
		const hashedPassword = await hashPassword(req.body.password);
		const [user] = await db
			.insert(users)
			.values({
				...req.body,
				password: hashedPassword,
			})
			.returning({
				id: users.id,
				username: users.username,
				email: users.email,
				firstName: users.firstName,
				lastName: users.lastName,
				createdAt: users.createdAt,
			});

		const token = await generateToken({
			id: user.id,
			email: user.email,
			username: user.username,
		});
		sendResponse(res, 201, "User registered successfully", { user, token });
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).send("User registration failed");
	}
}
interface LoginRequestBody {
	email: string;
	password: string;
}
export async function login(
	req: Request<any, any, LoginRequestBody>,
	res: Response,
) {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, req.body.email),
		});
		if (!user) {
			sendResponse(res, 401, "Invalid email or password");
			return;
		}
		const isPasswordValid = await comparePassword(
			req.body.password,
			user.password,
		);
		if (!isPasswordValid) {
			sendResponse(res, 401, "Invalid email or password");
			return;
		}
		const token = await generateToken({
			id: user.id,
			email: user.email,
			username: user.username,
		});
		sendResponse(res, 200, "Login successful", {
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				createdAt: user.createdAt,
			},
			token,
		});
	} catch (error) {
		sendResponse(res, 500, "Login failed");
	}
}
