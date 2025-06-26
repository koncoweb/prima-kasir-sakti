
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { Product, Category } from "@/hooks/useProducts";

interface EditProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

const EditProductModal = ({ product, categories, isOpen, onClose, onUpdateProduct }: EditProductModalProps) => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setEditProduct({ ...product });
    }
  }, [product]);

  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    try {
      await onUpdateProduct(editProduct.id, {
        name: editProduct.name,
        price: editProduct.price,
        category_id: editProduct.category_id
      });
      
      setEditProduct(null);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Produk</span>
          </DialogTitle>
        </DialogHeader>
        {editProduct && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Nama Produk</label>
              <Input
                id="edit-name"
                placeholder="Nama Produk"
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-price" className="text-sm font-medium">Harga</label>
              <Input
                id="edit-price"
                placeholder="Harga"
                type="number"
                value={editProduct.price}
                onChange={(e) => setEditProduct({...editProduct, price: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">Kategori</label>
              <Select
                value={editProduct.category_id}
                onValueChange={(value) => setEditProduct({...editProduct, category_id: value})}
              >
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
            <div className="bg-gray-50 p-3 rounded border">
              <label className="text-sm font-medium text-gray-700">Barcode</label>
              <div className="font-mono text-sm bg-white p-2 rounded border mt-1 text-center">
                {editProduct.id}
              </div>
            </div>
            <Button onClick={handleUpdateProduct} className="bg-blue-600 hover:bg-blue-700 mt-4">
              Update Produk
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
