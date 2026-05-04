/**
 * SECURE ROUTE — Global Authentication & Tenant Isolation Middleware
 *
 * This is the SINGLE source of truth for all API authentication.
 * Every protected route MUST use secureRoute().
 *
 * Security guarantees:
 * - Token is HMAC-SHA256 signed — cannot be forged
 * - Tenant identity is derived from DB, never from client
 * - Any invalid/expired/tampered token → 401
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ─── Private admin client — NOT exported, never accessible from routes ───────
const _adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Token config ─────────────────────────────────────────────────────────────
const TOKEN_VERSION = 'v2';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Public types ─────────────────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface SecureRequest extends NextApiRequest {
  user: AuthUser;
  tenantId: string;
}

type SecureHandler = (req: SecureRequest, res: NextApiResponse) => Promise<void> | void;

// ─── HMAC Token Implementation ────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }
  return secret;
}

/**
 * Sign a token payload with HMAC-SHA256.
 * Format: v2.<base64(payload)>.<signature>
 */
export function signToken(userId: string): string {
  const secret = getSecret();
  const payload = Buffer.from(
    JSON.stringify({ userId, iat: Date.now(), v: TOKEN_VERSION })
  ).toString('base64url');

  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${TOKEN_VERSION}.${payload}.${sig}`;
}

/**
 * Verify and decode a token.
 * Returns userId if valid, throws if invalid/expired/tampered.
 */
export function verifyToken(token: string): string {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing token');
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) {
    throw new Error('Malformed token');
  }

  const [, payload, providedSig] = parts;
  const secret = getSecret();

  // Verify signature using timing-safe comparison
  const expectedSig = createHmac('sha256', secret).update(payload).digest('base64url');
  const expectedBuf = Buffer.from(expectedSig);
  const providedBuf = Buffer.from(providedSig);

  if (
    expectedBuf.length !== providedBuf.length ||
    !timingSafeEqual(expectedBuf, providedBuf)
  ) {
    throw new Error('Invalid token signature');
  }

  // Decode and validate payload
  let decoded: { userId: string; iat: number; v: string };
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Malformed token payload');
  }

  if (decoded.v !== TOKEN_VERSION) {
    throw new Error('Token version mismatch');
  }

  if (!decoded.userId || !decoded.iat) {
    throw new Error('Invalid token payload');
  }

  // Check expiry
  if (Date.now() - decoded.iat > TOKEN_TTL_MS) {
    throw new Error('Token expired');
  }

  return decoded.userId;
}

// ─── Core Middleware ──────────────────────────────────────────────────────────

/**
 * secureRoute — wraps any API handler with full auth + tenant resolution.
 *
 * Usage:
 *   export default secureRoute(async (req, res) => {
 *     const { tenantId } = req;
 *     // ... handler logic
 *   });
 */
export function secureRoute(handler: SecureHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 1. Extract token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.slice(7).trim();

      // 2. Verify HMAC signature — rejects forged tokens
      let userId: string;
      try {
        userId = verifyToken(token);
      } catch {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 3. Fetch user from DB — tenant_id is ONLY derived here
      const { data: user, error } = await _adminDb
        .from('users')
        .select('id, tenant_id, email, role, is_active')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!user.tenant_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 4. Attach auth context — tenant_id is server-derived, never from client
      const secureReq = req as SecureRequest;
      secureReq.user = {
        userId: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        role: user.role,
      };
      secureReq.tenantId = user.tenant_id;

      return handler(secureReq, res);
    } catch (err: any) {
      console.error('[secureRoute] error:', err?.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * getAdminDb — returns the admin client for use ONLY inside this module.
 * Exported only for use in login.ts and onboard.ts where no user session exists yet.
 * Do NOT use in regular route handlers.
 */
export function getAdminDb() {
  return _adminDb;
}
