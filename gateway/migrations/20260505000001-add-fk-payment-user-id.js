'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('payments', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_payments_user_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('payments', 'fk_payments_user_id');
  },
};
