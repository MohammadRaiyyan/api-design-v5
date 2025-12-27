import type { Response } from "express";

export function sendResponse(
	res: Response,
	statusCode: number,
	message: string,
	data?: any,
) {
	res.status(statusCode).json({
		message,
		data,
	});
}

export function sendError(res: any, statusCode: number, message: string) {
	res.status(statusCode).json({ error: message });
}
