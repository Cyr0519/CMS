import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET est manquante");
}

const encodedSecret = new TextEncoder().encode(JWT_SECRET);

const SALT_ROUNDS = 12;
const TOKEN_EXPIRATION = "24h";

export interface AuthTokenPayload {
  userId: number;
  roleId: number;
  email: string;
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, encodedSecret, {
    algorithms: ["HS256"],
  });

  return {
    userId: payload.userId as number,
    roleId: payload.roleId as number,
    email: payload.email as string,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
