import app from "../artifacts/api-server/src/app";
import { autoSetup } from "@workspace/db/setup";

const databaseReady = autoSetup();

export default async function handler(req: any, res: any) {
  await databaseReady;
  return app(req, res);
}