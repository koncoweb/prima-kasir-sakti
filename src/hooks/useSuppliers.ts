
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierItem {
  id: string;
  supplier_id: string;
  inventory_item_id: string;
  supplier_item_code?: string;
  unit_price: number;
  minimum_order_quantity: number;
  lead_time_days: number;
  is_preferred: boolean;
  last_purchase_date?: string;
  supplier?: Supplier;
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data supplier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => [data, ...prev]);
      
      toast({
        title: "Supplier berhasil ditambahkan",
        description: `${data.name} telah ditambahkan`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan supplier",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? data : supplier
      ));
      
      toast({
        title: "Supplier berhasil diperbarui",
        description: `${data.name} telah diperbarui`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui supplier",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getSupplierItems = async (inventoryItemId: string): Promise<SupplierItem[]> => {
    try {
      const { data, error } = await supabase
        .from('supplier_items')
        .select(`
          *,
          supplier:suppliers!fk_supplier_items_supplier(*)
        `)
        .eq('inventory_item_id', inventoryItemId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching supplier items:', error);
      return [];
    }
  };

  const addSupplierItem = async (supplierItemData: Omit<SupplierItem, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => {
    try {
      const { data, error } = await supabase
        .from('supplier_items')
        .insert([supplierItemData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Supplier item berhasil ditambahkan",
        description: "Item supplier telah ditambahkan",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding supplier item:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan item supplier",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSupplierItem = async (id: string, updates: Partial<SupplierItem>) => {
    try {
      const { data, error } = await supabase
        .from('supplier_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Supplier item berhasil diperbarui",
        description: "Item supplier telah diperbarui",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating supplier item:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui item supplier",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    getSupplierItems,
    addSupplierItem,
    updateSupplierItem,
    refetch: fetchSuppliers
  };
};
