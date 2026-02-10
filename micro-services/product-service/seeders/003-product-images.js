const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

module.exports = {
  async up(queryInterface) {
    // Récupérer tous les produits
    const [products] = await queryInterface.sequelize.query(
      'SELECT id, name, is_service FROM products ORDER BY created_at ASC',
    );

    const serviceImageUrls = [
      // SOC
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      // EDR
      'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a84e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13e493e?w=400&h=400&fit=crop',
      // XDR
      'https://images.unsplash.com/photo-1550439062-7cdcad8af205?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
      // SIEM
      'https://images.unsplash.com/photo-1518611505868-48510c2e022c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
    ];

    const productImageUrls = [
      // Appliances
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=400&h=400&fit=crop',
      // Licences
      'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a84e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13e493e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1550439062-7cdcad8af205?w=400&h=400&fit=crop',
      // Formations
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      // Consulting
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    ];

    const productImages = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const imageUrl = products[i].is_service
          ? serviceImageUrls[i % serviceImageUrls.length]
          : productImageUrls[i % productImageUrls.length];

        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        productImages.push({
          id: uuidv4(),
          product_id: products[i].id,
          image: Buffer.from(response.data, 'binary'),
          alt_text: `Image du produit ${products[i].name}`,
          is_main: true,
        });

        // Ajouter une deuxième image pour certains produits
        if (i % 2 === 0) {
          const imageUrl2 = products[i].is_service
            ? serviceImageUrls[(i + 1) % serviceImageUrls.length]
            : productImageUrls[(i + 1) % productImageUrls.length];

          const response2 = await axios.get(imageUrl2, {
            responseType: 'arraybuffer',
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          productImages.push({
            id: uuidv4(),
            product_id: products[i].id,
            image: Buffer.from(response2.data, 'binary'),
            alt_text: `Image secondaire du produit ${products[i].name}`,
            is_main: false,
          });
        }
      } catch (error) {
        console.warn(`Impossible de récupérer l'image pour le produit ${products[i].name}`);
      }
    }

    await queryInterface.bulkInsert('product_images', productImages);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_images', {});
  },
};
