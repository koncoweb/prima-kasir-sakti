
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InventoryItemEditModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any) => Promise<void>;
}

const InventoryItemEditModal = ({ item, isOpen, onClose, onSubmit }: InventoryItemEditModalProps) => {
  const handleSubmit = async () => {
    if (!item) return;
    await onSubmit(item);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Item</label>
              <Input
                placeholder="Nama Item"
                value={item.name}
                onChange={(e) => item.name = e.target.value}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Item</label>
              <Select
                value={item.item_type}
                onValueChange={(value: any) => item.item_type = value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Bahan Baku</SelectItem>
                  <SelectItem value="supply">Perlengkapan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input
              placeholder="Deskripsi item"
              value={item.description}
              onChange={(e) => item.description = e.target.value}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Satuan</label>
              <Input
                placeholder="pcs, kg, liter"
                value={item.unit}
                onChange={(e) => item.unit = e.target.value}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga Satuan</label>
              <Input
                type="number"
                value={item.unit_cost}
                onChange={(e) => item.unit_cost = Number(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stok Minimum</label>
              <Input
                type="number"
                value={item.min_stock}
                onChange={(e) => item.min_stock = Number(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stok Maksimum</label>
              <Input
                type="number"
                value={item.max_stock}
                onChange={(e) => item.max_stock = Number(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Info</label>
              <Input
                placeholder="Informasi Supplier"
                value={item.supplier_info}
                onChange={(e) => item.supplier_info = e.target.value}
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Update Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemEditModal;
