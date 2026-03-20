type Input = ArrayBuffer | Uint8Array | string;

function isBase64(s: string) {
  return /^[A-Za-z0-9+/=\s]+$/.test(s.replace(/\s+/g, ""));
}

function hexToUint8(hex: string) {
  const clean = hex.replace(/0x/i, "").replace(/\s+/g, "");
  const len = clean.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

function bufToBase64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

export default function byteaToImage(input: Input, mime = "image/png"): string {
  if (typeof input === "string") {
    const s = input.trim();
    if (s.startsWith("data:")) return s;
    if (/^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0) {
      return `data:${mime};base64,${bufToBase64(hexToUint8(s))}`;
    }
    if (isBase64(s)) return `data:${mime};base64,${s.replace(/\s+/g, "")}`;
    // fallback: encode as UTF-8 then base64
    return `data:${mime};base64,${btoa(unescape(encodeURIComponent(s)))}`;
  }

  return `data:${mime};base64,${bufToBase64(input)}`;
}
