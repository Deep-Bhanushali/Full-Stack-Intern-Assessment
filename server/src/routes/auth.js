"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(20).max(60),
    email: zod_1.z.string().email(),
    address: zod_1.z.string().max(400),
    password: zod_1.z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
});
router.post("/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { name, email, address, password } = parsed.data;
    const exists = await prisma_1.default.user.findUnique({ where: { email } });
    if (exists)
        return res.status(409).json({ message: "Email already registered" });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({ data: { name, email, address, passwordHash, role: "USER" } });
    res.status(201).json({ id: user.id });
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(16),
});
router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { email, password } = parsed.data;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});
const passwordSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
    newPassword: zod_1.z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
});
router.post("/password", async (req, res) => {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { userId, newPassword } = parsed.data;
    const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({ where: { id: userId }, data: { passwordHash } });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=auth.js.map