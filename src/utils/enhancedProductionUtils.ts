
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EnhancedMaterialConsumption {
  inventory_item_id: string;
  quantity_consumed: number;
  item_name: string;
  available_stock: number;
  variance_quantity?: number;
  variance_cost?: number;
}

export interface ProductionResult {
  success: boolean;
  error?: string;
  produced_quantity?: number;
  product_inventory_updated?: boolean;
  materials_consumed?: boolean;
  insufficientStock?: EnhancedMaterialConsumption[];
}

export interface ProductionCostAnalysis {
  production_order_id: string;
  order_number: string;
  quantity_to_produce: number;
  recipe_name: string;
  product_name: string;
  planned_cost: number;
  actual_cost: number;
  cost_variance: number;
  cost_per_unit: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface InventoryValuation {
  id: string;
  name: string;
  item_type: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  standard_cost: number;
  latest_cost: number;
  standard_value: number;
  latest_value: number;
  stock_status: 'LOW_STOCK' | 'OVERSTOCK' | 'NORMAL';
}

export interface BOMProfitability {
  id: string;
  bom_name: string;
  product_name: string;
  selling_price: number;
  production_cost: number;
  gross_profit: number;
  profit_margin_percent: number;
}

export const completeProductionOrderEnhanced = async (
  orderId: string
): Promise<ProductionResult> => {
  try {
    console.log('Starting enhanced production completion for order:', orderId);
    
    // Get production order details
    const { data: productionOrder, error: poError } = await supabase
      .from('production_orders')
      .select(`
        *,
        bill_of_materials!fk_production_orders_bom (
          *,
          products!fk_bill_of_materials_product (
            id,
            inventory_item_id
          ),
          bom_items!fk_bom_items_bom (
            *,
            inventory_items!fk_bom_items_inventory_item (
              id,
              name,
              current_stock
            )
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (poError || !productionOrder) {
      console.error('Error fetching production order:', poError);
      return { 
        success: false, 
        error: `Failed to fetch production order: ${poError?.message}` 
      };
    }

    const bom = productionOrder.bill_of_materials;
    if (!bom) {
      return { 
        success: false, 
        error: 'No BOM found for this production order' 
      };
    }

    // Check material availability
    const insufficientStock: EnhancedMaterialConsumption[] = [];
    const bomItems = Array.isArray(bom.bom_items) ? bom.bom_items : [];
    
    for (const bomItem of bomItems) {
      if (bomItem && typeof bomItem === 'object') {
        const requiredQty = (bomItem.quantity_required || 0) * productionOrder.quantity_to_produce;
        const inventoryItem = bomItem.inventory_items;
        const availableStock = (inventoryItem && typeof inventoryItem === 'object') ? inventoryItem.current_stock || 0 : 0;
        
        if (availableStock < requiredQty) {
          insufficientStock.push({
            inventory_item_id: bomItem.inventory_item_id || '',
            quantity_consumed: requiredQty,
            item_name: (inventoryItem && typeof inventoryItem === 'object') ? inventoryItem.name || 'Unknown' : 'Unknown',
            available_stock: availableStock
          });
        }
      }
    }

    if (insufficientStock.length > 0) {
      return {
        success: false,
        error: 'Insufficient stock for production',
        insufficientStock
      };
    }

    // Consume materials
    for (const bomItem of bomItems) {
      if (bomItem && typeof bomItem === 'object') {
        const requiredQty = (bomItem.quantity_required || 0) * productionOrder.quantity_to_produce;
        const inventoryItem = bomItem.inventory_items;
        const currentStock = (inventoryItem && typeof inventoryItem === 'object') ? inventoryItem.current_stock || 0 : 0;
        
        // Update inventory
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            current_stock: currentStock - requiredQty,
            updated_at: new Date().toISOString()
          })
          .eq('id', bomItem.inventory_item_id);

        if (updateError) {
          console.error('Error updating inventory:', updateError);
          return {
            success: false,
            error: `Failed to update inventory: ${updateError.message}`
          };
        }

        // Record material consumption
        const { error: materialError } = await supabase
          .from('production_materials')
          .upsert({
            production_order_id: orderId,
            inventory_item_id: bomItem.inventory_item_id,
            quantity_planned: requiredQty,
            quantity_used: requiredQty,
            unit_cost: bomItem.unit_cost || 0
          });

        if (materialError) {
          console.error('Error recording material usage:', materialError);
        }
      }
    }

    // Calculate produced quantity
    const producedQuantity = productionOrder.quantity_to_produce * (bom.yield_quantity || 1);
    let productInventoryUpdated = false;

    // Update finished product inventory if linked
    if (bom.products && typeof bom.products === 'object' && bom.products.inventory_item_id) {
      // First get current stock
      const { data: currentInventory } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', bom.products.inventory_item_id)
        .single();

      if (currentInventory) {
        const newStock = (currentInventory.current_stock || 0) + producedQuantity;
        
        const { error: productUpdateError } = await supabase
          .from('inventory_items')
          .update({
            current_stock: newStock,
            last_restock_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', bom.products.inventory_item_id);

        if (!productUpdateError) {
          productInventoryUpdated = true;
        }
      }
    }

    // Update production order status
    const { error: statusError } = await supabase
      .from('production_orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (statusError) {
      console.error('Error updating production order status:', statusError);
      return {
        success: false,
        error: `Failed to update production order: ${statusError.message}`
      };
    }

    console.log('Production completed successfully');
    
    toast({
      title: "Production Completed",
      description: `Production order completed successfully. Produced ${producedQuantity} units.`,
    });

    return {
      success: true,
      produced_quantity: producedQuantity,
      product_inventory_updated: productInventoryUpdated,
      materials_consumed: true
    };

  } catch (error) {
    console.error('Error in completeProductionOrderEnhanced:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const getProductionCostAnalysis = async (): Promise<ProductionCostAnalysis[]> => {
  try {
    // Since views aren't in types, we'll query the underlying tables and join manually
    const { data, error } = await supabase
      .from('production_orders')
      .select(`
        id,
        order_number,
        quantity_to_produce,
        status,
        created_at,
        completed_at,
        bill_of_materials!fk_production_orders_bom (
          name,
          total_cost,
          products!fk_bill_of_materials_product (
            name
          )
        ),
        production_materials!fk_production_materials_production_order (
          quantity_used,
          unit_cost
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching production cost analysis:', error);
      throw error;
    }

    // Transform the data to match our interface
    const analysisData: ProductionCostAnalysis[] = (data || []).map(order => {
      const actualCost = (order.production_materials || []).reduce((sum, material) => 
        sum + ((material.quantity_used || 0) * (material.unit_cost || 0)), 0
      );
      const plannedCost = order.bill_of_materials?.total_cost || 0;
      
      return {
        production_order_id: order.id,
        order_number: order.order_number,
        quantity_to_produce: order.quantity_to_produce,
        recipe_name: order.bill_of_materials?.name || 'Unknown',
        product_name: order.bill_of_materials?.products?.name || 'Unknown',
        planned_cost: plannedCost,
        actual_cost: actualCost,
        cost_variance: actualCost - plannedCost,
        cost_per_unit: order.quantity_to_produce > 0 ? actualCost / order.quantity_to_produce : 0,
        status: order.status,
        created_at: order.created_at || '',
        completed_at: order.completed_at || undefined
      };
    });

    return analysisData;
  } catch (error) {
    console.error('Error in getProductionCostAnalysis:', error);
    throw error;
  }
};

export const getInventoryValuation = async (): Promise<InventoryValuation[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        item_type,
        current_stock,
        min_stock,
        max_stock,
        unit_cost
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching inventory valuation:', error);
      throw error;
    }

    // Transform data to match interface
    const valuationData: InventoryValuation[] = (data || []).map(item => {
      const stockStatus: 'LOW_STOCK' | 'OVERSTOCK' | 'NORMAL' = 
        item.current_stock <= item.min_stock ? 'LOW_STOCK' :
        item.current_stock >= item.max_stock ? 'OVERSTOCK' : 'NORMAL';

      return {
        id: item.id,
        name: item.name,
        item_type: item.item_type,
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        standard_cost: item.unit_cost || 0,
        latest_cost: item.unit_cost || 0, // Simplified for now
        standard_value: item.current_stock * (item.unit_cost || 0),
        latest_value: item.current_stock * (item.unit_cost || 0),
        stock_status: stockStatus
      };
    });

    return valuationData;
  } catch (error) {
    console.error('Error in getInventoryValuation:', error);
    throw error;
  }
};

export const getBOMProfitability = async (): Promise<BOMProfitability[]> => {
  try {
    const { data, error } = await supabase
      .from('bill_of_materials')
      .select(`
        id,
        name,
        total_cost,
        products!fk_bill_of_materials_product (
          name,
          price
        )
      `)
      .eq('is_active', true)
      .order('total_cost', { ascending: false });

    if (error) {
      console.error('Error fetching BOM profitability:', error);
      throw error;
    }

    // Transform data to match interface
    const profitabilityData: BOMProfitability[] = (data || []).map(bom => {
      const sellingPrice = bom.products?.price ? bom.products.price / 100 : 0; // Convert from cents
      const productionCost = bom.total_cost || 0;
      const grossProfit = sellingPrice - productionCost;
      const profitMarginPercent = productionCost > 0 ? (grossProfit / productionCost) * 100 : 0;

      return {
        id: bom.id,
        bom_name: bom.name,
        product_name: bom.products?.name || 'Unknown',
        selling_price: sellingPrice,
        production_cost: productionCost,
        gross_profit: grossProfit,
        profit_margin_percent: profitMarginPercent
      };
    });

    return profitabilityData.sort((a, b) => b.profit_margin_percent - a.profit_margin_percent);
  } catch (error) {
    console.error('Error in getBOMProfitability:', error);
    throw error;
  }
};

export const getLowStockItems = async (): Promise<InventoryValuation[]> => {
  try {
    const allItems = await getInventoryValuation();
    return allItems.filter(item => item.stock_status === 'LOW_STOCK');
  } catch (error) {
    console.error('Error in getLowStockItems:', error);
    throw error;
  }
};

export const showProductionCompletionSuccess = (result: ProductionResult) => {
  const message = result.product_inventory_updated 
    ? `Production completed! ${result.produced_quantity} units produced and added to inventory.`
    : `Production completed! ${result.produced_quantity} units produced. Materials consumed from inventory.`;

  toast({
    title: "Production Success",
    description: message,
    variant: "default"
  });
};

export const showProductionCompletionError = (error: string) => {
  toast({
    title: "Production Failed",
    description: error,
    variant: "destructive"
  });
};
