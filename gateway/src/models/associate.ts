import User from './User';
import UserRole from './UserRole';

// User Associations
User.hasMany(UserRole, {
  foreignKey: 'user_id',
  as: 'roles',
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
