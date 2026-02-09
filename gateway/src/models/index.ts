import { sequelize } from "../config/database";
import { Logger } from "../common/logger";

export const initDb = async () => {
  try {
    await sequelize.authenticate();
    Logger.info("Database connected");
  } catch (error: any) {
    Logger.error("Unable to connect to DB", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};