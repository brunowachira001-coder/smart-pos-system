import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PricingIssue {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  issueType: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  description: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_archived', false);

    if (productsError) throw productsError;

    const issues: PricingIssue[] = [];
    let validCount = 0;
    const totalProducts = products?.length || 0;

    // Audit each product
    products?.forEach(product => {
      const costPrice = parseFloat(product.cost_price) || 0;
      const retailPrice = parseFloat(product.retail_price) || 0;
      const wholesalePrice = parseFloat(product.wholesale_price) || 0;
      
      let hasIssue = false;

      // Check 1: Missing cost price
      if (costPrice === 0 || !product.cost_price) {
        issues.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          issueType: 'missing_cost',
          costPrice,
          retailPrice,
          wholesalePrice,
          description: 'Missing cost price'
        });
        hasIssue = true;
      }

      // Check 2: Zero selling price (retail or wholesale)
      if ((retailPrice === 0 || !product.retail_price) && (wholesalePrice === 0 || !product.wholesale_price)) {
        issues.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          issueType: 'zero_selling_price',
          costPrice,
          retailPrice,
          wholesalePrice,
          description: 'Zero selling price (both retail and wholesale)'
        });
        hasIssue = true;
      }

      // Check 3: Selling below cost (retail)
      if (costPrice > 0 && retailPrice > 0 && retailPrice < costPrice) {
        issues.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          issueType: 'selling_below_cost',
          costPrice,
          retailPrice,
          wholesalePrice,
          description: `Retail price (${retailPrice}) below cost (${costPrice})`
        });
        hasIssue = true;
      }

      // Check 4: Selling below cost (wholesale)
      if (costPrice > 0 && wholesalePrice > 0 && wholesalePrice < costPrice) {
        issues.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          issueType: 'selling_below_cost',
          costPrice,
          retailPrice,
          wholesalePrice,
          description: `Wholesale price (${wholesalePrice}) below cost (${costPrice})`
        });
        hasIssue = true;
      }

      // Check 5: Unrealistic markup (>500%)
      if (costPrice > 0 && retailPrice > 0) {
        const markup = ((retailPrice - costPrice) / costPrice) * 100;
        if (markup > 500) {
          issues.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku || 'N/A',
            category: product.category || 'Uncategorized',
            issueType: 'unrealistic_markup',
            costPrice,
            retailPrice,
            wholesalePrice,
            description: `Unrealistic markup (${markup.toFixed(0)}%)`
          });
          hasIssue = true;
        }
      }

      if (!hasIssue && costPrice > 0 && (retailPrice > costPrice || wholesalePrice > costPrice)) {
        validCount++;
      }
    });

    // Group issues by type for summary
    const issuesSummary = {
      missingCost: issues.filter(i => i.issueType === 'missing_cost').length,
      zeroSellingPrice: issues.filter(i => i.issueType === 'zero_selling_price').length,
      sellingBelowCost: issues.filter(i => i.issueType === 'selling_below_cost').length,
      unrealisticMarkup: issues.filter(i => i.issueType === 'unrealistic_markup').length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        validPricing: validCount,
        issuesFound: issues.length,
        issuesSummary,
        issues: issues.slice(0, 50) // Limit to 50 for performance
      }
    });
  } catch (error: any) {
    console.error('Pricing audit error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        totalProducts: 0,
        validPricing: 0,
        issuesFound: 0,
        issuesSummary: {
          missingCost: 0,
          zeroSellingPrice: 0,
          sellingBelowCost: 0,
          unrealisticMarkup: 0,
        },
        issues: []
      }
    });
  }
}
