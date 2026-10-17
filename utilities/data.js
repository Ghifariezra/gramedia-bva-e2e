export const makeKeyword = (length, char = "a") => char.repeat(length);

export const parsePrice = (text) => String(text ?? "").replace(/[^0-9]/g, "");
