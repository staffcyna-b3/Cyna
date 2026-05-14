'use strict';

// Maps each product (by unique name) to its i18n key and original French values.
// up()   → replaces French name/description with snake_case key
// down() → restores original French name and description
const MIGRATIONS = [
    {
        oldName: 'Cyna SOC Starter',
        oldDescription: "Solution SOC d'entrée de gamme pour les PME avec surveillance 24/7 et alertes en temps réel",
        key: 'cyna_soc_starter',
    },
    {
        oldName: 'Cyna SOC Professional',
        oldDescription: 'Solution SOC complète avec analyse avancée des menaces et rapports détaillés',
        key: 'cyna_soc_professional',
    },
    {
        oldName: 'Cyna SOC Enterprise',
        oldDescription: "Solution SOC d'entreprise avec intégration personnalisée et support premium",
        key: 'cyna_soc_enterprise',
    },
    {
        oldName: 'Cyna EDR Essentials',
        oldDescription: 'Protection des terminaux avec détection des menaces et réponse automatisée',
        key: 'cyna_edr_essentials',
    },
    {
        oldName: 'Cyna EDR Advanced',
        oldDescription: 'EDR avancé avec analyse comportementale et investigation des incidents',
        key: 'cyna_edr_advanced',
    },
    {
        oldName: 'Cyna EDR Premium',
        oldDescription: 'EDR premium avec threat hunting et réponse aux incidents 24/7',
        key: 'cyna_edr_premium',
    },
    {
        oldName: 'Cyna XDR Unified',
        oldDescription: "Détection et réponse étendues couvrant tous les vecteurs d'attaque",
        key: 'cyna_xdr_unified',
    },
    {
        oldName: 'Cyna XDR Complete',
        oldDescription: 'XDR complet avec orchestration et automatisation des réponses',
        key: 'cyna_xdr_complete',
    },
    {
        oldName: 'Cyna XDR Elite',
        oldDescription: 'XDR élite avec IA avancée et prédiction des menaces',
        key: 'cyna_xdr_elite',
    },
    {
        oldName: 'Cyna SIEM Standard',
        oldDescription: 'Gestion centralisée des événements de sécurité pour les environnements mixtes',
        key: 'cyna_siem_standard',
    },
    {
        oldName: 'Cyna SIEM Advanced',
        oldDescription: "SIEM avancé avec corrélation d'événements et conformité réglementaire",
        key: 'cyna_siem_advanced',
    },
    {
        oldName: 'Cyna SIEM Enterprise',
        oldDescription: "SIEM d'entreprise avec scalabilité illimitée et support dédié",
        key: 'cyna_siem_enterprise',
    },
    {
        oldName: 'Cyna Firewall Pro',
        oldDescription: 'Appliance firewall haute performance pour la protection réseau',
        key: 'cyna_firewall_pro',
    },
    {
        oldName: 'Cyna IPS Enterprise',
        oldDescription: "Système de prévention d'intrusions pour les environnements critiques",
        key: 'cyna_ips_enterprise',
    },
    {
        oldName: 'Cyna DLP Gateway',
        oldDescription: 'Passerelle de prévention des fuites de données',
        key: 'cyna_dlp_gateway',
    },
    {
        oldName: 'Cyna WAF Shield',
        oldDescription: 'Web Application Firewall pour la protection des applications web',
        key: 'cyna_waf_shield',
    },
    {
        oldName: 'Licence Cyna Antivirus Pro',
        oldDescription: 'Licence antivirus pour 10 postes de travail',
        key: 'licence_cyna_antivirus_pro',
    },
    {
        oldName: 'Licence Cyna VPN Enterprise',
        oldDescription: 'Licence VPN pour 50 utilisateurs',
        key: 'licence_cyna_vpn_enterprise',
    },
    {
        oldName: 'Licence Cyna PAM Suite',
        oldDescription: 'Suite de gestion des accès privilégiés',
        key: 'licence_cyna_pam_suite',
    },
    {
        oldName: 'Formation Sécurité Réseau Avancée',
        oldDescription: 'Formation de 5 jours sur la sécurité réseau avancée',
        key: 'formation_securite_reseau_avancee',
    },
    {
        oldName: 'Certification Cyna SOC Analyst',
        oldDescription: "Certification professionnelle d'analyste SOC",
        key: 'certification_cyna_soc_analyst',
    },
    {
        oldName: 'Formation Incident Response',
        oldDescription: 'Formation pratique sur la réponse aux incidents de sécurité',
        key: 'formation_incident_response',
    },
    {
        oldName: 'Audit de sécurité complet',
        oldDescription: 'Audit complet de votre infrastructure de sécurité (3 jours)',
        key: 'audit_securite_complet',
    },
    {
        oldName: 'Conformité RGPD - Consulting',
        oldDescription: 'Service de consulting pour la mise en conformité RGPD',
        key: 'conformite_rgpd_consulting',
    },
    {
        oldName: 'Pentesting - 5 jours',
        oldDescription: 'Test de pénétration complet de votre infrastructure',
        key: 'pentesting_5_days',
    },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        for (const { oldName, key } of MIGRATIONS) {
            await queryInterface.sequelize.query(
                'UPDATE products SET name = ?, description = ? WHERE name = ?',
                { replacements: [key, key, oldName] }
            );
        }
    },

    async down(queryInterface) {
        for (const { oldName, oldDescription, key } of MIGRATIONS) {
            await queryInterface.sequelize.query(
                'UPDATE products SET name = ?, description = ? WHERE name = ?',
                { replacements: [oldName, oldDescription, key] }
            );
        }
    },
};
