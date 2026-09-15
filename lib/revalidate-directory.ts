import { revalidatePath } from 'next/cache';

export type DirectoryKind = 'city' | 'car' | 'service';

export function revalidateDirectory(kind: DirectoryKind, slug?: string, previousSlug?: string): void {
  revalidatePath('/');
  revalidatePath('/', 'layout');
  revalidatePath('/[slug]/[service]', 'page');
  revalidatePath('/sitemap.xml');

  if (kind === 'city') {
    revalidatePath('/cities');
    revalidatePath('/city-service-sitemap.xml');
  } else if (kind === 'car') {
    revalidatePath('/cars');
  }

  if (slug) revalidatePath(`/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/${previousSlug}`);
}
