
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProductionOrder {
  id: string;
  order_number: string;
  bom_id: string;
  quantity_to_produce: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  planned_date?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  priority?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  bill_of_materials?: {
    name: string;
    description?: string;
  };
}

export const useProductionOrders = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const generateOrderNumber = () => {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `PO-${now.getFullYear()}-${timestamp}`;
  };

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_orders')
        .select(`
          *,
          bill_of_materials!fk_production_orders_bom (
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProductionOrders((data || []) as ProductionOrder[]);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data production orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProductionOrder = async (orderData: Omit<ProductionOrder, 'id' | 'order_number' | 'bill_of_materials' | 'created_at' | 'updated_at'>) => {
    try {
      const order_number = generateOrderNumber();
      const { data, error } = await supabase
        .from('production_orders')
        .insert([{ ...orderData, order_number }])
        .select(`
          *,
          bill_of_materials!fk_production_orders_bom (
            name,
            description
          )
        `)
        .single();
      
      if (error) throw error;
      
      setProductionOrders(prev => [data as ProductionOrder, ...prev]);
      
      toast({
        title: "Production Order berhasil dibuat",
        description: `Order ${data.order_number} telah dibuat`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding production order:', error);
      toast({
        title: "Error",
        description: "Gagal membuat production order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProductionOrder = async (id: string, updates: Partial<ProductionOrder>) => {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          bill_of_materials!fk_production_orders_bom (
            name,
            description
          )
        `)
        .single();
      
      if (error) throw error;
      
      setProductionOrders(prev => prev.map(order => 
        order.id === id ? data as ProductionOrder : order
      ));
      
      toast({
        title: "Production Order diperbarui",
        description: `Order ${data.order_number} telah diperbarui`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating production order:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui production order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProductionOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProductionOrders(prev => prev.filter(order => order.id !== id));
      
      toast({
        title: "Production Order dihapus",
        description: "Order berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting production order:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus production order",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  return {
    productionOrders,
    loading,
    addProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    refetch: fetchProductionOrders
  };
};
