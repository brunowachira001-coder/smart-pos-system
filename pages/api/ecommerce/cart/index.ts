import type { NextApiRequest, NextApiResponse } from 'next';
import { secureRoute, SecureRequest } from '@/lib/secure-route';
import {
  getOrCreateCart,
  addToCart,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity
} from '@/services/ecommerce.service';

async function handler(req: SecureRequest, res: NextApiResponse) {
  const { method } = req;
  const tenantId = req.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Get or create cart
        const { customerId, sessionId } = req.query;

        const result = await getOrCreateCart(
          tenantId,
          customerId as string,
          sessionId as string
        );

        if (!result.success) {
          return res.status(500).json({ error: 'Failed to get cart' });
        }

        // Get cart items
        const itemsResult = await getCartItems(tenantId, result.data.id);

        if (!itemsResult.success) {
          return res.status(500).json({ error: 'Failed to get cart items' });
        }

        return res.status(200).json({
          cart: result.data,
          items: itemsResult.data
        });
      }

      case 'POST': {
        // Add item to cart
        const { cartId, productId, quantity, size, color } = req.body;

        if (!cartId || !productId || !quantity) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await addToCart({
          tenantId,
          cartId,
          productId,
          quantity,
          size,
          color
        });

        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
      }

      case 'PUT': {
        // Update cart item quantity
        const { itemId, quantity } = req.body;

        if (!itemId || quantity === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await updateCartItemQuantity(tenantId, itemId, quantity);

        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
      }

      case 'DELETE': {
        // Remove item from cart
        const { itemId } = req.query;

        if (!itemId) {
          return res.status(400).json({ error: 'Item ID required' });
        }

        const result = await removeFromCart(tenantId, itemId as string);

        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: 'Item removed from cart' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error: any) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default secureRoute(handler);
