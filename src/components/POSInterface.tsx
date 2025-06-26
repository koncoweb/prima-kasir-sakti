import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import Receipt from "./Receipt";
import ProductSearch from "./ProductSearch";
import ProductGrid from "./ProductGrid";
import CartSummary from "./CartSummary";

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
  taxEnabled: boolean;
  total: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: string;
  cashierName: string;
  date: string;
  time: string;
}

const POSInterface = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(10);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);

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
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
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
    const taxAmount = taxEnabled ? (discountedSubtotal * taxRate) / 100 : 0;
    const finalTotal = discountedSubtotal + taxAmount;
    
    setTotal(finalTotal);
  };

  const calculateChange = () => {
    const change = Math.max(0, paymentAmount - total);
    setChangeAmount(change);
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

    if (paymentAmount < total) {
      toast({
        title: "Uang tidak mencukupi",
        description: `Kurang: Rp ${(total - paymentAmount).toLocaleString('id-ID')}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const getDiscountAmount = () => {
        if (discountType === 'percentage') {
          return (subtotal * discountValue) / 100;
        }
        return discountValue;
      };

      const getTaxAmount = () => {
        if (!taxEnabled) return 0;
        const discountAmount = getDiscountAmount();
        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        return (discountedSubtotal * taxRate) / 100;
      };

      const discountAmount = getDiscountAmount();
      const taxAmount = getTaxAmount();
      const transactionNumber = generateTransactionNumber();
      const now = new Date();
      const date = now.toLocaleDateString('id-ID');
      const time = now.toLocaleTimeString('id-ID');
      
      // Insert transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          transaction_number: transactionNumber,
          subtotal: subtotal,
          discount_amount: Math.round(discountAmount),
          discount_percentage: discountType === 'percentage' ? discountValue : null,
          tax_amount: Math.round(taxAmount),
          total_amount: Math.round(total),
          payment_amount: Math.round(paymentAmount),
          change_amount: Math.round(changeAmount),
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

      // Update inventory
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
        taxEnabled,
        total,
        paymentAmount: Math.round(paymentAmount),
        changeAmount: Math.round(changeAmount),
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
    setPaymentAmount(0);
    setChangeAmount(0);
    setShowReceipt(false);
    setCompletedTransaction(null);
  };

  useEffect(() => {
    calculateTotals();
  }, [cart, taxEnabled, taxRate, discountType, discountValue]);

  useEffect(() => {
    calculateChange();
  }, [paymentAmount, total]);

  if (showReceipt && completedTransaction) {
    return (
      <Receipt
        transactionNumber={completedTransaction.transactionNumber}
        items={completedTransaction.items}
        subtotal={completedTransaction.subtotal}
        discountAmount={completedTransaction.discountAmount}
        discountType={completedTransaction.discountType}
        discountValue={completedTransaction.discountValue}
        taxAmount={completedTransaction.taxAmount}
        taxRate={completedTransaction.taxRate}
        taxEnabled={completedTransaction.taxEnabled}
        total={completedTransaction.total}
        paymentAmount={completedTransaction.paymentAmount}
        changeAmount={completedTransaction.changeAmount}
        paymentMethod={completedTransaction.paymentMethod}
        cashierName={completedTransaction.cashierName}
        date={completedTransaction.date}
        time={completedTransaction.time}
        onPrint={handlePrintComplete}
      />
    );
  }

  if (productsLoading || inventoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <ProductSearch
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        
        <ProductGrid
          products={filteredProducts}
          onAddToCart={addToCart}
        />
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-4">
        <CartSummary
          cart={cart}
          subtotal={subtotal}
          taxEnabled={taxEnabled}
          taxRate={taxRate}
          discountType={discountType}
          discountValue={discountValue}
          total={total}
          paymentAmount={paymentAmount}
          changeAmount={changeAmount}
          isProcessing={isProcessing}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onTaxEnabledChange={setTaxEnabled}
          onTaxRateChange={setTaxRate}
          onDiscountTypeChange={setDiscountType}
          onDiscountValueChange={setDiscountValue}
          onPaymentAmountChange={setPaymentAmount}
          onProcessPayment={processPayment}
        />
      </div>
    </div>
  );
};

export default POSInterface;
