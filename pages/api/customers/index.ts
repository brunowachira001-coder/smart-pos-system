import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

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
  const { firstName, lastName, name, email, phone, customerType, debtLimit } = req.body;

  // Support both new format (firstName + lastName) and old format (name)
  const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();

  if (!fullName) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: fullName,
      email: email || null,
      phone: phone || null,
      customer_type: customerType || 'retail',
      debt_limit: debtLimit ? parseFloat(debtLimit) : null,
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
  const { id, name, email, phone, customerType, status, debtLimit } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (customerType !== undefined) updateData.customer_type = customerType;
  if (status !== undefined) updateData.status = status;
  if (debtLimit !== undefined) updateData.debt_limit = debtLimit ? parseFloat(debtLimit) : null;

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
