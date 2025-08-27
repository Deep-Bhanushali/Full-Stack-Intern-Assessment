import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import prisma from "../prisma";
import { z } from "zod";

const router = Router();

router.use(authenticate, requireRole("USER"));

// List/search stores with user's rating and overall average
router.get("/stores", async (req, res) => {
  const { qName, qAddress } = req.query as Record<string, string | undefined>;
  const userId = req.user!.userId;
  const stores = await prisma.store.findMany({
    where: {
      AND: [
        qName ? { name: { contains: qName } } : {},
        qAddress ? { address: { contains: qAddress } } : {},
      ],
    },
    include: { ratings: true },
  });
  const data = stores.map((s) => {
    const avg = s.ratings.length
      ? s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length
      : null;
    const mine = s.ratings.find((r) => r.userId === userId)?.value ?? null;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      averageRating: avg,
      myRating: mine,
    };
  });
  res.json(data);
});

const ratingSchema = z.object({
  storeId: z.number().int().positive(),
  value: z.number().int().min(1).max(5),
});

router.post("/rate", async (req, res) => {
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { storeId, value } = parsed.data;
  const userId = req.user!.userId;
  const rating = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    create: { userId, storeId, value },
    update: { value },
  });
  res.status(201).json({ id: rating.id, value: rating.value });
});

export default router;
