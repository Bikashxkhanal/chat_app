"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_test_1 = require("node:test");
var strict_1 = require("node:assert/strict");
var message_type_ts_1 = require("./message.type.ts");
(0, node_test_1.describe)("message lifecycle", function () {
    (0, node_test_1.it)("exposes all production states", function () {
        strict_1.default.equal(message_type_ts_1.MESSAGE_STATUS.SENDING, "sending");
        strict_1.default.equal(message_type_ts_1.MESSAGE_STATUS.SENT, "sent");
        strict_1.default.equal(message_type_ts_1.MESSAGE_STATUS.DELIVERED, "delivered");
        strict_1.default.equal(message_type_ts_1.MESSAGE_STATUS.SEEN, "seen");
        strict_1.default.equal(message_type_ts_1.MESSAGE_STATUS.FAILED, "failed");
    });
});
