export type Role = "ADMIN" | "USER" | "OWNER";

export interface JwtPayload {
  userId: number;
  role: Role;
}

