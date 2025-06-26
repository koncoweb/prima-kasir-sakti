
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { getItemTypeIcon, getItemTypeLabel, getItemTypeColor, getStockStatus } from "@/utils/inventoryHelpers";

interface InventoryItemCardProps {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onPurchase: (item: any) => void;
}

const InventoryItemCard = ({ item, onEdit, onDelete, onUpdateStock, onPurchase }: InventoryItemCardProps) => {
  const stockStatus = getStockStatus(item.current_stock, item.min_stock);
  const stockTrend = item.current_stock >= item.min_stock ? 'up' : 'down';
  const ItemIcon = getItemTypeIcon(item.item_type);

  const handleStockUpdate = () => {
    const input = document.getElementById(`stock-${item.id}`) as HTMLInputElement;
    const newStock = parseFloat(input.value) || 0;
    if (newStock >= 0) {
      onUpdateStock(item.id, newStock);
      input.value = '';
    }
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={`bg-gradient-to-br ${getItemTypeColor(item.item_type)} text-white`}>
            <ItemIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{item.name}</h3>
          <p className="text-sm text-slate-500">{item.description}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {getItemTypeLabel(item.item_type)}
            </Badge>
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.text}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              {stockTrend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">Stok</p>
          <p className="font-bold text-xl text-slate-900">{item.current_stock} {item.unit}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">Harga/Unit</p>
          <p className="font-semibold text-slate-700">Rp {(item.unit_cost || 0).toLocaleString('id-ID')}</p>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Input
            type="number"
            placeholder="Update stok"
            className="w-24 h-9 bg-white/80 backdrop-blur-sm border-slate-200"
            id={`stock-${item.id}`}
          />
          <Button 
            size="sm"
            onClick={handleStockUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Update
          </Button>
          <Button 
            size="sm" 
            onClick={() => onPurchase(item)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit(item)}
            className="bg-white/80 backdrop-blur-sm border-slate-200"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus "{item.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(item.id)}
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
  );
};

export default InventoryItemCard;
