import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Search, Plus, X, ShoppingCart, Package, Percent, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import Receipt from "./Receipt";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  stock?: number;
}

interface CompletedTransaction {
  transactionNumber: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  cashierName: string;
  date: string;
  time: string;
}

const POSInterface = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // Default 10%
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);

  const categories = ["Semua", "Minuman", "Makanan", "Snack", "Dessert"];
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const { products, loading: productsLoading } = useProducts();
  const { inventory, loading: inventoryLoading } = useInventory();

  // Combine products with inventory data
  const productsWithStock = products.map(product => {
    const inventoryItem = inventory.find(inv => inv.product_id === product.id);
    return {
      ...product,
      stock: inventoryItem?.current_stock || 0
    };
  });

  const filteredProducts = productsWithStock.filter(product => {
    const matchesCategory = selectedCategory === "Semua" || product.category?.name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.stock > 0;
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stok tidak mencukupi",
          description: `Stok tersedia: ${product.stock}`,
          variant: "destructive"
        });
        return;
      }
      
      const updatedCart = cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category?.name,
        stock: product.stock
      }]);
    }
    
    toast({
      title: "Produk ditambahkan",
      description: `${product.name} berhasil ditambahkan ke keranjang`,
    });
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = productsWithStock.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast({
        title: "Stok tidak mencukupi",
        description: `Stok tersedia: ${product.stock}`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
  };

  const calculateTotals = () => {
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);

    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (newSubtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    // Apply discount first, then tax
    const discountedSubtotal = Math.max(0, newSubtotal - discountAmount);
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const finalTotal = discountedSubtotal + taxAmount;
    
    setTotal(finalTotal);
  };

  const getDiscountAmount = () => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const getTaxAmount = () => {
    const discountAmount = getDiscountAmount();
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    return (discountedSubtotal * taxRate) / 100;
  };

  const generateTransactionNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `TRX${timestamp}`;
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Silakan tambahkan produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const discountAmount = getDiscountAmount();
      const taxAmount = getTaxAmount();
      const transactionNumber = generateTransactionNumber();
      const now = new Date();
      const date = now.toLocaleDateString('id-ID');
      const time = now.toLocaleTimeString('id-ID');
      
      // Insert transaction with discount information
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          transaction_number: transactionNumber,
          subtotal: subtotal,
          discount_amount: Math.round(discountAmount),
          discount_percentage: discountType === 'percentage' ? discountValue : null,
          tax_amount: Math.round(taxAmount),
          total_amount: Math.round(total),
          payment_method: 'Cash',
          cashier_name: 'Admin'
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Insert transaction items
      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Update inventory (reduce stock)
      for (const item of cart) {
        const inventoryItem = inventory.find(inv => inv.product_id === item.id);
        if (inventoryItem) {
          const newStock = inventoryItem.current_stock - item.quantity;
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ current_stock: Math.max(0, newStock) })
            .eq('id', inventoryItem.id);

          if (updateError) {
            console.error('Error updating inventory:', updateError);
          }
        }
      }

      // Prepare transaction data for receipt
      const transactionData: CompletedTransaction = {
        transactionNumber,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal,
        discountAmount: Math.round(discountAmount),
        discountType,
        discountValue,
        taxAmount: Math.round(taxAmount),
        taxRate,
        total,
        paymentMethod: 'Cash',
        cashierName: 'Admin',
        date,
        time
      };

      setCompletedTransaction(transactionData);
      setShowReceipt(true);

      toast({
        title: "Transaksi berhasil!",
        description: `Nomor transaksi: ${transactionNumber}`,
      });
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Gagal memproses transaksi",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintComplete = () => {
    // Reset form after printing
    setCart([]);
    setSubtotal(0);
    setTotal(0);
    setDiscountValue(0);
    setShowReceipt(false);
    setCompletedTransaction(null);
  };

  useEffect(() => {
    calculateTotals();
  }, [cart, taxRate, discountType, discountValue]);

  if (productsLoading || inventoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat data produk...</p>
        </div>
      </div>
    );
  }

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
                <Input 
                  placeholder="Cari produk..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada produk yang tersedia</p>
          </div>
        )}
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
                
                {/* Tax and Discount Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax-rate">Pajak (%)</Label>
                      <div className="relative">
                        <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="tax-rate"
                          type="number"
                          min="0"
                          max="100"
                          value={taxRate}
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="discount-type">Tipe Diskon</Label>
                      <select
                        id="discount-type"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Persen (%)</option>
                        <option value="fixed">Nominal (Rp)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="discount-value">
                      Diskon {discountType === 'percentage' ? '(%)' : '(Rp)'}
                    </Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="discount-value"
                        type="number"
                        min="0"
                        max={discountType === 'percentage' ? 100 : subtotal}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {getDiscountAmount() > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>
                        Diskon {discountType === 'percentage' ? `(${discountValue}%)` : ''}
                      </span>
                      <span>-Rp {getDiscountAmount().toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Pajak ({taxRate}%)</span>
                    <span>Rp {getTaxAmount().toLocaleString('id-ID')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      Rp {Math.round(total).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isProcessing ? "Memproses..." : "Bayar Sekarang"}
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
