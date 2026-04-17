const fs = require('fs');
const path = require('path');

const colorMappings = {
  // Background colors
  'bg-\\[#0a0e1a\\]': 'bg-[var(--bg-secondary)]',
  'bg-\\[#0f1419\\]': 'bg-[var(--bg-primary)]',
  'bg-\\[#1a1f2e\\]': 'bg-[var(--bg-tertiary)]',
  'bg-\\[#141824\\]': 'bg-[var(--card-bg)]',
  'bg-\\[#252b3d\\]': 'bg-[var(--bg-tertiary)]',
  'bg-white(?!-)': 'bg-[var(--card-bg)]',
  'bg-gray-50(?!-)': 'bg-[var(--bg-secondary)]',
  'bg-gray-100(?!-)': 'bg-[var(--bg-tertiary)]',
  
  // Text colors
  'text-white(?!-)': 'text-[var(--text-primary)]',
  'text-gray-900(?!-)': 'text-[var(--text-primary)]',
  'text-gray-800(?!-)': 'text-[var(--text-primary)]',
  'text-gray-700(?!-)': 'text-[var(--text-primary)]',
  'text-gray-600(?!-)': 'text-[var(--text-secondary)]',
  'text-gray-500(?!-)': 'text-[var(--text-secondary)]',
  'text-gray-400(?!-)': 'text-[var(--text-secondary)]',
  
  // Border colors
  'border-gray-800(?!-)': 'border-[var(--border-color)]',
  'border-gray-700(?!-)': 'border-[var(--border-color)]',
  'border-gray-300(?!-)': 'border-[var(--border-color)]',
  'border-gray-200(?!-)': 'border-[var(--border-color)]',
  'border-gray-100(?!-)': 'border-[var(--border-color)]',
};

const pagesToFix = [
  'pages/dashboard-pro.tsx',
  'pages/products-pro.tsx',
  'pages/inventory-pro.tsx',
  'pages/customers-pro.tsx',
  'pages/sales-pro.tsx',
  'pages/reports-pro.tsx',
  'pages/pos-advanced.tsx',
  'pages/ai-assistant.tsx',
  'pages/settings.tsx',
];

pagesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(colorMappings).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${filePath}`);
    } else {
      console.log(`- Skipped ${filePath} (no changes needed)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log('\nDone!');
