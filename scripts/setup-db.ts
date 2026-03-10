import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up database tables...')

    // Create products table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
    }).catch(() => null)

    // Create transactions table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          total DECIMAL(10, 2) NOT NULL,
          items_count INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    }).catch(() => null)

    // Create transaction_items table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS transaction_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id),
          quantity INTEGER NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    }).catch(() => null)

    console.log('Database setup complete!')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()
