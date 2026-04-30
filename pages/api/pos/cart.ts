import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getCart(req, res);
      case 'POST':
        return await addToCart(req, res);
      case 'PUT':
        return await updateCartItem(req, res);
      case 'DELETE':
        return await removeFromCart(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Cart API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getCart(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  console.log('Fetching cart for session:', sessionId); // Debug log

  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase error fetching cart:', error); // Debug log
    return res.status(500).json({ error: error.message });
  }

  console.log('Cart items found:', data?.length || 0); // Debug log

  const total = data.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  return res.status(200).json({
    items: data,
    total,
    itemCount: data.length
  });
}

async function addToCart(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId, productId, productName, sku, quantity, unitPrice, priceType } = req.body;

  console.log('Adding to cart:', { sessionId, productId, productName, quantity, unitPrice, priceType }); // Debug log

  if (!sessionId || !productId || !productName || !quantity || !unitPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const subtotal = quantity * unitPrice;

  // Check if item already exists in cart
  const { data: existing, error: existingError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .eq('price_type', priceType || 'retail')
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Error checking existing cart item:', existingError); // Debug log
    return res.status(500).json({ error: existingError.message });
  }

  if (existing) {
    // Update existing item
    const newQuantity = existing.quantity + quantity;
    const newSubtotal = newQuantity * unitPrice;

    console.log('Updating existing cart item:', existing.id, 'new quantity:', newQuantity); // Debug log

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: newQuantity,
        subtotal: newSubtotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error); // Debug log
      return res.status(500).json({ error: error.message });
    }

    console.log('Cart item updated successfully'); // Debug log
    return res.status(200).json({ item: data, message: 'Cart updated' });
  }

  // Add new item
  console.log('Adding new cart item'); // Debug log
  
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
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

  if (error) {
    console.error('Error adding cart item:', error); // Debug log
    return res.status(500).json({ error: error.message });
  }

  console.log('Cart item added successfully:', data.id); // Debug log
  return res.status(201).json({ item: data, message: 'Item added to cart' });
}

async function updateCartItem(req: NextApiRequest, res: NextApiResponse) {
  const { id, quantity } = req.body;

  if (!id || !quantity) {
    return res.status(400).json({ error: 'Item ID and quantity are required' });
  }

  // Get current item
  const { data: item } = await supabase
    .from('cart_items')
    .select('*')
    .eq('id', id)
    .single();

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const newSubtotal = quantity * item.unit_price;

  const { data, error } = await supabase
    .from('cart_items')
    .update({
      quantity,
      subtotal: newSubtotal,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ item: data, message: 'Cart item updated' });
}

async function removeFromCart(req: NextApiRequest, res: NextApiResponse) {
  const { id, sessionId } = req.query;

  if (id) {
    // Remove specific item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Item removed from cart' });
  }

  if (sessionId) {
    // Clear entire cart
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Cart cleared' });
  }

  return res.status(400).json({ error: 'Item ID or Session ID is required' });
}
