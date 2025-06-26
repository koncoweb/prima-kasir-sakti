
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProductionOrder {
  id: string;
  order_number: string;
  bom_id?: string;
  quantity_to_produce: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  planned_date?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  bill_of_materials?: {
    name: string;
    yield_quantity: number;
    total_cost?: number;
    product?: {
      name: string;
    };
  };
}

export const useProductionOrders = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_orders')
        .select(`
          *,
          bill_of_materials(
            name,
            yield_quantity,
            total_cost,
            product:products(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProductionOrders(data || []);
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

  const addProductionOrder = async (orderData: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at' | 'bill_of_materials'>) => {
    try {
      // Generate order number
      const orderNumber = `PO-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('production_orders')
        .insert([{ ...orderData, order_number: orderNumber }])
        .select(`
          *,
          bill_of_materials(
            name,
            yield_quantity,
            total_cost,
            product:products(name)
          )
        `)
        .single();
      
      if (error) throw error;
      
      setProductionOrders(prev => [data, ...prev]);
      
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

  const updateProductionOrderStatus = async (id: string, status: ProductionOrder['status']) => {
    try {
      const updates: any = { status };
      
      if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('production_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          bill_of_materials(
            name,
            yield_quantity,
            total_cost,
            product:products(name)
          )
        `)
        .single();
      
      if (error) throw error;
      
      setProductionOrders(prev => prev.map(order => 
        order.id === id ? data : order
      ));
      
      toast({
        title: "Status berhasil diperbarui",
        description: `Production order status diubah ke ${status}`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating production order status:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status production order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const simulateProduction = async (bomId: string, quantity: number) => {
    try {
      // Get BOM details with items
      const { data: bom, error: bomError } = await supabase
        .from('bill_of_materials')
        .select(`
          *,
          bom_items(
            *,
            inventory_item:inventory_items(name, current_stock, unit, unit_cost)
          )
        `)
        .eq('id', bomId)
        .single();
      
      if (bomError) throw bomError;
      
      const simulation = {
        bomName: bom.name,
        requestedQuantity: quantity,
        canProduce: true,
        limitingFactor: null as string | null,
        maxProducible: quantity,
        materialRequirements: [] as any[],
        estimatedCost: 0
      };
      
      for (const bomItem of bom.bom_items) {
        const requiredQuantity = bomItem.quantity_required * quantity;
        const available = bomItem.inventory_item.current_stock;
        const canSupply = available >= requiredQuantity;
        const maxFromThisItem = Math.floor(available / bomItem.quantity_required);
        
        if (!canSupply && maxFromThisItem < simulation.maxProducible) {
          simulation.maxProducible = maxFromThisItem;
          simulation.limitingFactor = bomItem.inventory_item.name;
          simulation.canProduce = false;
        }
        
        const cost = (bomItem.unit_cost || bomItem.inventory_item.unit_cost || 0) * requiredQuantity;
        simulation.estimatedCost += cost;
        
        simulation.materialRequirements.push({
          name: bomItem.inventory_item.name,
          required: requiredQuantity,
          available: available,
          unit: bomItem.inventory_item.unit,
          canSupply,
          unitCost: bomItem.unit_cost || bomItem.inventory_item.unit_cost || 0,
          totalCost: cost
        });
      }
      
      return simulation;
    } catch (error) {
      console.error('Error simulating production:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan simulasi produksi",
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
    updateProductionOrderStatus,
    simulateProduction,
    refetch: fetchProductionOrders
  };
};
