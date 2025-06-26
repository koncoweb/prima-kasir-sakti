
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { IntegratedProduct, fetchIntegratedProducts, createIntegratedProduct } from '@/services/integratedProductService';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export const useIntegratedProducts = () => {
  const [products, setProducts] = useState<IntegratedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data kategori",
        variant: "destructive"
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching integrated products...');
      const data = await fetchIntegratedProducts();
      console.log('Fetched integrated products:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching integrated products:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data produk",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: {
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
  }) => {
    try {
      console.log('Creating integrated product:', productData);
      const newProduct = await createIntegratedProduct(productData);
      
      setProducts(prev => [newProduct, ...prev]);
      
      toast({
        title: "Produk berhasil ditambahkan",
        description: `${newProduct.name} telah ditambahkan ke daftar produk${productData.with_inventory ? ' dengan data inventory' : ''}`,
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error adding integrated product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<IntegratedProduct>) => {
    try {
      console.log('Updating product:', id, updates);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
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
      
      if (error) throw error;
      
      const updatedProduct = {
        ...data,
        inventory: data.inventory_item ? {
          current_stock: data.inventory_item.current_stock,
          min_stock: data.inventory_item.min_stock,
          max_stock: data.inventory_item.max_stock,
          unit: data.inventory_item.unit,
          last_restock_date: data.inventory_item.last_restock_date
        } : undefined
      };
      
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
      
      toast({
        title: "Produk berhasil diperbarui",
        description: `${data.name} telah diperbarui`,
      });
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui produk",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product:', id);
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
      
      toast({
        title: "Produk dihapus",
        description: "Produk berhasil dihapus dari daftar",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product?.inventory_item_id) {
        throw new Error('Produk tidak memiliki data inventory');
      }

      console.log('Updating stock for product:', productId, 'new stock:', newStock);
      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          last_restock_date: newStock > 0 ? new Date().toISOString().split('T')[0] : undefined
        })
        .eq('id', product.inventory_item_id);
      
      if (error) throw error;
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId && p.inventory ? {
          ...p,
          inventory: {
            ...p.inventory,
            current_stock: newStock,
            last_restock_date: newStock > 0 ? new Date().toISOString().split('T')[0] : p.inventory.last_restock_date
          }
        } : p
      ));
      
      toast({
        title: "Stok berhasil diperbarui",
        description: `Stok ${product.name} telah diperbarui`,
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui stok",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return {
    products,
    categories,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: fetchProducts
  };
};
