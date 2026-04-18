import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .order('name');

    // Get all returns
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('id, return_id, product_name, quantity, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (productsError || returnsError) {
      throw productsError || returnsError;
    }

    // Check for product name matches
    const analysis = returns?.map(ret => {
      const exactMatch = products?.find(p => p.name === ret.product_name);
      const caseInsensitiveMatch = products?.find(p => 
        p.name.toLowerCase() === ret.product_name.toLowerCase()
      );
      const partialMatch = products?.find(p => 
        p.name.toLowerCase().includes(ret.product_name.toLowerCase()) ||
        ret.product_name.toLowerCase().includes(p.name.toLowerCase())
      );

      return {
        returnId: ret.return_id,
        returnProductName: ret.product_name,
        quantity: ret.quantity,
        status: ret.status,
        exactMatch: exactMatch ? { name: exactMatch.name, stock: exactMatch.stock_quantity } : null,
        caseInsensitiveMatch: caseInsensitiveMatch ? { name: caseInsensitiveMatch.name, stock: caseInsensitiveMatch.stock_quantity } : null,
        partialMatch: partialMatch ? { name: partialMatch.name, stock: partialMatch.stock_quantity } : null,
      };
    });

    res.status(200).json({
      success: true,
      totalProducts: products?.length || 0,
      totalReturns: returns?.length || 0,
      products: products?.slice(0, 10),
      returns: returns,
      analysis,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
