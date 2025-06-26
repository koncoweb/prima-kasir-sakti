
import { supabase } from '@/integrations/supabase/client';

export interface IntegratedProduct {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category?: { name: string };
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory_item_id?: string;
  inventory?: {
    current_stock: number;
    min_stock: number;
    max_stock: number;
    unit: string;
    last_restock_date?: string;
  };
}

export const fetchIntegratedProducts = async (): Promise<IntegratedProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      inventory_item:inventory_items!inventory_item_id(
        current_stock,
        min_stock,
        max_stock,
        unit,
        last_restock_date
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching integrated products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  
  return (data || []).map(product => ({
    ...product,
    inventory: product.inventory_item ? {
      current_stock: product.inventory_item.current_stock,
      min_stock: product.inventory_item.min_stock,
      max_stock: product.inventory_item.max_stock,
      unit: product.inventory_item.unit,
      last_restock_date: product.inventory_item.last_restock_date
    } : undefined
  }));
};

export const createIntegratedProduct = async (productData: {
  name: string;
  price: number;
  category_id: string;
  image_url?: string;
  with_inventory?: boolean;
  inventory_data?: {
    current_stock: number;
    min_stock: number;
    max_stock: number;
    unit: string;
  };
}): Promise<IntegratedProduct> => {
  try {
    let inventoryItemId: string | undefined;
    
    // Create inventory item if requested
    if (productData.with_inventory && productData.inventory_data) {
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .insert([{
          name: productData.name,
          item_type: 'product',
          unit: productData.inventory_data.unit,
          current_stock: productData.inventory_data.current_stock,
          min_stock: productData.inventory_data.min_stock,
          max_stock: productData.inventory_data.max_stock,
          unit_cost: productData.price / 100, // Convert from cents
          is_active: true
        }])
        .select()
        .single();
      
      if (inventoryError) {
        throw new Error(`Failed to create inventory: ${inventoryError.message}`);
      }
      
      inventoryItemId = inventoryItem.id;
    }
    
    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        price: productData.price,
        category_id: productData.category_id,
        image_url: productData.image_url,
        inventory_item_id: inventoryItemId,
        is_active: true
      }])
      .select(`
        *,
        category:categories(name),
        inventory_item:inventory_items!inventory_item_id(
          current_stock,
          min_stock,
          max_stock,
          unit,
          last_restock_date
        )
      `)
      .single();
    
    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`);
    }
    
    return {
      ...product,
      inventory: product.inventory_item ? {
        current_stock: product.inventory_item.current_stock,
        min_stock: product.inventory_item.min_stock,
        max_stock: product.inventory_item.max_stock,
        unit: product.inventory_item.unit,
        last_restock_date: product.inventory_item.last_restock_date
      } : undefined
    };
  } catch (error) {
    console.error('Error creating integrated product:', error);
    throw error;
  }
};
