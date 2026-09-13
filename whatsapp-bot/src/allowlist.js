/**
 * Allowlist de WhatsApp: só números autorizados recebem resposta.
 * Fail-closed: lista vazia = ninguém é atendido.
 */

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function expandBrazil(value) {
  let digits = digitsOnly(value);
  if (!digits) return [];
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  const variants = new Set([digits]);
  if (digits.startsWith("55") && digits.length === 12) {
    variants.add(`${digits.slice(0, 4)}9${digits.slice(4)}`);
  }
  if (digits.startsWith("55") && digits.length === 13 && digits.charAt(4) === "9") {
    variants.add(`${digits.slice(0, 4)}${digits.slice(5)}`);
  }
  return [...variants];
}

function parseAllowlist(raw) {
  const allowed = new Set();
  String(raw || "")
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => expandBrazil(item).forEach((variant) => allowed.add(variant)));
  return allowed;
}

const ALLOWED_NUMBERS = parseAllowlist(process.env.ALLOWED_NUMBERS);

function isAllowedPhone(phone) {
  if (!ALLOWED_NUMBERS.size) return false;
  return expandBrazil(phone).some((variant) => ALLOWED_NUMBERS.has(variant));
}

function isPrivateUserChat(jid) {
  const from = String(jid || "");
  return from.endsWith("@c.us") || from.endsWith("@s.whatsapp.net");
}

function isGroupOrBroadcast(jid, msg = {}) {
  const from = String(jid || "");
  return Boolean(
    msg.isGroupMsg ||
      msg.broadcast ||
      msg.isStatus ||
      from.endsWith("@g.us") ||
      from.endsWith("@broadcast") ||
      from.endsWith("@newsletter") ||
      from === "status@broadcast"
  );
}

module.exports = {
  ALLOWED_NUMBERS,
  expandBrazil,
  isAllowedPhone,
  isGroupOrBroadcast,
  isPrivateUserChat,
};
