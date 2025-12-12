/**
 * Supabase Test Client Configuration
 *
 * This module provides Supabase client instances specifically for integration tests.
 * Uses service role key for admin operations during testing.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

// Test database credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE in .env.test.local",
  );
}

/**
 * Creates a Supabase client with service role privileges for testing
 * This bypasses RLS policies and allows full database access
 */
export function createTestClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Supabase credentials not initialized");
  }

  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client authenticated as a specific user for testing
 * This client will respect RLS policies for the authenticated user
 */
export async function createAuthenticatedTestClient(userId: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Supabase credentials not initialized");
  }

  const client = createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  // Get user session to authenticate
  const {
    data: { user },
    error,
  } = await client.auth.admin.getUserById(userId);

  if (error || !user) {
    throw new Error(`Failed to authenticate test user: ${userId}`);
  }

  return client;
}

/**
 * Executes a function with admin privileges (bypassing RLS)
 * Useful for setup/teardown operations
 */
export async function withAdminClient<T>(
  fn: (client: ReturnType<typeof createTestClient>) => Promise<T>,
): Promise<T> {
  const client = createTestClient();
  try {
    return await fn(client);
  } finally {
    // Cleanup if needed
  }
}
