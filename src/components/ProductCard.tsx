
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="aspect-square bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(product)}
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
                    onClick={() => onDelete(product.id)}
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
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{product.category?.name}</Badge>
        </div>
        <div className="bg-gray-50 p-2 rounded border-2 border-dashed border-gray-300">
          <div className="text-xs text-gray-600 mb-1">Barcode:</div>
          <div className="font-mono text-sm bg-white p-1 rounded border text-center">
            {product.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
