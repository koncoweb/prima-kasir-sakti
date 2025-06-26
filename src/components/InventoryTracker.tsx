
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
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
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Peringatan Stok Rendah</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-100 text-red-700">
                        <Package className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{item.product?.name}</p>
                      <p className="text-sm text-red-600">
                        Stok tersisa: {item.current_stock} (Min: {item.min_stock})
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRestock(item.id, item.min_stock)}
                    className="bg-red-600 hover:bg-red-700 text-white"
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
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{inventory.length}</div>
            <p className="text-xs text-slate-500 mt-1">Produk terdaftar</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu restock</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Nilai Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              Rp {inventory.reduce((total, item) => 
                total + (item.current_stock * (item.product?.price || 0)), 0
              ).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Estimasi nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Inventory List */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Manajemen Inventory</CardTitle>
              <p className="text-sm text-slate-500">Kelola stok produk Anda</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.current_stock, item.min_stock, item.max_stock);
              const stockTrend = item.current_stock >= item.min_stock ? 'up' : 'down';
              
              return (
                <div key={item.id} className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                        <Package className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{item.product?.name}</h3>
                      <p className="text-sm text-slate-500">
                        Terakhir restock: {item.last_restock_date || 'Belum ada'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.text}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          {stockTrend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span>Trend</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 font-medium">Stok Saat Ini</p>
                      <p className="font-bold text-xl text-slate-900">{item.current_stock}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-slate-500 font-medium">Min/Max</p>
                      <p className="font-semibold text-slate-700">{item.min_stock}/{item.max_stock}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-20 h-9 bg-white/80 backdrop-blur-sm border-slate-200"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
