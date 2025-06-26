
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface StockUpdateResult {
  success: boolean;
  error?: string;
}

export const updateInventoryStock = async (
  inventoryItemId: string,
  quantityPurchased: number
): Promise<StockUpdateResult> => {
  try {
    console.log('Updating inventory stock:', { inventoryItemId, quantityPurchased });
    
    // Get current stock first
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('current_stock, name')
      .eq('id', inventoryItemId)
      .single();

    if (fetchError) {
      console.error('Error fetching current stock:', fetchError);
      return { 
        success: false, 
        error: `Failed to fetch current stock: ${fetchError.message}` 
      };
    }

    if (!currentItem) {
      return { 
        success: false, 
        error: 'Inventory item not found' 
      };
    }

    const newStock = Number(currentItem.current_stock) + Number(quantityPurchased);
    console.log('Stock update calculation:', { 
      currentStock: currentItem.current_stock, 
      quantityPurchased, 
      newStock 
    });
    
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ 
        current_stock: newStock,
        last_restock_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', inventoryItemId);

    if (updateError) {
      console.error('Error updating stock:', updateError);
      return { 
        success: false, 
        error: `Failed to update stock: ${updateError.message}` 
      };
    }

    console.log(`Stock updated successfully for ${currentItem.name}: ${currentItem.current_stock} -> ${newStock}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateInventoryStock:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const updateSupplierItemInfo = async (
  supplierId: string,
  inventoryItemId: string,
  unitPrice: number
): Promise<StockUpdateResult> => {
  try {
    console.log('Updating supplier item info:', { supplierId, inventoryItemId, unitPrice });
    
    const { error } = await supabase
      .from('supplier_items')
      .update({ 
        last_purchase_date: new Date().toISOString().split('T')[0],
        unit_price: unitPrice
      })
      .eq('supplier_id', supplierId)
      .eq('inventory_item_id', inventoryItemId);

    if (error) {
      console.error('Error updating supplier item info:', error);
      return { 
        success: false, 
        error: `Failed to update supplier item: ${error.message}` 
      };
    }

    console.log('Supplier item info updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in updateSupplierItemInfo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
