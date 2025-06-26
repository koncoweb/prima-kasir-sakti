
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";

interface PaymentSectionProps {
  paymentAmount: number;
  changeAmount: number;
  total: number;
  isProcessing: boolean;
  onPaymentAmountChange: (amount: number) => void;
  onProcessPayment: () => void;
}

const PaymentSection = ({
  paymentAmount,
  changeAmount,
  total,
  isProcessing,
  onPaymentAmountChange,
  onProcessPayment
}: PaymentSectionProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="payment-amount" className="text-xs">Uang Dari Pelanggan (Rp)</Label>
        <div className="relative">
          <Banknote className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            id="payment-amount"
            type="number"
            min="0"
            value={paymentAmount}
            onChange={(e) => onPaymentAmountChange(Number(e.target.value))}
            className="pl-7 h-8 text-xs"
            placeholder="Masukkan nominal uang"
          />
        </div>
      </div>
      
      {paymentAmount > 0 && (
        <div className="flex justify-between text-base font-semibold">
          <span>Kembalian</span>
          <span className={changeAmount >= 0 ? "text-blue-600" : "text-red-600"}>
            Rp {changeAmount.toLocaleString('id-ID')}
          </span>
        </div>
      )}
      
      <Button 
        onClick={onProcessPayment}
        disabled={isProcessing || paymentAmount < total}
        className="w-full bg-green-600 hover:bg-green-700 text-white h-10"
        size="lg"
      >
        {isProcessing ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </div>
  );
};

export default PaymentSection;
