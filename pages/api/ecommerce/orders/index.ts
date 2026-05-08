import type { NextApiRequest, NextApiResponse } from 'next';
import { secureRoute, SecureRequest } from '@/lib/secure-route';
import {
  createOrder,
  getOrder,
  updateOrderStatus,
  getCustomerOrders
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
        const { orderId, customerId } = req.query;

        if (orderId) {
          // Get single order
          const result = await getOrder(tenantId, orderId as string);

          if (!result.success) {
            return res.status(404).json({ error: 'Order not found' });
          }

          return res.status(200).json(result.data);
        } else if (customerId) {
          // Get customer orders
          const result = await getCustomerOrders(tenantId, customerId as string);

          if (!result.success) {
            return res.status(500).json({ error: 'Failed to get orders' });
          }

          return res.status(200).json(result.data);
        } else {
          return res.status(400).json({ error: 'Order ID or Customer ID required' });
        }
      }

      case 'POST': {
        // Create new order
        const { customerId, cartId, shippingAddress, paymentMethod, customerNotes } = req.body;

        if (!cartId || !shippingAddress || !paymentMethod) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate shipping address
        const requiredFields = ['fullName', 'phone', 'street', 'city', 'country'];
        for (const field of requiredFields) {
          if (!shippingAddress[field]) {
            return res.status(400).json({ error: `Missing ${field} in shipping address` });
          }
        }

        const result = await createOrder({
          tenantId,
          customerId,
          cartId,
          shippingAddress,
          paymentMethod,
          customerNotes
        });

        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.data);
      }

      case 'PUT': {
        // Update order status
        const { orderId, status } = req.body;

        if (!orderId || !status) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await updateOrderStatus(tenantId, orderId, status);

        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error: any) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default secureRoute(handler);
