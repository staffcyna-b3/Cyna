import { sequelize } from "../config/database.config";
import { Logger } from "../common/logger";
import '../models/associate';
import User from './User';
import UserRole from './UserRole';

export const initDb = async () => {
  try {
    User.hasOne(UserRole, { foreignKey: 'user_id', as: 'userRole' });
    UserRole.belongsTo(User, { foreignKey: 'user_id' });
    await sequelize.authenticate();
    Logger.info("Database connected");
  } catch (error: any) {
    Logger.error("Unable to connect to DB", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};