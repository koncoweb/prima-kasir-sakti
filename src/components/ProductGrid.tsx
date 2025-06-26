
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: {
    name: string;
  };
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">Tidak ada produk</h3>
        <p className="text-gray-500 text-sm">Tidak ada produk yang sesuai dengan pencarian Anda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onAddToCart(product)}
          className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-blue-200 group"
        >
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            
            {/* Stock badge */}
            <div className="absolute top-1 right-1">
              <Badge 
                variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                className="text-xs font-medium px-1 py-0 h-4"
              >
                {product.stock}
              </Badge>
            </div>

            {/* Quick add button */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-blue-600 text-white rounded-full p-1 shadow-lg">
                <Plus className="h-2 w-2" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-2">
            <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1 leading-tight">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-blue-600 font-bold text-sm">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                {product.category && (
                  <span className="text-xs text-gray-500 capitalize">
                    {product.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Product ID */}
            <div className="mt-1 text-xs text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded text-center truncate">
              #{product.id.slice(0, 8)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
