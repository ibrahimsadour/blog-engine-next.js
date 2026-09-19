export const SITE_PROFILES = ['automotive', 'home_services'] as const;

export type SiteProfile = (typeof SITE_PROFILES)[number];

export interface SiteFeatures {
  automotive: boolean;
  cars: boolean;
  carServiceTemplates: boolean;
}

export function getSiteProfile(value: string | undefined = process.env.SITE_PROFILE): SiteProfile {
  const normalized = value?.trim().toLowerCase().replace(/-/g, '_');

  return normalized === 'home_services' ? 'home_services' : 'automotive';
}

export function getSiteFeatures(profile: SiteProfile = getSiteProfile()): SiteFeatures {
  const automotive = profile === 'automotive';
  const dynamicContent = isDynamicContentEnabled();

  return {
    automotive,
    cars: automotive && dynamicContent,
    carServiceTemplates: automotive && dynamicContent,
  };
}

export function isAutomotiveSite(profile: SiteProfile = getSiteProfile()): boolean {
  return profile === 'automotive';
}

export function isDynamicContentEnabled(
  value: string | undefined = process.env.DYNAMIC_CONTENT_ENABLED,
): boolean {
  return value?.trim().toLowerCase() !== 'false';
}
