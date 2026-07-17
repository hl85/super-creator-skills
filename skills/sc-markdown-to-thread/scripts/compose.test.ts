import assert from "node:assert/strict";
import test from "node:test";
import { addHook, addCta, numberThread, type Tweet } from "./compose.ts";

test("addHook prepends a hook from title and lede when mode is auto", () => {
  const tweets = ["First tweet body.", "Second tweet."];
  const out = addHook(tweets, { mode: "auto", title: "My Title", maxLen: 270 });
  assert.equal(out.length, 3);
  assert.match(out[0], /My Title/);
});

test("addHook is a no-op when mode is off", () => {
  const tweets = ["Body."];
  const out = addHook(tweets, { mode: "off", title: "T", maxLen: 270 });
  assert.deepEqual(out, tweets);
});

test("addHook truncates hook to maxLen", () => {
  const tweets = ["Body."];
  const out = addHook(tweets, {
    mode: "auto",
    title: "T".repeat(400),
    maxLen: 50,
  });
  assert(out[0].length <= 50);
});

test("addCta appends CTA tweet when text given", () => {
  const tweets = ["A.", "B."];
  const out = addCta(tweets, { text: "Read more 👇" });
  assert.equal(out.length, 3);
  assert.equal(out[2], "Read more 👇");
});

test("addCta is a no-op when text is off/empty", () => {
  assert.deepEqual(addCta(["A."], { text: "off" }), ["A."]);
  assert.deepEqual(addCta(["A."], { text: "" }), ["A."]);
});

test("numberThread numbers tweets as i/N and includes total in each", () => {
  const out: Tweet[] = numberThread(["A.", "B.", "C."], { enabled: true });
  assert.equal(out.length, 3);
  assert.equal(out[0].index, 1);
  assert.equal(out[0].total, 3);
  assert.match(out[0].text, /1\/3/);
  assert.match(out[2].text, /3\/3/);
});

test("numberThread without numbering keeps text unchanged", () => {
  const out = numberThread(["A.", "B."], { enabled: false });
  assert.equal(out[0].text, "A.");
  assert.equal(out[1].text, "B.");
  assert.equal(out[1].index, 2);
  assert.equal(out[1].total, 2);
});

test("numberThread returns empty array for empty input", () => {
  assert.deepEqual(numberThread([], { enabled: true }), []);
});
