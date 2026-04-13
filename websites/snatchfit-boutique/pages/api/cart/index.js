import dbConnect from '@/lib/db';
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
      let cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
      res.status(200).json({ success: true, data: cart });
    } else if (req.method === 'POST') {
      const { productId, quantity, size, color, price } = req.body;

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }

      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, size, color, price });
      }

      await cart.save();
      res.status(200).json({ success: true, data: cart });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
