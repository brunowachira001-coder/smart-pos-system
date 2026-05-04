/**
 * Tenant Context Helper
 * 
 * Extracts tenant_id from API requests.
 * The tenant_id is sent by the frontend via the X-Tenant-ID header,
 * which is set from the user object stored in localStorage after login.
 * 
 * For single-tenant fallback, returns the Nyla Wigs tenant ID.
 */

import { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

const NYLA_WIGS_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get tenant_id from request.
 * Priority: X-Tenant-ID header → fallback to first active tenant
 */
export async function getTenantId(req: NextApiRequest): Promise<string> {
  // Check header first (set by frontend after login)
  const headerTenantId = req.headers['x-tenant-id'] as string;
  if (headerTenantId) {
    return headerTenantId;
  }

  // Fallback: look up by user ID if provided
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    const { data } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
    if (data?.tenant_id) return data.tenant_id;
  }

  // Final fallback: return Nyla Wigs tenant (safe for existing single-tenant usage)
  return NYLA_WIGS_TENANT_ID;
}

/**
 * Synchronous version - just reads the header.
 * Use this when you don't want async overhead.
 */
export function getTenantIdSync(req: NextApiRequest): string {
  return (req.headers['x-tenant-id'] as string) || NYLA_WIGS_TENANT_ID;
}
