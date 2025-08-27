import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import prisma from "../prisma";
import { z } from "zod";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard", async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  res.json({ users, stores, ratings });
});

const createUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
  role: z.enum(["ADMIN", "USER", "OWNER"]).default("USER"),
});

router.post("/users", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { name, email, address, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email exists" });
  const bcrypt = await import("bcrypt");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, role, passwordHash },
  });
  res.status(201).json({ id: user.id });
});

const createStoreSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  address: z.string().max(400),
  ownerId: z.number().int().positive().optional(),
});

router.post("/stores", async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { name, email, address, ownerId } = parsed.data;
  const store = await prisma.store.create({
    data: { name, email: email ?? null, address, ownerId: ownerId ?? null },
  });
  res.status(201).json({ id: store.id });
});

// List stores with filters and include average rating
router.get("/stores", async (req, res) => {
  const { name, email, address } = req.query as Record<
    string,
    string | undefined
  >;
  const stores = await prisma.store.findMany({
    where: {
      AND: [
        name ? { name: { contains: name } } : {},
        email ? { email: { contains: email } } : {},
        address ? { address: { contains: address } } : {},
      ],
    },
    include: { ratings: true, owner: true },
  });
  const data = stores.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    rating: s.ratings.length
      ? s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length
      : null,
  }));
  res.json(data);
});

// List users with filters
router.get("/users", async (req, res) => {
  const { name, email, address, role } = req.query as Record<
    string,
    string | undefined
  >;
  const users = await prisma.user.findMany({
    where: {
      AND: [
        name ? { name: { contains: name } } : {},
        email ? { email: { contains: email } } : {},
        address ? { address: { contains: address } } : {},
        role ? { role: role as any } : {},
      ],
    },
    include: { store: { include: { ratings: true } } },
  });
  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    address: u.address,
    role: u.role,
    rating: u.store
      ? u.store.ratings.length
        ? u.store.ratings.reduce((a, b) => a + b.value, 0) /
          u.store.ratings.length
        : null
      : undefined,
  }));
  res.json(data);
});

export default router;
