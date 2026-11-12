import "server-only";
import { SignJWT, importPKCS8 } from "jose";

// Videos use Mux "signed" playback, so a playback ID alone can't be shared or ripped.
// The site hands out short-lived tokens only to members whose tier covers the lesson.
export async function muxTokens(playbackId: string) {
  const kid = process.env.MUX_SIGNING_KEY_ID;
  const b64 = process.env.MUX_SIGNING_PRIVATE_KEY;
  if (!kid || !b64) return null;

  let pem = Buffer.from(b64, "base64").toString("utf8");
  if (pem.includes("BEGIN RSA PRIVATE KEY")) pem = await pkcs1ToPkcs8(pem);
  const key = await importPKCS8(pem, "RS256");

  const sign = (aud: "v" | "t" | "s") =>
    new SignJWT({ sub: playbackId, aud })
      .setProtectedHeader({ alg: "RS256", kid })
      .setExpirationTime("6h")
      .sign(key);

  const [playback, thumbnail, storyboard] = await Promise.all([sign("v"), sign("t"), sign("s")]);
  return { playback, thumbnail, storyboard };
}

// Mux hands out PKCS#1 keys; jose wants PKCS#8.
async function pkcs1ToPkcs8(pem: string) {
  const { createPrivateKey } = await import("node:crypto");
  return createPrivateKey(pem).export({ type: "pkcs8", format: "pem" }).toString();
}
