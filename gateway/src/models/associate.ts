import User from './User';
import UserRole from './UserRole';

// User Associations
User.hasOne(UserRole, {
  foreignKey: 'user_id',
  as: 'userRole',
  onDelete: 'CASCADE',
});
UserRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});


export {
  User,
  UserRole,
};
