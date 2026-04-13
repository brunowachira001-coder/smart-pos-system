#!/bin/bash

# Update color variables in all HTML files
for file in quantyx_*.html; do
    echo "Updating $file..."
    
    # Replace old color variables with new ones
    sed -i 's/--primary: #0066ff/--primary: #007BFF/g' "$file"
    sed -i 's/--secondary: #00d4ff/--accent: #8A2BE2/g' "$file"
    sed -i 's/--dark: #0a0e27/--neutral: #222222/g' "$file"
    sed -i 's/--light: #f8f9fa/--background: #F8F8F8/g' "$file"
    sed -i 's/--text-dark: #1a1a1a/--neutral: #222222/g' "$file"
    sed -i 's/--text-light: #666666/--medium-gray: #666666/g' "$file"
    sed -i 's/--accent: #ff6b35/--accent: #8A2BE2/g' "$file"
    
    # Replace hardcoded colors
    sed -i 's/#0066ff/#007BFF/g' "$file"
    sed -i 's/#00d4ff/#8A2BE2/g' "$file"
    sed -i 's/#0a0e27/#222222/g' "$file"
    sed -i 's/#f8f9fa/#F8F8F8/g' "$file"
    sed -i 's/#1a1a1a/#222222/g' "$file"
    sed -i 's/#ff6b35/#8A2BE2/g' "$file"
    sed -i 's/color: #fff/color: var(--white)/g' "$file"
    sed -i 's/background: #fff/background: var(--white)/g' "$file"
    sed -i 's/color: var(--text-dark)/color: var(--neutral)/g' "$file"
    sed -i 's/color: var(--text-light)/color: var(--medium-gray)/g' "$file"
    sed -i 's/background: var(--light)/background: var(--background)/g' "$file"
    sed -i 's/background: var(--secondary)/background: var(--accent)/g' "$file"
    sed -i 's/var(--secondary)/var(--accent)/g' "$file"
    
done

echo "Color updates completed!"
