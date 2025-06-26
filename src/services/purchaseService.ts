
import { supabase } from '@/integrations/supabase/client';
import { PurchaseTransaction, CreatePurchaseData } from '@/types/purchase';

export const fetchPurchasesFromDB = async (inventoryItemId?: string) => {
  let query = supabase
    .from('purchase_transactions')
    .select(`
      *,
      supplier:suppliers(id, name),
      inventory_item:inventory_items(id, name, unit)
    `)
    .order('created_at', { ascending: false });
  
  if (inventoryItemId) {
    query = query.eq('inventory_item_id', inventoryItemId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const createPurchaseInDB = async (purchaseData: CreatePurchaseData) => {
  const total_amount = purchaseData.quantity_purchased * purchaseData.unit_price;
  
  const { data, error } = await supabase
    .from('purchase_transactions')
    .insert([{
      ...purchaseData,
      total_amount
    }])
    .select(`
      id,
      transaction_number,
      supplier_id,
      inventory_item_id,
      quantity_purchased,
      unit_price,
      total_amount,
      purchase_date,
      invoice_number,
      notes,
      created_at,
      supplier:suppliers(id, name),
      inventory_item:inventory_items(id, name, unit)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePurchaseInDB = async (
  id: string, 
  updates: Partial<PurchaseTransaction>
) => {
  const { data, error } = await supabase
    .from('purchase_transactions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      supplier:suppliers(id, name),
      inventory_item:inventory_items(id, name, unit)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const deletePurchaseFromDB = async (id: string) => {
  const { error } = await supabase
    .from('purchase_transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
