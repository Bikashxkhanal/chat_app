import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MESSAGE_STATUS } from "./message.type.ts";

describe("message lifecycle", () => {
  it("exposes all production states", () => {
    assert.equal(MESSAGE_STATUS.SENDING, "sending");
    assert.equal(MESSAGE_STATUS.SENT, "sent");
    assert.equal(MESSAGE_STATUS.DELIVERED, "delivered");
    assert.equal(MESSAGE_STATUS.SEEN, "seen");
    assert.equal(MESSAGE_STATUS.FAILED, "failed");
  });
});
