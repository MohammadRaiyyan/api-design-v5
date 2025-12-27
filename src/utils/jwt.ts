import { jwtVerify, SignJWT } from "jose";
import { createSecretKey } from "node:crypto";
import env from "../../env.ts";

export interface JwtPayload {
    id: string;
    email: string;
    username: string;
    [key: string]: any;
}

export const generateToken = async (payload: JwtPayload) => {
    const secretKey = createSecretKey(env.JWT_SECRET, "utf-8")
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN || "7d")
        .sign(secretKey);

    return token;
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
    const secretKey = createSecretKey(env.JWT_SECRET, "utf-8")
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JwtPayload;
}