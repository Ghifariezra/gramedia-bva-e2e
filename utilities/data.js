export const makeKeyword = (length, char = "a") => char.repeat(length);

export const parsePrice = (text) => String(text ?? "").replace(/[^0-9]/g, "");

// Password berisi huruf kapital, non-kapital, angka, dan simbol dengan panjang tepat `length`.
export function makePassword(length) {
    if (length < 4) throw new RangeError(`Password length must be at least 4, got ${length}`);
    return `Aa1!${"a".repeat(length - 4)}`;
}

// Email berformat valid dengan panjang total tepat `length`.
// Batas RFC 5321: local part maksimal 64 karakter, setiap label domain maksimal 63 karakter.
export function makeEmail(length) {
    const tld = "com";
    const minLength = 1 + 1 + 1 + 1 + tld.length; // a@b.com
    if (length < minLength) throw new RangeError(`Email length must be at least ${minLength}, got ${length}`);

    const localLength = Math.min(64, length - (minLength - 1));
    const labelsLength = length - localLength - 1 - (tld.length + 1);
    const labelCount = Math.ceil((labelsLength + 1) / 64);
    const letters = labelsLength - (labelCount - 1);
    const base = Math.floor(letters / labelCount);
    const extra = letters % labelCount;
    const labels = Array.from({ length: labelCount }, (_, i) => "b".repeat(base + (i < extra ? 1 : 0)));
    return `${"a".repeat(localLength)}@${labels.join(".")}.${tld}`;
}
