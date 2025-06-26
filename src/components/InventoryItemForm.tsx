
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface InventoryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => Promise<any>;
}

const InventoryItemForm = ({ isOpen, onClose, onSubmit }: InventoryItemFormProps) => {
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    item_type: "raw_material" as "raw_material" | "supply" | "product",
    unit: "pcs",
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    unit_cost: 0,
    supplier_info: ""
  });

  const handleSubmit = async () => {
    if (!newItem.name) return;

    // Prevent adding product-type items here
    if (newItem.item_type === 'product') {
      toast({
        title: "Perhatian",
        description: "Item dengan tipe 'Produk' harus dibuat melalui Product Manager untuk integrasi yang lebih baik.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit({
        ...newItem,
        is_active: true
      });
      
      setNewItem({
        name: "",
        description: "",
        item_type: "raw_material",
        unit: "pcs",
        current_stock: 0,
        min_stock: 0,
        max_stock: 0,
        unit_cost: 0,
        supplier_info: ""
      });
      onClose();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Tambah Inventory Item Baru</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Item</label>
              <Input
                placeholder="Nama Item"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Item</label>
              <Select
                value={newItem.item_type}
                onValueChange={(value: "raw_material" | "supply" | "product") => setNewItem({...newItem, item_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Bahan Baku</SelectItem>
                  <SelectItem value="supply">Perlengkapan</SelectItem>
                  <SelectItem value="product">Produk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input
              placeholder="Deskripsi item"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Satuan</label>
              <Input
                placeholder="pcs, kg, liter"
                value={newItem.unit}
                onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stok Awal</label>
              <Input
                type="number"
                value={newItem.current_stock}
                onChange={(e) => setNewItem({...newItem, current_stock: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga Satuan</label>
              <Input
                type="number"
                value={newItem.unit_cost}
                onChange={(e) => setNewItem({...newItem, unit_cost: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stok Minimum</label>
              <Input
                type="number"
                value={newItem.min_stock}
                onChange={(e) => setNewItem({...newItem, min_stock: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stok Maksimum</label>
              <Input
                type="number"
                value={newItem.max_stock}
                onChange={(e) => setNewItem({...newItem, max_stock: Number(e.target.value)})}
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Tambah Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemForm;
