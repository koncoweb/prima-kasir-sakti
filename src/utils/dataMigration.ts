
import { supabase } from '@/integrations/supabase/client';

const sampleProducts = [
  { name: "Caramel Milkshake", price: 26000, category: "Minuman", stock: 50, minStock: 20, maxStock: 100 },
  { name: "Caramel Mochiato", price: 30000, category: "Minuman", stock: 30, minStock: 15, maxStock: 80 },
  { name: "Cha Tea Latte", price: 29000, category: "Minuman", stock: 25, minStock: 25, maxStock: 75 },
  { name: "Chicken Popcorn", price: 23000, category: "Makanan", stock: 40, minStock: 30, maxStock: 120 },
  { name: "Chicken Stick", price: 20000, category: "Makanan", stock: 35, minStock: 35, maxStock: 100 },
  { name: "Chicken Wings", price: 32000, category: "Makanan", stock: 20, minStock: 15, maxStock: 60 },
  { name: "Chocolate Frapucino", price: 39000, category: "Minuman", stock: 15, minStock: 10, maxStock: 50 },
  { name: "Coffee Latte", price: 30000, category: "Minuman", stock: 45, minStock: 20, maxStock: 80 },
  { name: "Custom Cake", price: 45000, category: "Dessert", stock: 10, minStock: 5, maxStock: 30 },
  { name: "Dino Nugget", price: 12000, category: "Snack", stock: 60, minStock: 30, maxStock: 100 }
];

export const migrateData = async () => {
  try {
    console.log('Starting data migration...');
    
    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');
    
    if (!categories) {
      throw new Error('Failed to fetch categories');
    }
    
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {} as Record<string, string>);
    
    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('name');
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('Products already exist, skipping migration');
      return;
    }
    
    // Insert products
    for (const product of sampleProducts) {
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          price: product.price,
          category_id: categoryMap[product.category],
          is_active: true
        }])
        .select()
        .single();
      
      if (productError) {
        console.error('Error inserting product:', productError);
        continue;
      }
      
      // Insert inventory for this product
      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert([{
          product_id: insertedProduct.id,
          current_stock: product.stock,
          min_stock: product.minStock,
          max_stock: product.maxStock,
          last_restock_date: '2024-01-15'
        }]);
      
      if (inventoryError) {
        console.error('Error inserting inventory:', inventoryError);
      }
    }
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Data migration failed:', error);
    throw error;
  }
};
