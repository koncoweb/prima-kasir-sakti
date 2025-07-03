
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

export const completeProductionOrderEnhanced = async (
  orderId: string
): Promise<ProductionResult> => {
  try {
    console.log('Starting enhanced production completion for order:', orderId);
    
    // Call the enhanced database function
    const { data, error } = await supabase.rpc('complete_production_order_enhanced', {
      order_id: orderId
    });

    if (error) {
      console.error('Error completing production order:', error);
      return { 
        success: false, 
        error: `Failed to complete production: ${error.message}` 
      };
    }

    if (!data?.success) {
      console.log('Production completion failed:', data);
      return {
        success: false,
        error: data?.error || 'Unknown error occurred during production'
      };
    }

    console.log('Production completed successfully:', data);
    
    toast({
      title: "Production Completed",
      description: `Production order completed successfully. Produced ${data.produced_quantity} units.`,
    });

    return {
      success: true,
      produced_quantity: data.produced_quantity,
      product_inventory_updated: data.product_inventory_updated,
      materials_consumed: data.materials_consumed
    };

  } catch (error) {
    console.error('Error in completeProductionOrderEnhanced:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const getProductionCostAnalysis = async () => {
  try {
    const { data, error } = await supabase
      .from('production_cost_analysis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching production cost analysis:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductionCostAnalysis:', error);
    throw error;
  }
};

export const getInventoryValuation = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory_valuation')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching inventory valuation:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInventoryValuation:', error);
    throw error;
  }
};

export const getBOMProfitability = async () => {
  try {
    const { data, error } = await supabase
      .from('bom_profitability')
      .select('*')
      .order('profit_margin_percent', { ascending: false });

    if (error) {
      console.error('Error fetching BOM profitability:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBOMProfitability:', error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory_valuation')
      .select('*')
      .eq('stock_status', 'LOW_STOCK')
      .order('name');

    if (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }

    return data || [];
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
