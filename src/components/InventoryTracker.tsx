
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

const InventoryTracker = () => {
  const { inventory, loading, restockItem } = useInventory();

  const getStockStatus = (current: number, min: number, max: number) => {
    if (current < min) return { status: 'low', variant: 'destructive' as const, text: 'Stok Rendah' };
    if (current > max * 0.8) return { status: 'high', variant: 'secondary' as const, text: 'Stok Tinggi' };
    return { status: 'normal', variant: 'secondary' as const, text: 'Normal' };
  };

  const handleRestock = async (id: string, amount: number) => {
    if (amount > 0) {
      await restockItem(id, amount);
    }
  };

  const lowStockItems = inventory.filter(item => item.current_stock < item.min_stock);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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
                    <p className="font-medium text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-red-600">
                      Stok tersisa: {item.current_stock} (Min: {item.min_stock})
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRestock(item.id, item.min_stock)}
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
            <div className="text-2xl font-bold text-green-600">
              Rp {inventory.reduce((total, item) => 
                total + (item.current_stock * (item.product?.price || 0)), 0
              ).toLocaleString('id-ID')}
            </div>
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
              const stockStatus = getStockStatus(item.current_stock, item.min_stock, item.max_stock);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Terakhir restock: {item.last_restock_date || 'Belum ada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Stok Saat Ini</p>
                      <p className="font-bold text-lg">{item.current_stock}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Min/Max</p>
                      <p className="font-medium">{item.min_stock}/{item.max_stock}</p>
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
                            handleRestock(item.id, amount);
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
