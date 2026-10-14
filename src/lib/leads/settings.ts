export function setting(env: unknown, key: string): string | undefined {
  const bindings = env && typeof env === "object" ? (env as Record<string, unknown>) : {};
  const value = bindings[key] ?? process.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
