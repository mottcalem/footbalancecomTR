// Legacy records used a spaced dash; newly edited numbers use one line per number.
export function centerPhones(value: string): string[] {
  return value
    .split(/\r?\n|\s+-\s+|\s*;\s*/)
    .map((number) => number.trim())
    .filter(Boolean);
}
export function centerPhoneHref(number: string): string {
  const [main, extension] = number.split(/\(?\s*dahili(?:\s+numara)?\s*:?\s*/i);
  return `tel:${(main ?? "").replace(/[^\d+]/g, "")}${extension ? ";ext=" + extension.replace(/\D/g, "") : ""}`;
}
