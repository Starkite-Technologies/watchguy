import test from "node:test";
import assert from "node:assert/strict";
import { clientIp } from "../src/lib/client-ip";

const req = (headers: Record<string, string>) =>
  new Request("https://example.test/api", { headers });

test("uses the last X-Forwarded-For entry by default", () => {
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
  assert.equal(
    clientIp(req({ "x-forwarded-for": "6.6.6.6, 41.182.1.2" })),
    "41.182.1.2",
  );
  assert.equal(clientIp(req({})), "local");
});

test("prefers the configured trusted proxy header", () => {
  process.env.TRUSTED_CLIENT_IP_HEADER = "CF-Connecting-IP";
  try {
    assert.equal(
      clientIp(
        req({
          "cf-connecting-ip": "41.182.1.2",
          "x-forwarded-for": "41.182.1.2, 172.70.1.1",
        }),
      ),
      "41.182.1.2",
    );
    // Falls back when the trusted header is absent.
    assert.equal(
      clientIp(req({ "x-forwarded-for": "172.70.1.1" })),
      "172.70.1.1",
    );
  } finally {
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
  }
});
