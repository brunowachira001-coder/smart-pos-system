import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // CREATE - Add new product
  if (req.method === 'POST') {
    try {
      const { 
        name, 
        sku, 
        category, 
        costPrice, 
        retailPrice, 
        wholesalePrice,
        stockQuantity,
        minimumStockLevel,
        variantOf,
        imageUrl,
        description,
        barcode
      } = req.body;

      if (!name || !sku || !category) {
        return res.status(400).json({ error: 'Name, SKU, and category are required' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name,
          sku,
          category,
          cost_price: costPrice || 0,
          retail_price: retailPrice || 0,
          wholesale_price: wholesalePrice || 0,
          stock_quantity: stockQuantity || 0,
          minimum_stock_level: minimumStockLevel || 10,
          variant_of: variantOf || null,
          image_url: imageUrl || null,
          description: description || null,
          barcode: barcode || null,
          status: 'active',
          // Keep old fields for backward compatibility
          price: retailPrice || 0,
          stock: stockQuantity || 0
        }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ product: data });

    } catch (error: any) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: error.message || 'Failed to create product' });
    }
  }

  // UPDATE - Edit existing product
  if (req.method === 'PUT') {
    try {
      const { 
        id,
        name, 
        sku, 
        category, 
        costPrice, 
        retailPrice, 
        wholesalePrice,
        stockQuantity,
        minimumStockLevel,
        variantOf,
        imageUrl,
        description,
        barcode,
        status
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (sku) updateData.sku = sku;
      if (category) updateData.category = category;
      if (costPrice !== undefined) updateData.cost_price = costPrice;
      if (retailPrice !== undefined) {
        updateData.retail_price = retailPrice;
        updateData.price = retailPrice; // Backward compatibility
      }
      if (wholesalePrice !== undefined) updateData.wholesale_price = wholesalePrice;
      if (stockQuantity !== undefined) {
        updateData.stock_quantity = stockQuantity;
        updateData.stock = stockQuantity; // Backward compatibility
      }
      if (minimumStockLevel !== undefined) updateData.minimum_stock_level = minimumStockLevel;
      if (variantOf !== undefined) updateData.variant_of = variantOf;
      if (imageUrl !== undefined) updateData.image_url = imageUrl;
      if (description !== undefined) updateData.description = description;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (status) updateData.status = status;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ product: data });

    } catch (error: any) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: error.message || 'Failed to update product' });
    }
  }

  // DELETE - Remove product
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Product deleted successfully' });

    } catch (error: any) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
