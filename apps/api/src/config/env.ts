import 'dotenv/config'
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.coerce.number(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    S3_REGION: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),

    FIREBASE_SERVICE_ACCOUNT_JSON: z.string().min(1),
});

export const env = envSchema.parse(process.env);