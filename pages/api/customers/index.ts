import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getCustomer(req, res);
      case 'POST':
        return await createCustomer(req, res);
      case 'PUT':
        return await updateCustomer(req, res);
      case 'DELETE':
        return await deleteCustomer(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Customer API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getCustomer(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.status(200).json({ customer: data });
}

async function createCustomer(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, phone, address, city, country, notes, customerType } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      country: country || 'Kenya',
      notes: notes || null,
      customer_type: customerType || 'retail',
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ customer: data, message: 'Customer created successfully' });
}

async function updateCustomer(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, email, phone, address, city, country, notes, customerType, status } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (country !== undefined) updateData.country = country;
  if (notes !== undefined) updateData.notes = notes;
  if (customerType !== undefined) updateData.customer_type = customerType;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ customer: data, message: 'Customer updated successfully' });
}

async function deleteCustomer(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Customer deleted successfully' });
}
