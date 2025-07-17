
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MaterialConsumption {
  inventory_item_id: string;
  quantity_consumed: number;
  item_name: string;
  available_stock: number;
}

export const consumeProductionMaterials = async (
  bomId: string, 
  quantityProduced: number
): Promise<{ success: boolean; error?: string; insufficientStock?: MaterialConsumption[] }> => {
  try {
    console.log('Starting material consumption for BOM:', bomId, 'Quantity:', quantityProduced);
    
    // Get BOM items with current inventory stock
    const { data: bomItems, error: bomError } = await supabase
      .from('bom_items')
      .select(`
        *,
        inventory_item:inventory_items!fk_bom_items_inventory_item(id, name, current_stock, unit)
      `)
      .eq('bom_id', bomId);

    if (bomError) {
      console.error('Error fetching BOM items:', bomError);
      return { success: false, error: `Failed to fetch BOM items: ${bomError.message}` };
    }

    if (!bomItems || bomItems.length === 0) {
      return { success: false, error: 'No materials found in BOM' };
    }

    // Calculate required materials and check availability
    const materialConsumptions: MaterialConsumption[] = [];
    const insufficientStock: MaterialConsumption[] = [];

    for (const bomItem of bomItems) {
      const requiredQuantity = bomItem.quantity_required * quantityProduced;
      const availableStock = bomItem.inventory_item?.current_stock || 0;
      
      const consumption: MaterialConsumption = {
        inventory_item_id: bomItem.inventory_item_id,
        quantity_consumed: requiredQuantity,
        item_name: bomItem.inventory_item?.name || 'Unknown Item',
        available_stock: availableStock
      };

      materialConsumptions.push(consumption);

      if (availableStock < requiredQuantity) {
        insufficientStock.push(consumption);
      }
    }

    // Check if we have sufficient stock for all materials
    if (insufficientStock.length > 0) {
      console.log('Insufficient stock for materials:', insufficientStock);
      return { 
        success: false, 
        error: 'Insufficient stock for production',
        insufficientStock 
      };
    }

    // Update inventory stock for each material
    for (const consumption of materialConsumptions) {
      const currentItem = bomItems.find(item => item.inventory_item_id === consumption.inventory_item_id);
      const newStock = consumption.available_stock - consumption.quantity_consumed;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', consumption.inventory_item_id);

      if (updateError) {
        console.error('Error updating inventory stock:', updateError);
        return { 
          success: false, 
          error: `Failed to update stock for ${consumption.item_name}: ${updateError.message}` 
        };
      }

      console.log(`Updated stock for ${consumption.item_name}: ${consumption.available_stock} -> ${newStock}`);
    }

    // Record production materials usage
    const productionMaterialsData = materialConsumptions.map(consumption => ({
      inventory_item_id: consumption.inventory_item_id,
      quantity_planned: consumption.quantity_consumed,
      quantity_used: consumption.quantity_consumed,
      unit_cost: bomItems.find(item => item.inventory_item_id === consumption.inventory_item_id)?.unit_cost || 0
    }));

    console.log('Material consumption completed successfully');
    return { success: true };

  } catch (error) {
    console.error('Error in consumeProductionMaterials:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const showInsufficientStockWarning = (insufficientStock: MaterialConsumption[]) => {
  const itemsList = insufficientStock.map(item => 
    `• ${item.item_name}: Butuh ${item.quantity_consumed}, Tersedia ${item.available_stock}`
  ).join('\n');

  toast({
    title: "Stok Tidak Mencukupi",
    description: `Tidak dapat menyelesaikan produksi karena stok tidak mencukupi:\n\n${itemsList}`,
    variant: "destructive"
  });
};
