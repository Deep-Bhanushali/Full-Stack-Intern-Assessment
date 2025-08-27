import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import prisma from "../prisma";

const router = Router();

router.use(authenticate, requireRole("OWNER"));

router.get("/ratings", async (req, res) => {
  const ownerId = req.user!.userId;
  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: { ratings: { include: { user: true } } },
  });
  if (!store) return res.status(404).json({ message: "No store for owner" });
  const avg = store.ratings.length
    ? store.ratings.reduce((a, b) => a + b.value, 0) / store.ratings.length
    : null;
  const users = store.ratings.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email,
    value: r.value,
  }));
  res.json({
    store: { id: store.id, name: store.name },
    averageRating: avg,
    raters: users,
  });
});

export default router;

