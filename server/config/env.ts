import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return Boolean(value);
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório."),
  DATABASE_SSL: booleanFromEnv.default(false),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres."),
  SESSION_COOKIE_NAME: z.string().min(1).default("prismarq_session"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().optional().default(""),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(15 * 1024 * 1024),
  ALLOWED_UPLOAD_EXTENSIONS: z.string().min(1),
  ALLOWED_UPLOAD_MIME_TYPES: z.string().min(1),
  S3_BUCKET: z.string().optional().default(""),
  S3_REGION: z.string().optional().default(""),
  S3_ENDPOINT: z.string().optional().default(""),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(""),
  S3_FORCE_PATH_STYLE: booleanFromEnv.default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Configuração inválida de ambiente: ${parsed.error.message}`);
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  allowedUploadExtensions: splitCsv(parsed.data.ALLOWED_UPLOAD_EXTENSIONS),
  allowedUploadMimeTypes: splitCsv(parsed.data.ALLOWED_UPLOAD_MIME_TYPES),
};
