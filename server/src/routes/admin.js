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
router.use(auth_1.authenticate, (0, auth_1.requireRole)("ADMIN"));
router.get("/dashboard", async (_req, res) => {
    const [users, stores, ratings] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.store.count(),
        prisma_1.default.rating.count(),
    ]);
    res.json({ users, stores, ratings });
});
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(20).max(60),
    email: zod_1.z.string().email(),
    address: zod_1.z.string().max(400),
    password: zod_1.z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
    role: zod_1.z.enum(["ADMIN", "USER", "OWNER"]).default("USER"),
});
router.post("/users", async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { name, email, address, password, role } = parsed.data;
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ message: "Email exists" });
    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.default.hash(password, 10);
    const user = await prisma_1.default.user.create({ data: { name, email, address, role, passwordHash } });
    res.status(201).json({ id: user.id });
});
const createStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().max(400),
    ownerId: zod_1.z.number().int().positive().optional(),
});
router.post("/stores", async (req, res) => {
    const parsed = createStoreSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { name, email, address, ownerId } = parsed.data;
    const store = await prisma_1.default.store.create({ data: { name, email, address, ownerId } });
    res.status(201).json({ id: store.id });
});
// List stores with filters and include average rating
router.get("/stores", async (req, res) => {
    const { name, email, address } = req.query;
    const stores = await prisma_1.default.store.findMany({
        where: {
            AND: [
                name ? { name: { contains: name, mode: "insensitive" } } : {},
                email ? { email: { contains: email, mode: "insensitive" } } : {},
                address ? { address: { contains: address, mode: "insensitive" } } : {},
            ],
        },
        include: { ratings: true, owner: true },
    });
    const data = stores.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: s.ratings.length ? s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length : null,
    }));
    res.json(data);
});
// List users with filters
router.get("/users", async (req, res) => {
    const { name, email, address, role } = req.query;
    const users = await prisma_1.default.user.findMany({
        where: {
            AND: [
                name ? { name: { contains: name, mode: "insensitive" } } : {},
                email ? { email: { contains: email, mode: "insensitive" } } : {},
                address ? { address: { contains: address, mode: "insensitive" } } : {},
                role ? { role: role } : {},
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
        rating: u.store ? (u.store.ratings.length ? u.store.ratings.reduce((a, b) => a + b.value, 0) / u.store.ratings.length : null) : undefined,
    }));
    res.json(data);
});
exports.default = router;
//# sourceMappingURL=admin.js.map