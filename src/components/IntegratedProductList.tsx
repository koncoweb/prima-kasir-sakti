
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Package, TrendingUp, TrendingDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { IntegratedProduct } from "@/services/integratedProductService";

interface IntegratedProductListProps {
  products: IntegratedProduct[];
  onEditProduct: (product: IntegratedProduct) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

const IntegratedProductList = ({ 
  products, 
  onEditProduct, 
  onDeleteProduct, 
  onUpdateStock 
}: IntegratedProductListProps) => {
  
  const getStockStatus = (product: IntegratedProduct) => {
    if (!product.inventory) return null;
    
    const { current_stock, min_stock } = product.inventory;
    if (current_stock < min_stock) {
      return { variant: 'destructive' as const, text: 'Stok Rendah', trend: 'down' };
    }
    return { variant: 'secondary' as const, text: 'Stok Normal', trend: 'up' };
  };

  const handleStockUpdate = (productId: string) => {
    const input = document.getElementById(`stock-${productId}`) as HTMLInputElement;
    const newStock = parseFloat(input.value) || 0;
    if (newStock >= 0) {
      onUpdateStock(productId, newStock);
      input.value = '';
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
        <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk baru.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        
        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">
                        {product.category?.name || 'Tanpa Kategori'}
                      </Badge>
                      {stockStatus && (
                        <>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.text}
                          </Badge>
                          {stockStatus.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium">Harga</p>
                    <p className="font-bold text-lg">Rp {product.price.toLocaleString('id-ID')}</p>
                  </div>
                  
                  {product.inventory && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Stok</p>
                      <p className="font-bold text-lg">
                        {product.inventory.current_stock} {product.inventory.unit}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {product.inventory && (
                      <>
                        <Input
                          type="number"
                          placeholder="Update stok"
                          className="w-24 h-9"
                          id={`stock-${product.id}`}
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleStockUpdate(product.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Update
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEditProduct(product)}
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
                            Apakah Anda yakin ingin menghapus "{product.name}"? 
                            {product.inventory && " Data inventory juga akan dihapus."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IntegratedProductList;
