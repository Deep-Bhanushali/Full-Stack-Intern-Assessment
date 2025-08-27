"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
const owner_1 = __importDefault(require("./routes/owner"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", async (_req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({ status: "ok" });
    }
    catch (e) {
        res.status(500).json({ status: "error", error: String(e) });
    }
});
app.use("/api/auth", auth_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/user", user_1.default);
app.use("/api/owner", owner_1.default);
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server listening on ${port}`);
});
//# sourceMappingURL=index.js.map