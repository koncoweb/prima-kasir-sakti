import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X } from "lucide-react";
import PricingControls from "./PricingControls";
import PaymentSection from "./PaymentSection";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  stock?: number;
}

interface CartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  taxEnabled: boolean;
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  paymentAmount: number;
  changeAmount: number;
  isProcessing: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onTaxEnabledChange: (enabled: boolean) => void;
  onTaxRateChange: (rate: number) => void;
  onDiscountTypeChange: (type: 'percentage' | 'fixed') => void;
  onDiscountValueChange: (value: number) => void;
  onPaymentAmountChange: (amount: number) => void;
  onProcessPayment: () => void;
}

const CartSummary = ({
  cart,
  subtotal,
  taxEnabled,
  taxRate,
  discountType,
  discountValue,
  total,
  paymentAmount,
  changeAmount,
  isProcessing,
  onUpdateQuantity,
  onRemoveFromCart,
  onTaxEnabledChange,
  onTaxRateChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onPaymentAmountChange,
  onProcessPayment
}: CartSummaryProps) => {
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

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <ShoppingCart className="h-4 w-4" />
          <span>Keranjang ({cart.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">Keranjang masih kosong</p>
        ) : (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-xs">{item.name}</h4>
                    <p className="text-blue-600 font-semibold text-sm">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {item.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateQuantity(item.id, item.quantity - 1);
                      }}
                      className="h-6 w-6 p-0 text-xs"
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-xs">{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateQuantity(item.id, item.quantity + 1);
                      }}
                      className="h-6 w-6 p-0 text-xs"
                    >
                      +
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromCart(item.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <PricingControls
              taxEnabled={taxEnabled}
              taxRate={taxRate}
              discountType={discountType}
              discountValue={discountValue}
              subtotal={subtotal}
              onTaxEnabledChange={onTaxEnabledChange}
              onTaxRateChange={onTaxRateChange}
              onDiscountTypeChange={onDiscountTypeChange}
              onDiscountValueChange={onDiscountValueChange}
            />
            
            <Separator />
            
            {/* Price Breakdown */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>
                    Diskon {discountType === 'percentage' ? `(${discountValue}%)` : ''}
                  </span>
                  <span>-Rp {getDiscountAmount().toLocaleString('id-ID')}</span>
                </div>
              )}
              {taxEnabled && (
                <div className="flex justify-between text-xs">
                  <span>Pajak ({taxRate}%)</span>
                  <span>Rp {getTaxAmount().toLocaleString('id-ID')}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-green-600">
                  Rp {Math.round(total).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <PaymentSection
              paymentAmount={paymentAmount}
              changeAmount={changeAmount}
              total={total}
              isProcessing={isProcessing}
              onPaymentAmountChange={onPaymentAmountChange}
              onProcessPayment={onProcessPayment}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
