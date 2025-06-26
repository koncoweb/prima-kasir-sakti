
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  item_type: 'product' | 'raw_material' | 'supply';
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_cost?: number;
  supplier_info?: string;
  last_restock_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInventoryItems((data || []) as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data inventory items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();
      
      if (error) throw error;
      
      setInventoryItems(prev => [data as InventoryItem, ...prev]);
      
      toast({
        title: "Item berhasil ditambahkan",
        description: `${data.name} telah ditambahkan ke inventory`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan item inventory",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setInventoryItems(prev => prev.map(item => 
        item.id === id ? data as InventoryItem : item
      ));
      
      toast({
        title: "Item berhasil diperbarui",
        description: `${data.name} telah diperbarui`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui item inventory",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const updates: any = { 
        current_stock: newStock
      };
      
      if (newStock > 0) {
        updates.last_restock_date = new Date().toISOString().split('T')[0];
      }
      
      await updateInventoryItem(id, updates);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Item dihapus",
        description: "Item berhasil dihapus dari inventory",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus item inventory",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  return {
    inventoryItems,
    loading,
    addInventoryItem,
    updateInventoryItem,
    updateStock,
    deleteInventoryItem,
    refetch: fetchInventoryItems
  };
};
