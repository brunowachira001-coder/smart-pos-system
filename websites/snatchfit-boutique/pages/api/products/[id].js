import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    await dbConnect();

    if (req.method === 'GET') {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: product });
    } else if (req.method === 'PUT') {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: product });
    } else if (req.method === 'DELETE') {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ success: true, message: 'Product deleted' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
