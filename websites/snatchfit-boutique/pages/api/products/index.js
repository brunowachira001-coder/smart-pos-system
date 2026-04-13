import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      const { category, minPrice, maxPrice, search } = req.query;
      let filter = {};

      if (category) filter.category = category;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect();

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
