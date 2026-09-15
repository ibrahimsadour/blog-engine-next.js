CREATE INDEX `Article_isPublished_noIndex_publishedAt_idx`
  ON `Article`(`isPublished`, `noIndex`, `publishedAt`);

CREATE INDEX `Page_isPublished_noIndex_updatedAt_idx`
  ON `Page`(`isPublished`, `noIndex`, `updatedAt`);

CREATE INDEX `City_isActive_sortOrder_idx`
  ON `City`(`isActive`, `sortOrder`);

CREATE INDEX `Service_isActive_sortOrder_idx`
  ON `Service`(`isActive`, `sortOrder`);

CREATE INDEX `Car_isActive_sortOrder_idx`
  ON `Car`(`isActive`, `sortOrder`);
