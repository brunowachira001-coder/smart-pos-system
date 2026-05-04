import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;
  const db = getAdminDb();
  const { method } = req;

  try {
    if (method === 'GET') {
      const { sessionId } = req.query;
      if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

      const { data, error } = await db
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true });

      if (error) return res.status(500).json({ error: error.message });

      const total = data?.reduce((sum: number, item: any) => sum + parseFloat(item.subtotal), 0) || 0;
      return res.status(200).json({ items: data || [], total, itemCount: data?.length || 0 });
    }

    if (method === 'POST') {
      const { sessionId, productId, productName, sku, quantity, unitPrice, priceType } = req.body;
      if (!sessionId || !productId || !productName || !quantity || !unitPrice) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const subtotal = quantity * unitPrice;

      // Check if item already exists
      const { data: existing } = await db
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId)
        .eq('product_id', productId)
        .eq('price_type', priceType || 'retail')
        .eq('tenant_id', tenantId)
        .single();

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const newSubtotal = newQuantity * unitPrice;

        const { data, error } = await db
          .from('cart_items')
          .update({ quantity: newQuantity, subtotal: newSubtotal, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ item: data, message: 'Cart updated' });
      }

      const { data, error } = await db
        .from('cart_items')
        .insert({
          tenant_id: tenantId,
          session_id: sessionId,
          product_id: productId,
          product_name: productName,
          sku,
          quantity,
          unit_price: unitPrice,
          price_type: priceType || 'retail',
          subtotal
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ item: data, message: 'Item added to cart' });
    }

    if (method === 'PUT') {
      const { id, quantity } = req.body;
      if (!id || !quantity) return res.status(400).json({ error: 'Item ID and quantity required' });

      const { data: item } = await db
        .from('cart_items')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (!item) return res.status(404).json({ error: 'Item not found' });

      const newSubtotal = quantity * item.unit_price;
      const { data, error } = await db
        .from('cart_items')
        .update({ quantity, subtotal: newSubtotal, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ item: data, message: 'Cart item updated' });
    }

    if (method === 'DELETE') {
      const { id, sessionId } = req.query;

      if (id) {
        const { error } = await db
          .from('cart_items')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenantId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Item removed from cart' });
      }

      if (sessionId) {
        const { error } = await db
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId)
          .eq('tenant_id', tenantId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Cart cleared' });
      }

      return res.status(400).json({ error: 'Item ID or Session ID is required' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  } catch (error: any) {
    console.error('Cart API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});
