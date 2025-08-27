"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.requireRole)("OWNER"));
router.get("/ratings", async (req, res) => {
    const ownerId = req.user.userId;
    const store = await prisma_1.default.store.findUnique({ where: { ownerId }, include: { ratings: { include: { user: true } } } });
    if (!store)
        return res.status(404).json({ message: "No store for owner" });
    const avg = store.ratings.length ? store.ratings.reduce((a, b) => a + b.value, 0) / store.ratings.length : null;
    const users = store.ratings.map((r) => ({ id: r.user.id, name: r.user.name, email: r.user.email, value: r.value }));
    res.json({ store: { id: store.id, name: store.name }, averageRating: avg, raters: users });
});
exports.default = router;
//# sourceMappingURL=owner.js.map