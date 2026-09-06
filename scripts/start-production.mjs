import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiEntry = path.join(root, "artifacts", "api-server", "dist", "index.mjs");
const frontendIndex = path.join(root, "artifacts", "api-server", "dist", "public", "index.html");

if (!existsSync(apiEntry) || !existsSync(frontendIndex)) {
  const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const build = spawnSync(packageManager, ["run", "build:production"], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const server = spawn(
  process.execPath,
  ["--enable-source-maps", apiEntry],
  {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: process.env.PORT ?? "3000",
    },
    stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}

server.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});