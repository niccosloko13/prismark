import bcrypt from "bcryptjs";

import { env } from "@/server/config/env";

export const passwordService = {
  async hash(value: string) {
    return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
  },

  async verify(value: string, hash: string) {
    return bcrypt.compare(value, hash);
  },
};
