import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, createToken } from "@/lib/auth";

const auth = new Hono();

// POST /api/auth/register
auth.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json<{
      username: string;
      password: string;
    }>();

    if (!username || !password) {
      return c.json({ error: "Nom d'utilisateur et mot de passe requis" }, 400);
    }

    if (password.length < 8) {
      return c.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        400,
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return c.json({ error: "Ce nom d'utilisateur est déjà pris" }, 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, passwordHash },
    });

    const token = await createToken({ userId: user.id, username: user.username });

    return c.json({ token, user: { id: user.id, username: user.username } }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return c.json({ error: `Server error: ${err instanceof Error ? err.message : String(err)}` }, 500);
  }
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  const { username, password } = await c.req.json<{
    username: string;
    password: string;
  }>();

  if (!username || !password) {
    return c.json({ error: "Nom d'utilisateur et mot de passe requis" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return c.json({ error: "Identifiants incorrects" }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Identifiants incorrects" }, 401);
  }

  const token = await createToken({ userId: user.id, username: user.username });

  return c.json({ token, user: { id: user.id, username: user.username } });
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  return c.json({ success: true });
});

export { auth };
