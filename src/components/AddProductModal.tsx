
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Category } from "@/hooks/useProducts";

interface AddProductModalProps {
  categories: Category[];
  onAddProduct: (product: { name: string; price: number; category_id: string; is_active: boolean }) => Promise<void>;
}

const AddProductModal = ({ categories, onAddProduct }: AddProductModalProps) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      return;
    }

    try {
      await onAddProduct({
        name: newProduct.name,
        price: parseInt(newProduct.price),
        category_id: newProduct.category_id,
        is_active: true
      });
      
      setNewProduct({ name: "", price: "", category_id: "" });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Tambah Produk Baru</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nama Produk</label>
            <Input
              id="name"
              placeholder="Nama Produk"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">Harga</label>
            <Input
              id="price"
              placeholder="Harga"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Kategori</label>
            <Select
              value={newProduct.category_id}
              onValueChange={(value) => setNewProduct({...newProduct, category_id: value})}
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
          <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 mt-4">
            Tambah Produk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
