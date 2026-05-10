'use strict';

// Maps each category (by unique name) to its i18n key and original French description.
// up()   → replaces French text with snake_case key
// down() → restores original French text
const MIGRATIONS = [
    {
        name: 'SOC (Security Operations Center)',
        oldDescription: 'Solutions de centre opérationnel de sécurité pour la surveillance et la gestion des menaces en temps réel',
        newKey: 'soc',
    },
    {
        name: 'EDR (Endpoint Detection & Response)',
        oldDescription: 'Solutions de détection et réponse aux menaces sur les terminaux',
        newKey: 'edr',
    },
    {
        name: 'XDR (Extended Detection & Response)',
        oldDescription: 'Solutions étendues de détection et réponse couvrant l\'ensemble de l\'infrastructure',
        newKey: 'xdr',
    },
    {
        name: 'SIEM (Security Information & Event Management)',
        oldDescription: 'Gestion centralisée des événements de sécurité et des informations',
        newKey: 'siem',
    },
    {
        name: 'Appliances de sécurité',
        oldDescription: 'Appliances matérielles pour la sécurité réseau et la protection des données',
        newKey: 'security_appliances',
    },
    {
        name: 'Licences logicielles',
        oldDescription: 'Licences pour les outils de sécurité et de gestion',
        newKey: 'software_licenses',
    },
    {
        name: 'Formations et certifications',
        oldDescription: 'Formations en sécurité informatique et certifications professionnelles',
        newKey: 'training_and_certifications',
    },
    {
        name: 'Consulting et audit',
        oldDescription: 'Services de consulting en sécurité et audit de conformité',
        newKey: 'consulting_and_audit',
    },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        for (const { name, newKey } of MIGRATIONS) {
            await queryInterface.sequelize.query(
                'UPDATE categories SET description = ? WHERE name = ?',
                { replacements: [newKey, name] }
            );
        }
    },

    async down(queryInterface) {
        for (const { name, oldDescription } of MIGRATIONS) {
            await queryInterface.sequelize.query(
                'UPDATE categories SET description = ? WHERE name = ?',
                { replacements: [oldDescription, name] }
            );
        }
    },
};
