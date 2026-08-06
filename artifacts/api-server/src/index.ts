import app from "./app";
import { logger } from "./lib/logger";
import { autoSetup } from "@workspace/db/setup";

const rawPort = process.env["PORT"] ?? "3000";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

logger.info("⚙️  جارٍ إعداد قاعدة البيانات...");

autoSetup()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "❌ فشل إعداد قاعدة البيانات — تأكد من صحة DATABASE_URL");
    process.exit(1);
  });
