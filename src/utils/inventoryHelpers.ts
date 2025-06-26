
import { Package, Beaker, Wrench } from "lucide-react";

export const getItemTypeIcon = (type: string) => {
  switch (type) {
    case 'raw_material': return Beaker;
    case 'supply': return Wrench;
    default: return Package;
  }
};

export const getItemTypeLabel = (type: string) => {
  switch (type) {
    case 'raw_material': return 'Bahan Baku';
    case 'supply': return 'Perlengkapan';
    default: return 'Produk';
  }
};

export const getItemTypeColor = (type: string) => {
  switch (type) {
    case 'raw_material': return 'from-emerald-500 to-teal-600';
    case 'supply': return 'from-orange-500 to-red-600';
    default: return 'from-blue-500 to-indigo-600';
  }
};

export const getStockStatus = (current: number, min: number) => {
  if (current < min) return { variant: 'destructive' as const, text: 'Stok Rendah' };
  return { variant: 'secondary' as const, text: 'Normal' };
};
