declare module "connect-pg-simple" {
  import type { Store } from "express-session";

  interface PgStoreOptions {
    pool: unknown;
    tableName?: string;
    createTableIfMissing?: boolean;
  }

  class PgStore extends Store {
    constructor(options: PgStoreOptions);
  }

  function connectPgSimple(session: unknown): typeof PgStore;
  export default connectPgSimple;
}