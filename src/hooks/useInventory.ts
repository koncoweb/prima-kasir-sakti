
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  last_restock_date: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    price: number;
  };
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(name, price)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: newStock,
          last_restock_date: newStock > 0 ? new Date().toISOString().split('T')[0] : undefined
        })
        .eq('id', id)
        .select(`
          *,
          product:products(name, price)
        `)
        .single();
      
      if (error) throw error;
      
      setInventory(prev => prev.map(item => 
        item.id === id ? data : item
      ));
      
      toast({
        title: "Stok berhasil diperbarui",
        description: `Stok ${data.product?.name} telah diperbarui`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
      throw error;
    }
  };

  const restockItem = async (id: string, amount: number) => {
    try {
      const item = inventory.find(inv => inv.id === id);
      if (!item) return;
      
      const newStock = item.current_stock + amount;
      await updateStock(id, newStock);
    } catch (error) {
      console.error('Error restocking item:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    updateStock,
    restockItem,
    refetch: fetchInventory
  };
};
