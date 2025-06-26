
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IntegratedProduct } from "@/services/integratedProductService";

interface Category {
  id: string;
  name: string;
}

interface IntegratedEditProductModalProps {
  product: IntegratedProduct | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (id: string, updates: any) => Promise<void>;
}

const IntegratedEditProductModal = ({ 
  product, 
  categories, 
  isOpen, 
  onClose, 
  onUpdateProduct 
}: IntegratedEditProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    image_url: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category_id: product.category_id,
        image_url: product.image_url || ""
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !formData.name || !formData.price || !formData.category_id) {
      return;
    }

    try {
      await onUpdateProduct(product.id, {
        name: formData.name,
        price: parseInt(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url || null
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Produk</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-price">Harga (Rp)</Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
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
            <Label htmlFor="edit-image_url">URL Gambar (opsional)</Label>
            <Input
              id="edit-image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          {product?.inventory && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Data Inventory</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>Stok: {product.inventory.current_stock} {product.inventory.unit}</div>
                <div>Min: {product.inventory.min_stock}</div>
                <div>Max: {product.inventory.max_stock}</div>
                <div>Update: {product.inventory.last_restock_date || 'Belum ada'}</div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                *Data inventory dapat diubah melalui update stok
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IntegratedEditProductModal;
