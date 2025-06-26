
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const updateInventoryStock = async (
  inventoryItemId: string,
  quantityPurchased: number
) => {
  try {
    // Get current stock first, then update it
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('current_stock')
      .eq('id', inventoryItemId)
      .single();

    if (fetchError) {
      console.error('Error fetching current stock:', fetchError);
      return false;
    }

    const newStock = currentItem.current_stock + quantityPurchased;
    
    const { error: stockError } = await supabase
      .from('inventory_items')
      .update({ 
        current_stock: newStock,
        last_restock_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', inventoryItemId);

    if (stockError) {
      console.error('Error updating stock:', stockError);
      toast({
        title: "Warning",
        description: "Pembelian berhasil, tapi gagal update stok otomatis",
        variant: "destructive"
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateInventoryStock:', error);
    return false;
  }
};

export const updateSupplierItemInfo = async (
  supplierId: string,
  inventoryItemId: string,
  unitPrice: number
) => {
  try {
    await supabase
      .from('supplier_items')
      .update({ 
        last_purchase_date: new Date().toISOString().split('T')[0],
        unit_price: unitPrice
      })
      .eq('supplier_id', supplierId)
      .eq('inventory_item_id', inventoryItemId);
  } catch (error) {
    console.error('Error updating supplier item info:', error);
  }
};
