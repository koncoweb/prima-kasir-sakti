
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Percent } from "lucide-react";

interface PricingControlsProps {
  taxEnabled: boolean;
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  subtotal: number;
  onTaxEnabledChange: (enabled: boolean) => void;
  onTaxRateChange: (rate: number) => void;
  onDiscountTypeChange: (type: 'percentage' | 'fixed') => void;
  onDiscountValueChange: (value: number) => void;
}

const PricingControls = ({
  taxEnabled,
  taxRate,
  discountType,
  discountValue,
  subtotal,
  onTaxEnabledChange,
  onTaxRateChange,
  onDiscountTypeChange,
  onDiscountValueChange
}: PricingControlsProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="tax-enabled" className="text-xs">Pajak</Label>
            <Switch
              id="tax-enabled"
              checked={taxEnabled}
              onCheckedChange={onTaxEnabledChange}
            />
          </div>
          {taxEnabled && (
            <div className="relative">
              <Calculator className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => onTaxRateChange(Number(e.target.value))}
                className="pl-7 h-8 text-xs"
                placeholder="Persentase pajak"
              />
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="discount-type" className="text-xs">Tipe Diskon</Label>
          <select
            id="discount-type"
            value={discountType}
            onChange={(e) => onDiscountTypeChange(e.target.value as 'percentage' | 'fixed')}
            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-8"
          >
            <option value="percentage">Persen (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="discount-value" className="text-xs">
          Diskon {discountType === 'percentage' ? '(%)' : '(Rp)'}
        </Label>
        <div className="relative">
          <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            id="discount-value"
            type="number"
            min="0"
            max={discountType === 'percentage' ? 100 : subtotal}
            value={discountValue}
            onChange={(e) => onDiscountValueChange(Number(e.target.value))}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingControls;
