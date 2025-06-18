
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, X, ShoppingCart, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const POSInterface = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const categories = ["Semua", "Minuman", "Makanan", "Snack", "Dessert"];
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const products = [
    { id: 1, name: "Caramel Milkshake", price: 26000, category: "Minuman", stock: 50, image: "/api/placeholder/150/150" },
    { id: 2, name: "Caramel Mochiato", price: 30000, category: "Minuman", stock: 30, image: "/api/placeholder/150/150" },
    { id: 3, name: "Cha Tea Latte", price: 29000, category: "Minuman", stock: 25, image: "/api/placeholder/150/150" },
    { id: 4, name: "Chicken Popcorn", price: 23000, category: "Makanan", stock: 40, image: "/api/placeholder/150/150" },
    { id: 5, name: "Chicken Stick", price: 20000, category: "Makanan", stock: 35, image: "/api/placeholder/150/150" },
    { id: 6, name: "Chicken Wings", price: 32000, category: "Makanan", stock: 20, image: "/api/placeholder/150/150" },
    { id: 7, name: "Chocolate Frapucino", price: 39000, category: "Minuman", stock: 15, image: "/api/placeholder/150/150" },
    { id: 8, name: "Coffee Latte", price: 30000, category: "Minuman", stock: 45, image: "/api/placeholder/150/150" },
    { id: 9, name: "Custom Cake", price: 45000, category: "Dessert", stock: 10, image: "/api/placeholder/150/150" },
    { id: 10, name: "Dino Nugget", price: 12000, category: "Snack", stock: 60, image: "/api/placeholder/150/150" }
  ];

  const filteredProducts = selectedCategory === "Semua" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    calculateTotal();
    toast({
      title: "Produk ditambahkan",
      description: `${product.name} berhasil ditambahkan ke keranjang`,
    });
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    calculateTotal();
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    calculateTotal();
  };

  const calculateTotal = () => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Silakan tambahkan produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Transaksi berhasil!",
      description: `Total: Rp ${total.toLocaleString('id-ID')}`,
    });
    
    setCart([]);
    setTotal(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search and Categories */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pilih Produk</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari produk..." className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-bold text-lg">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  Stok: {product.stock}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Keranjang ({cart.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Keranjang masih kosong</p>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-blue-600 font-semibold">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                        >
                          +
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pajak (10%)</span>
                    <span>Rp {(total * 0.1).toLocaleString('id-ID')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      Rp {(total * 1.1).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={processPayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Bayar Sekarang
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSInterface;
