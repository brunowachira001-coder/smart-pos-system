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
    const { itemId } = req.query;

    if (req.method === 'PUT') {
      const { quantity } = req.body;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      item.quantity = quantity;
      await cart.save();

      res.status(200).json({ success: true, data: cart });
    } else if (req.method === 'DELETE') {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      cart.items.id(itemId).deleteOne();
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
