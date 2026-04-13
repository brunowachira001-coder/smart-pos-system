import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;

    if (req.method === 'GET') {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: orders });
    } else if (req.method === 'POST') {
      const { shippingAddress, stripePaymentId } = req.body;

      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const items = cart.items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.productId.images[0],
      }));

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.1;
      const shippingCost = subtotal > 100 ? 0 : 10;
      const total = subtotal + tax + shippingCost;

      const order = await Order.create({
        userId,
        items,
        shippingAddress,
        subtotal,
        tax,
        shippingCost,
        total,
        stripePaymentId,
      });

      // Clear cart
      await Cart.findOneAndUpdate({ userId }, { items: [] });

      res.status(201).json({ success: true, data: order });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
