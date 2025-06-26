
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface IntegratedAddProductModalProps {
  categories: Category[];
  onAddProduct: (productData: any) => Promise<void>;
}

const IntegratedAddProductModal = ({ categories, onAddProduct }: IntegratedAddProductModalProps) => {
  const [open, setOpen] = useState(false);
  const [withInventory, setWithInventory] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    image_url: "",
    inventory_data: {
      current_stock: "",
      min_stock: "",
      max_stock: "",
      unit: "pcs"
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id) {
      return;
    }

    try {
      await onAddProduct({
        name: formData.name,
        price: parseInt(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url || undefined,
        with_inventory: withInventory,
        inventory_data: withInventory ? {
          current_stock: parseInt(formData.inventory_data.current_stock) || 0,
          min_stock: parseInt(formData.inventory_data.min_stock) || 0,
          max_stock: parseInt(formData.inventory_data.max_stock) || 0,
          unit: formData.inventory_data.unit
        } : undefined
      });
      
      setFormData({
        name: "",
        price: "",
        category_id: "",
        image_url: "",
        inventory_data: {
          current_stock: "",
          min_stock: "",
          max_stock: "",
          unit: "pcs"
        }
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar (opsional)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="with-inventory"
              checked={withInventory}
              onCheckedChange={setWithInventory}
            />
            <Label htmlFor="with-inventory">Kelola dengan Inventory</Label>
          </div>

          {withInventory && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Data Inventory</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Stok Awal</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.inventory_data.current_stock}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory_data: {...formData.inventory_data, current_stock: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Satuan</Label>
                  <Input
                    id="unit"
                    value={formData.inventory_data.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory_data: {...formData.inventory_data, unit: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Stok Minimum</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.inventory_data.min_stock}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory_data: {...formData.inventory_data, min_stock: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_stock">Stok Maksimum</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={formData.inventory_data.max_stock}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory_data: {...formData.inventory_data, max_stock: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Tambah Produk
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IntegratedAddProductModal;
