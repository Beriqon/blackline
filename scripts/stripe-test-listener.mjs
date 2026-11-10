import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!/^(sk|rk)_test_/.test(key ?? "")) throw new Error("A Stripe test key is required.");

// Pass the API key only through the child environment, never through arguments.
const command = "npm exec --yes --package @stripe/cli@1.55.8 -- stripe listen --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed --forward-to http://127.0.0.1:3000/api/stripe/webhook";
const child = process.platform === "win32"
  ? spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", command], { env: { ...process.env, STRIPE_API_KEY: key }, windowsHide: true })
  : spawn("npm", ["exec", "--yes", "--package", "@stripe/cli@1.55.8", "--", "stripe", "listen", "--events", "checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed", "--forward-to", "http://127.0.0.1:3000/api/stripe/webhook"], { env: { ...process.env, STRIPE_API_KEY: key } });

let pending = "", saved = false;
function logLine(line) {
  const secret = line.match(/whsec_[A-Za-z0-9]+/)?.[0];
  if (secret && !saved) {
    const path = resolve(".env.local");
    let env = readFileSync(path, "utf8");
    const setting = `STRIPE_WEBHOOK_SECRET=${secret}`;
    env = /^STRIPE_WEBHOOK_SECRET=.*$/m.test(env)
      ? env.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, setting)
      : `${env.trimEnd()}\n${setting}\n`;
    writeFileSync(path, env);
    saved = true;
    console.log("Sandbox webhook secret saved to .env.local. Keep this listener running.");
  }
  console.log(line.replace(/whsec_[A-Za-z0-9]+/g, "[webhook secret hidden]"));
}
function output(chunk) {
  pending += chunk.toString();
  const lines = pending.split(/[\r\n]+/);
  pending = lines.pop() ?? "";
  for (const line of lines) if (line) logLine(line);
}
child.stdout.on("data", output);
child.stderr.on("data", output);
child.on("error", () => { console.error("Could not start the Stripe test listener."); process.exitCode = 1; });
child.on("exit", code => { if (pending) logLine(pending); process.exitCode = code ?? 1; });
