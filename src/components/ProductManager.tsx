
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useIntegratedProducts } from "@/hooks/useIntegratedProducts";
import IntegratedAddProductModal from "./IntegratedAddProductModal";
import IntegratedEditProductModal from "./IntegratedEditProductModal";
import IntegratedProductList from "./IntegratedProductList";

const ProductManager = () => {
  const { products, categories, loading, addProduct, updateProduct, deleteProduct, updateStock } = useIntegratedProducts();
  
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateProduct = async (id: string, updates: any) => {
    try {
      await updateProduct(id, updates);
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

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await updateStock(productId, newStock);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const openEditModal = (product: any) => {
    setEditProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditProduct(null);
    setIsEditModalOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Produk Terintegrasi</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari produk..." 
                  className="pl-10 w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <IntegratedAddProductModal categories={categories} onAddProduct={addProduct} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <IntegratedProductList
            products={filteredProducts}
            onEditProduct={openEditModal}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
          />
        </CardContent>
      </Card>

      <IntegratedEditProductModal
        product={editProduct}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductManager;
