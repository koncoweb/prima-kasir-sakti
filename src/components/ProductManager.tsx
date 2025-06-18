
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProductManager = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Caramel Milkshake", price: 26000, category: "Minuman", stock: 50 },
    { id: 2, name: "Caramel Mochiato", price: 30000, category: "Minuman", stock: 30 },
    { id: 3, name: "Cha Tea Latte", price: 29000, category: "Minuman", stock: 25 },
    { id: 4, name: "Chicken Popcorn", price: 23000, category: "Makanan", stock: 40 },
    { id: 5, name: "Chicken Stick", price: 20000, category: "Makanan", stock: 35 },
    { id: 6, name: "Chicken Wings", price: 32000, category: "Makanan", stock: 20 },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: ""
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ["Minuman", "Makanan", "Snack", "Dessert"];

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.stock) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan isi semua field",
        variant: "destructive"
      });
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseInt(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock)
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", price: "", category: "", stock: "" });
    setIsModalOpen(false);
    
    toast({
      title: "Produk berhasil ditambahkan",
      description: `${product.name} telah ditambahkan ke daftar produk`,
    });
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Produk dihapus",
      description: "Produk berhasil dihapus dari daftar",
    });
  };

  return (
    <div className="space-y-6">
      {/* Products List */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Produk</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari produk..." className="pl-10 w-64" />
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="stock" className="text-sm font-medium">Stok</label>
                      <Input
                        id="stock"
                        placeholder="Stok"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      />
                    </div>
                    <Button onClick={addProduct} className="bg-blue-600 hover:bg-blue-700 mt-4">
                      Tambah Produk
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="aspect-square bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{product.category}</Badge>
                    <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                      Stok: {product.stock}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
