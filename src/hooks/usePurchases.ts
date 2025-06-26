import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PurchaseTransaction {
  id: string;
  transaction_number: string;
  supplier_id?: string;
  inventory_item_id?: string;
  quantity_purchased: number;
  unit_price: number;
  total_amount: number;
  purchase_date: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  supplier?: {
    id: string;
    name: string;
  };
  inventory_item?: {
    id: string;
    name: string;
    unit: string;
  };
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async (inventoryItemId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('purchase_transactions')
        .select(`
          *,
          supplier:suppliers(id, name),
          inventory_item:inventory_items(id, name, unit)
        `)
        .order('created_at', { ascending: false });
      
      if (inventoryItemId) {
        query = query.eq('inventory_item_id', inventoryItemId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data pembelian",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (purchaseData: {
    supplier_id: string;
    inventory_item_id: string;
    quantity_purchased: number;
    unit_price: number;
    invoice_number?: string;
    notes?: string;
  }) => {
    try {
      const total_amount = purchaseData.quantity_purchased * purchaseData.unit_price;
      
      const { data, error } = await supabase
        .from('purchase_transactions')
        .insert([{
          ...purchaseData,
          total_amount
        }])
        .select(`
          id,
          transaction_number,
          supplier_id,
          inventory_item_id,
          quantity_purchased,
          unit_price,
          total_amount,
          purchase_date,
          invoice_number,
          notes,
          created_at,
          supplier:suppliers(id, name),
          inventory_item:inventory_items(id, name, unit)
        `)
        .single();
      
      if (error) throw error;

      // Get current stock first, then update it
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', purchaseData.inventory_item_id)
        .single();

      if (fetchError) {
        console.error('Error fetching current stock:', fetchError);
      } else {
        const newStock = currentItem.current_stock + purchaseData.quantity_purchased;
        
        const { error: stockError } = await supabase
          .from('inventory_items')
          .update({ 
            current_stock: newStock,
            last_restock_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', purchaseData.inventory_item_id);

        if (stockError) {
          console.error('Error updating stock:', stockError);
          toast({
            title: "Warning",
            description: "Pembelian berhasil, tapi gagal update stok otomatis",
            variant: "destructive"
          });
        }
      }

      // Update supplier item last purchase date
      await supabase
        .from('supplier_items')
        .update({ 
          last_purchase_date: new Date().toISOString().split('T')[0],
          unit_price: purchaseData.unit_price
        })
        .eq('supplier_id', purchaseData.supplier_id)
        .eq('inventory_item_id', purchaseData.inventory_item_id);
      
      setPurchases(prev => [data, ...prev]);
      
      toast({
        title: "Pembelian berhasil dicatat",
        description: `Pembelian ${data.inventory_item?.name} sebanyak ${purchaseData.quantity_purchased} telah dicatat dan stok diperbarui`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: "Gagal mencatat pembelian",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePurchase = async (id: string, updates: Partial<PurchaseTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          supplier:suppliers(id, name),
          inventory_item:inventory_items(id, name, unit)
        `)
        .single();
      
      if (error) throw error;
      
      setPurchases(prev => prev.map(purchase => 
        purchase.id === id ? data : purchase
      ));
      
      toast({
        title: "Pembelian berhasil diperbarui",
        description: "Data pembelian telah diperbarui",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui pembelian",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      
      toast({
        title: "Pembelian dihapus",
        description: "Data pembelian berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pembelian",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    createPurchase,
    updatePurchase,
    deletePurchase,
    refetch: fetchPurchases
  };
};
