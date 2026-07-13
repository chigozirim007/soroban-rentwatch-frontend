import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Keypair } from "@stellar/stellar-sdk";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_development_secret_do_not_use_in_prod_123456"
);

export interface SessionPayload {
  publicKey: string;
}

export async function createSession(publicKey: string): Promise<string> {
  const jwt = await new SignJWT({ publicKey })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return jwt;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rw_session")?.value;
  if (!token) return null;
  return await verifySession(token);
}

/**
 * Verifies a message signed by Freighter (or any Ed25519 keypair via signBytes).
 * 
 * Note: Freighter's `signAuthEntry` or `signBytes` produces an Ed25519 signature.
 * We can verify it using StellarSdk Keypair.
 */
export function verifySignature(publicKey: string, message: string, signatureBase64: string): boolean {
  try {
    const kp = Keypair.fromPublicKey(publicKey);
    const signature = Buffer.from(signatureBase64, "base64");
    return kp.verify(Buffer.from(message), signature);
  } catch (error) {
    return false;
  }
}
