
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
  const [creating, setCreating] = useState(false);

  const fetchPurchases = async (inventoryItemId?: string) => {
    try {
      setLoading(true);
      console.log('Fetching purchases for item:', inventoryItemId);
      const data = await fetchPurchasesFromDB(inventoryItemId);
      console.log('Fetched purchases:', data);
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
    if (creating) {
      console.log('Purchase creation already in progress, skipping...');
      return;
    }

    try {
      setCreating(true);
      console.log('Creating purchase with data:', purchaseData);

      // Validate required data
      if (!purchaseData.supplier_id || !purchaseData.inventory_item_id) {
        throw new Error('Supplier dan item inventory harus dipilih');
      }

      if (purchaseData.quantity_purchased <= 0 || purchaseData.unit_price <= 0) {
        throw new Error('Kuantitas dan harga harus lebih dari 0');
      }

      // Create purchase transaction
      console.log('Creating purchase transaction...');
      const newPurchase = await createPurchaseInDB(purchaseData);
      console.log('Purchase created successfully:', newPurchase);

      // Update inventory stock
      console.log('Updating inventory stock...');
      const stockResult = await updateInventoryStock(
        purchaseData.inventory_item_id, 
        purchaseData.quantity_purchased
      );

      if (!stockResult.success) {
        console.error('Failed to update stock:', stockResult.error);
        toast({
          title: "Warning",
          description: `Pembelian berhasil dicatat, tapi gagal update stok: ${stockResult.error}`,
          variant: "destructive"
        });
      } else {
        console.log('Stock updated successfully');
      }

      // Update supplier item info
      console.log('Updating supplier item info...');
      const supplierResult = await updateSupplierItemInfo(
        purchaseData.supplier_id,
        purchaseData.inventory_item_id,
        purchaseData.unit_price
      );

      if (!supplierResult.success) {
        console.error('Failed to update supplier item:', supplierResult.error);
        // This is not critical, so just log it
      } else {
        console.log('Supplier item info updated successfully');
      }
      
      // Update local state
      setPurchases(prev => [newPurchase, ...prev]);
      
      toast({
        title: "Pembelian berhasil dicatat",
        description: `Pembelian ${newPurchase.inventory_item?.name} sebanyak ${purchaseData.quantity_purchased} telah dicatat${stockResult.success ? ' dan stok diperbarui' : ''}`,
      });
      
      return newPurchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mencatat pembelian';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updatePurchase = async (id: string, updates: Partial<PurchaseTransaction>) => {
    try {
      console.log('Updating purchase:', id, updates);
      const updatedPurchase = await updatePurchaseInDB(id, updates);
      
      setPurchases(prev => prev.map(purchase => 
        purchase.id === id ? updatedPurchase : purchase
      ));
      
      toast({
        title: "Pembelian berhasil diperbarui",
        description: "Data pembelian telah diperbarui",
      });
      
      return updatedPurchase;
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
      console.log('Deleting purchase:', id);
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
    creating,
    createPurchase,
    updatePurchase,
    deletePurchase,
    refetch: fetchPurchases
  };
};

// Re-export types for backward compatibility
export type { PurchaseTransaction, CreatePurchaseData };
