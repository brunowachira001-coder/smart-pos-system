import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LogMovementParams {
  productId: string;
  tenantId: string;
  movementType: 'sale' | 'restock' | 'adjustment' | 'return' | 'initial_stock';
  stockType: 'Retail' | 'Wholesale';
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  relatedTransactionId?: string;
  relatedReturnId?: string;
  reason?: string;
  notes?: string;
  performedBy?: string;
  performedByName?: string;
}

export async function logInventoryMovement(params: LogMovementParams) {
  try {
    const {
      productId,
      tenantId,
      movementType,
      stockType,
      quantityChange,
      stockBefore,
      stockAfter,
      relatedTransactionId,
      relatedReturnId,
      reason,
      notes,
      performedBy,
      performedByName
    } = params;

    // Set tenant context
    await supabase.rpc('set_config', {
      setting: 'app.current_tenant_id',
      value: tenantId
    });

    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        tenant_id: tenantId,
        movement_type: movementType,
        stock_type: stockType,
        quantity_change: quantityChange,
        stock_before: stockBefore,
        stock_after: stockAfter,
        related_transaction_id: relatedTransactionId,
        related_return_id: relatedReturnId,
        reason: reason,
        notes: notes,
        performed_by: performedBy,
        performed_by_name: performedByName
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging inventory movement:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in logInventoryMovement:', error);
    return { success: false, error };
  }
}
