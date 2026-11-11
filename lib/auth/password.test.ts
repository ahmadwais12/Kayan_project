import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const hash = await hashPassword("Correct-Horse-Battery-9!");
    expect(hash).not.toContain("Correct-Horse");
    await expect(verifyPassword(hash, "Correct-Horse-Battery-9!")).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const hash = await hashPassword("Correct-Horse-Battery-9!");
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("produces a unique salt per hash", async () => {
    const first = await hashPassword("same-password");
    const second = await hashPassword("same-password");
    expect(first).not.toBe(second);
  });
});
