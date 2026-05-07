'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            "ALTER TABLE promotions MODIFY COLUMN discount_type ENUM('service', 'product', 'cart') NOT NULL"
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            "ALTER TABLE promotions MODIFY COLUMN discount_type ENUM('service', 'product') NOT NULL"
        );
    },
};
