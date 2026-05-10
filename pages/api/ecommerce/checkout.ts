/**
 * Public ecommerce checkout endpoint.
 * No auth token required — shop customers are not POS users.
 *
 * What it does:
 * 1. Validates cart items + stock
 * 2. Creates an online_order + online_order_items
 * 3. Creates a POS transaction + transaction_items (so it shows in the POS)
 * 4. Deducts inventory
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    tenantSlug,
    cartItems,
    shippingAddress,
    paymentMethod,
    customerNotes,
  }: {
    tenantSlug: string;
    cartItems: CartItem[];
    shippingAddress: {
      fullName: string;
      phone: string;
      email?: string;
      street: string;
      city: string;
      state?: string;
      postalCode?: string;
      country: string;
    };
    paymentMethod: string;
    customerNotes?: string;
  } = req.body;

  // ── Validate inputs ──────────────────────────────────────────────────────────
  if (!tenantSlug) return res.status(400).json({ error: 'tenantSlug is required' });
  if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street || !shippingAddress?.city) {
    return res.status(400).json({ error: 'Shipping address is incomplete' });
  }
  if (!paymentMethod) return res.status(400).json({ error: 'Payment method is required' });

  try {
    // ── Resolve tenant ───────────────────────────────────────────────────────
    const { data: tenant, error: tenantError } = await db
      .from('tenants')
      .select('id, business_name, business_phone')
      .eq('subdomain', tenantSlug)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const tenantId = tenant.id;

    // ── Validate stock for each item ─────────────────────────────────────────
    const productIds = cartItems.map(i => i.product_id);
    const { data: products, error: productsError } = await db
      .from('products')
      .select('id, name, retail_price, stock_quantity')
      .in('id', productIds)
      .eq('tenant_id', tenantId);

    if (productsError) return res.status(500).json({ error: 'Failed to verify products' });

    const productMap = new Map(products?.map(p => [p.id, p]) || []);

    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) return res.status(400).json({ error: `Product not found: ${item.product_name}` });
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`
        });
      }
    }

    // ── Calculate totals ─────────────────────────────────────────────────────
    const subtotal = cartItems.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

    // Look up delivery fee based on customer's city
    let deliveryFee = 0;
    let deliveryZone = 'Standard';
    try {
      const { data: zones } = await db
        .from('delivery_zones')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order');

      if (zones && zones.length > 0) {
        const cityLower = shippingAddress.city.toLowerCase().trim();
        const matched = zones.find((z: any) =>
          z.areas.some((area: string) => {
            const areaLower = area.toLowerCase().trim();
            return cityLower.includes(areaLower) || areaLower.includes(cityLower);
          })
        );
        if (matched) {
          deliveryFee = parseFloat(matched.delivery_fee) || 0;
          deliveryZone = matched.zone_name;
        } else if (zones.length > 0) {
          // Default to last zone
          const def = zones[zones.length - 1];
          deliveryFee = parseFloat(def.delivery_fee) || 0;
          deliveryZone = def.zone_name;
        }
      }
    } catch (zoneErr) {
      console.error('Zone lookup failed, using 0:', zoneErr);
    }

    const totalAmount = subtotal + deliveryFee;

    // ── Generate order number ────────────────────────────────────────────────
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ── Create online order ──────────────────────────────────────────────────
    const { data: order, error: orderError } = await db
      .from('online_orders')
      .insert({
        tenant_id: tenantId,
        order_number: orderNumber,
        subtotal,
        shipping_fee: deliveryFee,
        tax_amount: 0,
        total_amount: totalAmount,
        shipping_full_name: shippingAddress.fullName,
        shipping_phone: shippingAddress.phone,
        shipping_street: shippingAddress.street,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state || '',
        shipping_postal_code: shippingAddress.postalCode || '',
        shipping_country: shippingAddress.country,
        payment_method: paymentMethod,
        customer_notes: customerNotes || '',
        order_status: 'pending',
        payment_status: paymentMethod === 'mpesa' ? 'paid' : 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return res.status(500).json({ error: 'Failed to create order: ' + orderError.message });
    }

    // ── Create online order items ────────────────────────────────────────────
    const orderItems = cartItems.map(item => ({
      tenant_id: tenantId,
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.product_price,
      quantity: item.quantity,
      subtotal: item.product_price * item.quantity,
    }));

    const { error: orderItemsError } = await db.from('online_order_items').insert(orderItems);
    if (orderItemsError) {
      console.error('Order items error:', orderItemsError);
      // Clean up order
      await db.from('online_orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Failed to save order items' });
    }

    // ── POS transaction created when order is marked delivered (payment confirmed) ──
    // See /api/online-orders PATCH handler

    // ── Deduct inventory ─────────────────────────────────────────────────────
    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (product) {
        const newQty = Math.max(0, product.stock_quantity - item.quantity);
        await db
          .from('products')
          .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', item.product_id)
          .eq('tenant_id', tenantId);
      }
    }

    // ── SMS alert removed — shop staff use the Online Orders page in the POS ──

    return res.status(201).json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total: totalAmount,
      subtotal,
      deliveryFee,
      deliveryZone,
      items: cartItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'mpesa' ? 'paid' : 'pending',
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
