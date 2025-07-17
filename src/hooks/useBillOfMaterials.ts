
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BOMItem {
  id: string;
  bom_id: string;
  inventory_item_id: string;
  quantity_required: number;
  unit_cost?: number;
  notes?: string;
  created_at: string;
  inventory_item?: {
    name: string;
    unit: string;
    unit_cost?: number;
    item_type: string;
  };
}

export interface BillOfMaterial {
  id: string;
  product_id?: string;
  name: string;
  description?: string;
  yield_quantity: number;
  total_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    price: number;
  };
  bom_items?: BOMItem[];
}

export const useBillOfMaterials = () => {
  const [boms, setBoms] = useState<BillOfMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select(`
          *,
          product:products!fk_bill_of_materials_product(name, price),
          bom_items!fk_bom_items_bom(
            *,
            inventory_item:inventory_items!fk_bom_items_inventory_item(name, unit, unit_cost, item_type)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBoms(data || []);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data Bill of Materials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBOM = async (bomData: Omit<BillOfMaterial, 'id' | 'created_at' | 'updated_at' | 'bom_items'>) => {
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([bomData])
        .select(`
          *,
          product:products!fk_bill_of_materials_product(name, price),
          bom_items!fk_bom_items_bom(
            *,
            inventory_item:inventory_items!fk_bom_items_inventory_item(name, unit, unit_cost, item_type)
          )
        `)
        .single();
      
      if (error) throw error;
      
      setBoms(prev => [data, ...prev]);
      
      toast({
        title: "BOM berhasil ditambahkan",
        description: `${data.name} telah ditambahkan`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding BOM:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan Bill of Materials",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addBOMItem = async (bomId: string, itemData: Omit<BOMItem, 'id' | 'bom_id' | 'created_at' | 'inventory_item'>) => {
    try {
      const { data, error } = await supabase
        .from('bom_items')
        .insert([{ ...itemData, bom_id: bomId }])
        .select(`
          *,
          inventory_item:inventory_items!fk_bom_items_inventory_item(name, unit, unit_cost, item_type)
        `)
        .single();
      
      if (error) throw error;
      
      // Update local state
      setBoms(prev => prev.map(bom => 
        bom.id === bomId 
          ? { ...bom, bom_items: [...(bom.bom_items || []), data] }
          : bom
      ));
      
      // Recalculate total cost
      await calculateBOMCost(bomId);
      
      toast({
        title: "Komponen ditambahkan",
        description: `${data.inventory_item?.name} ditambahkan ke BOM`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding BOM item:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan komponen BOM",
        variant: "destructive"
      });
      throw error;
    }
  };

  const calculateBOMCost = async (bomId: string) => {
    try {
      const { data: bomItems, error } = await supabase
        .from('bom_items')
        .select(`
          *,
          inventory_item:inventory_items!fk_bom_items_inventory_item(unit_cost)
        `)
        .eq('bom_id', bomId);
      
      if (error) throw error;
      
      const totalCost = bomItems.reduce((sum, item) => {
        const unitCost = item.unit_cost || item.inventory_item?.unit_cost || 0;
        return sum + (unitCost * item.quantity_required);
      }, 0);
      
      const { error: updateError } = await supabase
        .from('bill_of_materials')
        .update({ total_cost: totalCost })
        .eq('id', bomId);
      
      if (updateError) throw updateError;
      
      setBoms(prev => prev.map(bom => 
        bom.id === bomId ? { ...bom, total_cost: totalCost } : bom
      ));
      
    } catch (error) {
      console.error('Error calculating BOM cost:', error);
    }
  };

  const deleteBOMItem = async (bomItemId: string, bomId: string) => {
    try {
      const { error } = await supabase
        .from('bom_items')
        .delete()
        .eq('id', bomItemId);
      
      if (error) throw error;
      
      setBoms(prev => prev.map(bom => 
        bom.id === bomId 
          ? { ...bom, bom_items: bom.bom_items?.filter(item => item.id !== bomItemId) }
          : bom
      ));
      
      // Recalculate total cost
      await calculateBOMCost(bomId);
      
      toast({
        title: "Komponen dihapus",
        description: "Komponen berhasil dihapus dari BOM",
      });
    } catch (error) {
      console.error('Error deleting BOM item:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus komponen BOM",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  return {
    boms,
    loading,
    addBOM,
    addBOMItem,
    deleteBOMItem,
    calculateBOMCost,
    refetch: fetchBOMs
  };
};
