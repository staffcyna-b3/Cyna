'use strict';

const ACCENT_MAP = {
  à: 'a', â: 'a', ä: 'a', á: 'a', ã: 'a', å: 'a',
  è: 'e', ê: 'e', ë: 'e', é: 'e',
  ì: 'i', î: 'i', ï: 'i', í: 'i',
  ò: 'o', ô: 'o', ö: 'o', ó: 'o', õ: 'o', ø: 'o',
  ù: 'u', û: 'u', ü: 'u', ú: 'u',
  ý: 'y', ÿ: 'y',
  ñ: 'n', ç: 'c', ß: 'ss',
  æ: 'ae', œ: 'oe',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^ -~]/g, (ch) => ACCENT_MAP[ch] ?? '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = {
  async up(queryInterface) {
    const [products] = await queryInterface.sequelize.query(
      'SELECT id, name FROM products WHERE slug IS NULL'
    );

    if (!products.length) return;

    const [existingRows] = await queryInterface.sequelize.query(
      'SELECT slug FROM products WHERE slug IS NOT NULL'
    );
    const usedSlugs = new Set(existingRows.map((r) => r.slug));

    for (const product of products) {
      const base = slugify(product.name);
      let slug = base;
      let counter = 2;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${counter}`;
        counter++;
      }
      usedSlugs.add(slug);

      await queryInterface.sequelize.query(
        'UPDATE products SET slug = ? WHERE id = ?',
        { replacements: [slug, product.id] }
      );
    }
  },

  async down() {
    // Backfills are not reversible — slugs generated here cannot be distinguished from existing ones
  },
};
