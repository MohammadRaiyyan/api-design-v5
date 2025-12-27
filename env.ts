import dotenv from "dotenv";
import z from "zod";

const appStage = process.env.APP_STAGE || "dev";
process.env.APP_STAGE = appStage;

const isDevelopment = appStage === "dev";
const isTesting = appStage === "test";

if (isTesting) {
	dotenv.config({ path: ".env.test" });
} else if (isDevelopment) {
	dotenv.config({ path: ".env" });
}

const envSchema = z.object({
	APP_STAGE: z.enum(["dev", "prod", "test"]).default("dev"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	PORT: z.coerce.number().positive().default(3000),

	DATABASE_URL: z
		.string()
		.min(1, "DATABASE_URL is required")
		.startsWith("postgresql://"),

	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters long"),
	JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required").default("7d"),

	BCRYPT_ROUNDS: z.coerce.number().min(4).max(31).default(12),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;
try {
	env = envSchema.parse(process.env);
} catch (e) {
	if (e instanceof z.ZodError) {
		console.error("❌ Invalid environment variables:");
		for (const issue of e.issues) {
			console.error(` - ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}
	throw e;
}

export const isProd = () => env.APP_STAGE === "prod";
export const isDev = () => env.APP_STAGE === "dev";
export const isTest = () => env.APP_STAGE === "test";

export { env };
export default env;
