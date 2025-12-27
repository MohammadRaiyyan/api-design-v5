import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";

export interface AuthenticatedRequest extends Request {
	user?: JwtPayload;
}

export async function authenticateRoute(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = await verifyToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: "Unauthorized" });
	}
}
