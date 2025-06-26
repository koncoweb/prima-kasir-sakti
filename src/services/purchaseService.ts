
import { supabase } from '@/integrations/supabase/client';
import { PurchaseTransaction, CreatePurchaseData } from '@/types/purchase';

export const fetchPurchasesFromDB = async (inventoryItemId?: string): Promise<PurchaseTransaction[]> => {
  let query = supabase
    .from('purchase_transactions')
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
      supplier:suppliers!supplier_id(id, name),
      inventory_item:inventory_items!inventory_item_id(id, name, unit)
    `)
    .order('created_at', { ascending: false });
  
  if (inventoryItemId) {
    query = query.eq('inventory_item_id', inventoryItemId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching purchases:', error);
    throw new Error(`Failed to fetch purchases: ${error.message}`);
  }
  
  return data || [];
};

export const createPurchaseInDB = async (purchaseData: CreatePurchaseData): Promise<PurchaseTransaction> => {
  try {
    const total_amount = purchaseData.quantity_purchased * purchaseData.unit_price;
    
    const { data, error } = await supabase
      .from('purchase_transactions')
      .insert([{
        supplier_id: purchaseData.supplier_id,
        inventory_item_id: purchaseData.inventory_item_id,
        quantity_purchased: purchaseData.quantity_purchased,
        unit_price: purchaseData.unit_price,
        total_amount,
        invoice_number: purchaseData.invoice_number || null,
        notes: purchaseData.notes || null
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
        supplier:suppliers!supplier_id(id, name),
        inventory_item:inventory_items!inventory_item_id(id, name, unit)
      `)
      .single();
    
    if (error) {
      console.error('Error creating purchase:', error);
      throw new Error(`Failed to create purchase: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from purchase creation');
    }
    
    return data;
  } catch (error) {
    console.error('Error in createPurchaseInDB:', error);
    throw error;
  }
};

export const updatePurchaseInDB = async (
  id: string, 
  updates: Partial<PurchaseTransaction>
): Promise<PurchaseTransaction> => {
  const { data, error } = await supabase
    .from('purchase_transactions')
    .update(updates)
    .eq('id', id)
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
      supplier:suppliers!supplier_id(id, name),
      inventory_item:inventory_items!inventory_item_id(id, name, unit)
    `)
    .single();
  
  if (error) {
    console.error('Error updating purchase:', error);
    throw new Error(`Failed to update purchase: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from purchase update');
  }
  
  return data;
};

export const deletePurchaseFromDB = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('purchase_transactions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting purchase:', error);
    throw new Error(`Failed to delete purchase: ${error.message}`);
  }
};
