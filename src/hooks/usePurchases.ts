
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { PurchaseTransaction, CreatePurchaseData } from '@/types/purchase';
import { 
  fetchPurchasesFromDB, 
  createPurchaseInDB, 
  updatePurchaseInDB, 
  deletePurchaseFromDB 
} from '@/services/purchaseService';
import { updateInventoryStock, updateSupplierItemInfo } from '@/utils/stockUtils';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async (inventoryItemId?: string) => {
    try {
      setLoading(true);
      const data = await fetchPurchasesFromDB(inventoryItemId);
      setPurchases(data);
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

  const createPurchase = async (purchaseData: CreatePurchaseData) => {
    try {
      const data = await createPurchaseInDB(purchaseData);

      // Update inventory stock
      await updateInventoryStock(
        purchaseData.inventory_item_id, 
        purchaseData.quantity_purchased
      );

      // Update supplier item info
      await updateSupplierItemInfo(
        purchaseData.supplier_id,
        purchaseData.inventory_item_id,
        purchaseData.unit_price
      );
      
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
      const data = await updatePurchaseInDB(id, updates);
      
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
      await deletePurchaseFromDB(id);
      
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

// Re-export types for backward compatibility
export type { PurchaseTransaction, CreatePurchaseData };
