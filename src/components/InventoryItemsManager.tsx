
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import InventoryItemForm from "./InventoryItemForm";
import InventoryItemEditModal from "./InventoryItemEditModal";
import InventoryItemsList from "./InventoryItemsList";
import PurchaseModal from "./PurchaseModal";

const InventoryItemsManager = () => {
  const { inventoryItems, loading, addInventoryItem, updateInventoryItem, updateStock, deleteInventoryItem } = useInventoryItems();
  
  const [editItem, setEditItem] = useState<any>(null);
  const [purchaseItem, setPurchaseItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleUpdateItem = async (item: any) => {
    try {
      await updateInventoryItem(item.id, {
        name: item.name,
        description: item.description,
        item_type: item.item_type,
        unit: item.unit,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        unit_cost: item.unit_cost,
        supplier_info: item.supplier_info
      });
      
      setEditItem(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openEditModal = (item: any) => {
    setEditItem({ ...item });
    setIsEditModalOpen(true);
  };

  const openPurchaseModal = (item: any) => {
    setPurchaseItem(item);
    setIsPurchaseModalOpen(true);
  };

  // Filter out product-type items from display
  const filteredItems = inventoryItems
    .filter(item => item.item_type !== 'product') // Exclude product-type items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || item.item_type === filterType;
      return matchesSearch && matchesType;
    });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Manajemen Inventory Items</CardTitle>
                <p className="text-sm text-slate-500">Kelola bahan baku dan perlengkapan</p>
                <p className="text-xs text-blue-600 mt-1">
                  *Produk dikelola melalui Product Manager untuk integrasi penuh
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari item..." 
                  className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Filter tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="raw_material">Bahan Baku</SelectItem>
                  <SelectItem value="supply">Perlengkapan</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <InventoryItemsList
            items={filteredItems}
            onEdit={openEditModal}
            onDelete={handleDeleteItem}
            onUpdateStock={updateStock}
            onPurchase={openPurchaseModal}
          />
        </CardContent>
      </Card>

      <InventoryItemForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addInventoryItem}
      />

      <InventoryItemEditModal
        item={editItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleUpdateItem}
      />

      <PurchaseModal
        item={purchaseItem}
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setPurchaseItem(null);
        }}
        onStockUpdated={() => {
          // Refresh inventory items data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default InventoryItemsManager;
