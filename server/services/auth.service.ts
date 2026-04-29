import crypto from "node:crypto";

import { withTransaction } from "@/server/db";
import { asQueryable } from "@/server/db/queryable";
import { AppError } from "@/server/errors/app-error";
import { usersRepository } from "@/server/repositories/users.repository";
import { loginSchema, googleIdentitySchema, registerSchema } from "@/server/validation/auth";
import type { AppUser, LoginInput, RegisterInput, SessionUser } from "@/types";
import { passwordService } from "@/server/services/password.service";

export function toSessionUser(user: AppUser): SessionUser {
  return {
    id: user.id,
    username: user.username ?? null,
    name: user.name,
    email: user.email,
    company: user.company,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };
}

export const authService = {
  async authenticate(rawInput: LoginInput) {
    const input = loginSchema.parse(rawInput);
    const user = await usersRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    const matches = await passwordService.verify(input.password, user.passwordHash);

    if (!matches) {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    if (!user.isActive) {
      throw new AppError("Esta conta foi desativada. Entre em contato com a Prismarq.", 403, "account_inactive");
    }

    return user;
  },

  async authenticateAdmin(rawInput: { username: string; password: string }) {
    const username = rawInput.username.trim().toLowerCase();
    const password = rawInput.password;

    if (!username || !password) {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    const user = await usersRepository.findByUsername(username);
    if (!user || user.role !== "admin") {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    const matches = await passwordService.verify(password, user.passwordHash);
    if (!matches) {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    if (!user.isActive) {
      throw new AppError("Credenciais inválidas.", 401, "invalid_credentials");
    }

    return user;
  },

  async register(rawInput: RegisterInput) {
    const input = registerSchema.parse(rawInput);
    const existingUser = await usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Já existe uma conta com este e-mail.", 409, "email_in_use");
    }

    const passwordHash = await passwordService.hash(input.password);
    return usersRepository.create({
      name: input.name,
      email: input.email,
      company: input.company,
      phone: input.phone,
      role: "client",
      passwordHash,
    });
  },

  async authenticateWithGoogle(rawInput: {
    googleSub: string;
    email: string;
    emailVerified: true;
    name?: string;
    picture?: string;
  }) {
    const input = googleIdentitySchema.parse(rawInput);

    return withTransaction(async (client) => {
      const executor = asQueryable(client);
      const linkedUser = await usersRepository.findByGoogleSub(input.googleSub, executor);

      if (linkedUser) {
        const refreshedLinkedUser = await usersRepository.refreshGoogleProfile(
          {
            userId: linkedUser.id,
            avatarUrl: input.picture ?? null,
          },
          executor,
        );

        if (!refreshedLinkedUser) {
          throw new AppError("NÃ£o foi possÃ­vel atualizar a sessÃ£o Google da conta.", 500, "google_profile_refresh_failed");
        }

        if (!refreshedLinkedUser.isActive) {
          throw new AppError("Esta conta foi desativada. Entre em contato com a Prismarq.", 403, "account_inactive");
        }

        return refreshedLinkedUser;
      }

      const existingUser = await usersRepository.findByEmail(input.email, executor);

      if (existingUser) {
        const linkedExistingUser = await usersRepository.linkGoogleAccount(
          {
            userId: existingUser.id,
            googleSub: input.googleSub,
            avatarUrl: input.picture ?? null,
          },
          executor,
        );

        if (!linkedExistingUser) {
          throw new AppError("NÃ£o foi possÃ­vel vincular a conta Google.", 500, "google_link_failed");
        }

        if (!linkedExistingUser.isActive) {
          throw new AppError("Esta conta foi desativada. Entre em contato com a Prismarq.", 403, "account_inactive");
        }

        return linkedExistingUser;
      }

      const fallbackName = input.name?.trim() || input.email.split("@")[0] || "Cliente Prismarq";
      const passwordHash = await passwordService.hash(`google:${input.googleSub}:${crypto.randomUUID()}`);

      return usersRepository.create(
        {
          name: fallbackName,
          email: input.email,
          company: "NÃ£o informado",
          phone: "NÃ£o informado",
          role: "client",
          passwordHash,
          authProvider: "google",
          googleSub: input.googleSub,
          avatarUrl: input.picture ?? null,
        },
        executor,
      );
    });
  },
};
