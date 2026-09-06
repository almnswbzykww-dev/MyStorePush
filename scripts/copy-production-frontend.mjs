import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "artifacts", "store", "dist", "public");
const target = path.join(root, "artifacts", "api-server", "dist", "public");

await mkdir(path.dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`Production frontend copied to ${path.relative(root, target)}`);