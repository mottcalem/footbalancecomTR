import assert from "node:assert/strict";
import { test } from "node:test";
import { centerPhones, centerPhoneHref } from "../src/lib/centers/phones.ts";
import { centerSchema } from "../src/lib/centers/schema.ts";
import { CENTERS } from "../src/data/centers.ts";
test("legacy and separately stored phone numbers retain distinct callable links", () => {
  for (const value of ["0312 502 10 12 - 0507 690 46 45", "0312 502 10 12\n0507 690 46 45"]) {
    assert.deepEqual(centerPhones(value), ["0312 502 10 12", "0507 690 46 45"]);
    assert.deepEqual(centerPhones(value).map(centerPhoneHref), [
      "tel:03125021012",
      "tel:05076904645",
    ]);
  }
  assert.deepEqual(centerPhones(""), []);
  assert.equal(centerPhoneHref("444 4 224 ( dahili numara: 3579 )"), "tel:4444224;ext=3579");
  assert.equal(centerPhoneHref("+(90) 545 244 81 34"), "tel:+905452448134");
});
test("phone validation accepts existing records and rejects incomplete or excessive numbers", () => {
  const base = { ...CENTERS[0]!, active: true, sortOrder: 0 };
  assert.equal(centerSchema.safeParse({ ...base, phone: "12" }).success, false);
  assert.equal(
    centerSchema.safeParse({ ...base, phone: Array(6).fill("0555 000 00 00").join("\n") }).success,
    false,
  );
  for (const c of CENTERS)
    assert.equal(
      centerSchema.safeParse({ ...c, active: true, sortOrder: 0 }).success,
      true,
      c.name,
    );
});
