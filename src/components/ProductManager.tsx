
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const ProductManager = () => {
  const { products, categories, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
  });

  const [editProduct, setEditProduct] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      return;
    }

    try {
      await addProduct({
        name: newProduct.name,
        price: parseInt(newProduct.price),
        category_id: newProduct.category_id,
        is_active: true
      });
      
      setNewProduct({ name: "", price: "", category_id: "" });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    try {
      await updateProduct(editProduct.id, {
        name: editProduct.name,
        price: editProduct.price,
        category_id: editProduct.category_id
      });
      
      setEditProduct(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openEditModal = (product: any) => {
    setEditProduct({ ...product });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{product.category?.name}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
              <Button onClick={handleUpdateProduct} className="bg-blue-600 hover:bg-blue-700 mt-4">
                Update Produk
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
