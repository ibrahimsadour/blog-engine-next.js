import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { assertTopLevelSlugAvailable, normalizeSlug, validateDirectoryInput } from '../lib/content-input';

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error('DATABASE_URL is required for functional content tests.');

const db = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
const suffix = Date.now().toString(36);
const citySlug = `functional-city-${suffix}`;
const carSlug = `functional-car-${suffix}`;
const serviceSlug = `functional-service-${suffix}`;
const categorySlug = `functional-category-${suffix}`;

try {
  const category = await db.category.create({ data: { name: 'Functional category', slug: categorySlug } });
  const cityInput = validateDirectoryInput({ name: 'Functional City', slug: ` Functional City ${suffix} ` }, { topLevel: true });
  assert.equal(cityInput.slug, citySlug);
  const city = await db.$transaction(async (tx) => {
    await assertTopLevelSlugAvailable(tx, cityInput.slug);
    return tx.city.create({ data: cityInput });
  });
  const updatedCity = await db.city.update({ where: { id: city.id }, data: { description: 'Updated' } });
  assert.equal(updatedCity.description, 'Updated');

  await assert.rejects(() => db.$transaction((tx) => assertTopLevelSlugAvailable(tx, citySlug)));

  const car = await db.car.create({ data: { name: 'Functional Car', slug: carSlug } });
  const service = await db.service.create({ data: { name: 'Functional Service', slug: serviceSlug } });
  const page = await db.page.create({ data: { title: 'Functional Page', slug: `functional-page-${suffix}`, content: 'Content' } });
  const article = await db.article.create({ data: { title: 'Functional Article', slug: `functional-article-${suffix}`, content: 'Content', categoryId: category.id } });
  const custom = await db.cityServiceContent.create({ data: { cityId: city.id, serviceId: service.id, customTitle: 'Custom title', customDescription: 'Custom description' } });
  assert.equal(custom.customTitle, 'Custom title');

  const rollbackSlug = `rollback-service-${suffix}`;
  await assert.rejects(() => db.$transaction(async (tx) => {
    await tx.service.create({ data: { name: 'Rollback one', slug: rollbackSlug } });
    await tx.service.create({ data: { name: 'Rollback duplicate', slug: rollbackSlug } });
  }));
  assert.equal(await db.service.count({ where: { slug: rollbackSlug } }), 0);

  await db.cityServiceContent.delete({ where: { id: custom.id } });
  await db.article.delete({ where: { id: article.id } });
  await db.page.delete({ where: { id: page.id } });
  await db.service.delete({ where: { id: service.id } });
  await db.car.delete({ where: { id: car.id } });
  await db.city.delete({ where: { id: city.id } });
  await db.category.delete({ where: { id: category.id } });

  assert.equal(normalizeSlug(' Functional Test '), 'functional-test');
  process.stdout.write('Functional create, update, delete, custom content, collision and rollback tests passed.\n');
} finally {
  await db.$disconnect();
}
