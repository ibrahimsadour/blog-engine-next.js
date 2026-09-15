import { revalidatePath } from 'next/cache';

export type DirectoryKind = 'city' | 'car' | 'service';

export function revalidateDirectory(kind: DirectoryKind, slug?: string, previousSlug?: string): void {
  revalidatePath('/');
  revalidatePath('/', 'layout');
  revalidatePath('/[slug]/[service]', 'page');
  revalidatePath('/sitemap.xml');
  revalidatePath('/directory-sitemap.xml');

  if (kind === 'city') {
    revalidatePath('/cities');
    revalidatePath('/city-service-sitemap.xml');
  } else if (kind === 'car') {
    revalidatePath('/cars');
    revalidatePath('/car-service-sitemap.xml');
  } else {
    revalidatePath('/city-service-sitemap.xml');
    revalidatePath('/car-service-sitemap.xml');
  }

  if (slug) revalidatePath(`/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/${previousSlug}`);
}
