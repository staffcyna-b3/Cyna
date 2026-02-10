const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Remplace les valeurs de l'enum
const CategoryType = {
  SERVICE: 'SERVICE',
  PRODUCT: 'PRODUCT',
};

module.exports = {
  async up(queryInterface) {
    const categories = [
      {
        id: uuidv4(),
        name: 'SOC (Security Operations Center)',
        description: 'Solutions de centre opérationnel de sécurité pour la surveillance et la gestion des menaces en temps réel',
        type: CategoryType.SERVICE,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'EDR (Endpoint Detection & Response)',
        description: 'Solutions de détection et réponse aux menaces sur les terminaux',
        type: CategoryType.SERVICE,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'XDR (Extended Detection & Response)',
        description: 'Solutions étendues de détection et réponse couvrant l\'ensemble de l\'infrastructure',
        type: CategoryType.SERVICE,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'SIEM (Security Information & Event Management)',
        description: 'Gestion centralisée des événements de sécurité et des informations',
        type: CategoryType.SERVICE,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Produits physiques
      {
        id: uuidv4(),
        name: 'Appliances de sécurité',
        description: 'Appliances matérielles pour la sécurité réseau et la protection des données',
        type: CategoryType.PRODUCT,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Licences logicielles',
        description: 'Licences pour les outils de sécurité et de gestion',
        type: CategoryType.PRODUCT,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Formations et certifications',
        description: 'Formations en sécurité informatique et certifications professionnelles',
        type: CategoryType.PRODUCT,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Consulting et audit',
        description: 'Services de consulting en sécurité et audit de conformité',
        type: CategoryType.PRODUCT,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const imageUrls = [
      // Services
      'https://images.unsplash.com/photo-1550439062-7cdcad8af205?w=400&h=400&fit=crop', // SOC
      'https://images.unsplash.com/photo-1563986768609-322da13e493e?w=400&h=400&fit=crop', // EDR
      'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a84e?w=400&h=400&fit=crop', // XDR
      'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=400&h=400&fit=crop', // SIEM
      // Produits
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', // Appliances
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop', // Licences
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', // Formations
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', // Consulting
    ];

    for (let i = 0; i < categories.length; i++) {
      try {
        const response = await axios.get(imageUrls[i], {
          responseType: 'arraybuffer',
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        categories[i].image = Buffer.from(response.data, 'binary');
      } catch (error) {
        console.warn(`Impossible de récupérer l'image pour ${categories[i].name}`);
        categories[i].image = null;
      }
    }

    await queryInterface.bulkInsert('categories', categories);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', {});
  },
};
