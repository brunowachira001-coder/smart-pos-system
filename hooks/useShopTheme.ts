/**
 * useShopTheme — fetches tenant branding and injects CSS variables.
 *
 * Provides the shop's primary color, logo, name, and tagline.
 * Injects --shop-primary and derived variants as CSS custom properties
 * so all shop pages automatically pick up the tenant's brand color.
 */
import { useState, useEffect } from 'react';

export interface ShopTheme {
  name: string;
  slug: string;
  tagline: string | null;
  logo_url: string | null;
  primary: string;       // e.g. "#10b981"
  phone: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  loaded: boolean;
}

const DEFAULT_COLOR = '#10b981';

/** Lighten a hex color by mixing with white */
function lighten(hex: string, amount: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const mix = (c: number) => Math.round(c + (255 - c) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  } catch {
    return hex;
  }
}

/** Darken a hex color */
function darken(hex: string, amount: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const mix = (c: number) => Math.round(c * (1 - amount));
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  } catch {
    return hex;
  }
}

/** Inject CSS variables into :root for the shop theme */
function injectTheme(color: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--shop-primary', color);
  root.style.setProperty('--shop-primary-dark', darken(color, 0.15));
  root.style.setProperty('--shop-primary-light', lighten(color, 0.85));
  root.style.setProperty('--shop-primary-medium', lighten(color, 0.6));
}

export function useShopTheme(slug: string | string[] | undefined): ShopTheme {
  const [theme, setTheme] = useState<ShopTheme>({
    name: '',
    slug: '',
    tagline: null,
    logo_url: null,
    primary: DEFAULT_COLOR,
    phone: null,
    tiktok_url: null,
    instagram_url: null,
    facebook_url: null,
    loaded: false,
  });

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    // Apply default color immediately
    injectTheme(DEFAULT_COLOR);

    fetch(`/api/tenant/by-slug/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (!d.tenant) return;
        const color = d.tenant.theme_color || DEFAULT_COLOR;
        injectTheme(color);
        setTheme({
          name: d.tenant.name || slug,
          slug: d.tenant.slug || slug,
          tagline: d.tenant.tagline || null,
          logo_url: d.tenant.logo_url || null,
          primary: color,
          phone: d.tenant.phone || null,
          tiktok_url: d.tenant.tiktok_url || null,
          instagram_url: d.tenant.instagram_url || null,
          facebook_url: d.tenant.facebook_url || null,
          loaded: true,
        });
      })
      .catch(() => {
        setTheme(t => ({ ...t, name: String(slug), loaded: true }));
      });
  }, [slug]);

  return theme;
}
