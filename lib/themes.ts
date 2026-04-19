// Theme configuration for the entire system
export const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f9fafb',
    '--bg-tertiary': '#f3f4f6',
    '--card-bg': '#ffffff',
    '--text-primary': '#111827',
    '--text-secondary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--accent-color': '#3b82f6',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--card-bg': '#1e293b',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#94a3b8',
    '--border-color': '#334155',
    '--accent-color': '#10b981',
  },
  blue: {
    '--bg-primary': '#0c1e3d',
    '--bg-secondary': '#1a2f52',
    '--bg-tertiary': '#2a4166',
    '--card-bg': '#1a2f52',
    '--text-primary': '#e0f2fe',
    '--text-secondary': '#7dd3fc',
    '--border-color': '#2a4166',
    '--accent-color': '#60a5fa',
  },
  ocean: {
    '--bg-primary': '#083344',
    '--bg-secondary': '#164e63',
    '--bg-tertiary': '#155e75',
    '--card-bg': '#164e63',
    '--text-primary': '#ecfeff',
    '--text-secondary': '#67e8f9',
    '--border-color': '#155e75',
    '--accent-color': '#22d3ee',
  },
  forest: {
    '--bg-primary': '#052e16',
    '--bg-secondary': '#14532d',
    '--bg-tertiary': '#166534',
    '--card-bg': '#14532d',
    '--text-primary': '#f0fdf4',
    '--text-secondary': '#86efac',
    '--border-color': '#166534',
    '--accent-color': '#4ade80',
  },
  system: {
    '--bg-primary': '#1e293b',
    '--bg-secondary': '#334155',
    '--bg-tertiary': '#475569',
    '--card-bg': '#334155',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#cbd5e1',
    '--border-color': '#475569',
    '--accent-color': '#94a3b8',
  },
};

export function applyTheme(themeName: keyof typeof themes) {
  const theme = themes[themeName];
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  localStorage.setItem('theme', themeName);
}

export function getCurrentTheme(): keyof typeof themes {
  const saved = localStorage.getItem('theme');
  return (saved as keyof typeof themes) || 'dark';
}

export function initializeTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);
}
