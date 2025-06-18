
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

const InventoryTracker = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: "Caramel Milkshake", currentStock: 50, minStock: 20, maxStock: 100, lastRestock: "2024-01-15" },
    { id: 2, name: "Caramel Mochiato", currentStock: 30, minStock: 15, maxStock: 80, lastRestock: "2024-01-14" },
    { id: 3, name: "Cha Tea Latte", currentStock: 8, minStock: 25, maxStock: 75, lastRestock: "2024-01-10" },
    { id: 4, name: "Chicken Popcorn", currentStock: 40, minStock: 30, maxStock: 120, lastRestock: "2024-01-16" },
    { id: 5, name: "Chicken Stick", currentStock: 12, minStock: 35, maxStock: 100, lastRestock: "2024-01-12" },
    { id: 6, name: "Chicken Wings", currentStock: 20, minStock: 15, maxStock: 60, lastRestock: "2024-01-15" },
  ]);

  const getStockStatus = (current: number, min: number, max: number) => {
    if (current < min) return { status: 'low', variant: 'destructive' as const, text: 'Stok Rendah' };
    if (current > max * 0.8) return { status: 'high', variant: 'secondary' as const, text: 'Stok Tinggi' };
    return { status: 'normal', variant: 'secondary' as const, text: 'Normal' };
  };

  const restockItem = (id: number, amount: number) => {
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, currentStock: item.currentStock + amount, lastRestock: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  const lowStockItems = inventory.filter(item => item.currentStock < item.minStock);

  return (
    <div className="space-y-6">
      {/* Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Peringatan Stok Rendah</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-red-600">
                      Stok tersisa: {item.currentStock} (Min: {item.minStock})
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => restockItem(item.id, item.minStock)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
            <p className="text-xs text-gray-500 mt-1">Produk terdaftar</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">Perlu restock</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Nilai Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp 2.8M</div>
            <p className="text-xs text-gray-500 mt-1">Estimasi nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Manajemen Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Terakhir restock: {item.lastRestock}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Stok Saat Ini</p>
                      <p className="font-bold text-lg">{item.currentStock}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Min/Max</p>
                      <p className="font-medium">{item.minStock}/{item.maxStock}</p>
                    </div>
                    
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.text}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Jumlah"
                        className="w-20"
                        id={`restock-${item.id}`}
                      />
                      <Button 
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`restock-${item.id}`) as HTMLInputElement;
                          const amount = parseInt(input.value) || 0;
                          if (amount > 0) {
                            restockItem(item.id, amount);
                            input.value = '';
                          }
                        }}
                      >
                        Restock
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryTracker;
