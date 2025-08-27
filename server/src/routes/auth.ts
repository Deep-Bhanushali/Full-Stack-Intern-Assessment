import { Router } from "express";
import prisma from "../prisma";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { z } from "zod";
import { Role } from "../types";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { name, email, address, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, passwordHash, role: "USER" },
  });
  res.status(201).json({ id: user.id });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(16),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user.id, role: user.role as Role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

const passwordSchema = z.object({
  userId: z.number().int().positive(),
  newPassword: z
    .string()
    .min(8)
    .max(16)
    .regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
});

router.post("/password", async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { userId, newPassword } = parsed.data;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  res.json({ success: true });
});

export default router;
