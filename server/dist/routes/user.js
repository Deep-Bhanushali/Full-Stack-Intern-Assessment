"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.requireRole)("USER"));
// List/search stores with user's rating and overall average
router.get("/stores", async (req, res) => {
    const { qName, qAddress } = req.query;
    const userId = req.user.userId;
    const stores = await prisma_1.default.store.findMany({
        where: {
            AND: [
                qName ? { name: { contains: qName } } : {},
                qAddress ? { address: { contains: qAddress } } : {},
            ],
        },
        include: { ratings: true },
    });
    const data = stores.map((s) => {
        const avg = s.ratings.length ? s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length : null;
        const mine = s.ratings.find((r) => r.userId === userId)?.value ?? null;
        return { id: s.id, name: s.name, address: s.address, averageRating: avg, myRating: mine };
    });
    res.json(data);
});
const ratingSchema = zod_1.z.object({
    storeId: zod_1.z.number().int().positive(),
    value: zod_1.z.number().int().min(1).max(5),
});
router.post("/rate", async (req, res) => {
    const parsed = ratingSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { storeId, value } = parsed.data;
    const userId = req.user.userId;
    const rating = await prisma_1.default.rating.upsert({
        where: { userId_storeId: { userId, storeId } },
        create: { userId, storeId, value },
        update: { value },
    });
    res.status(201).json({ id: rating.id, value: rating.value });
});
exports.default = router;
//# sourceMappingURL=user.js.map