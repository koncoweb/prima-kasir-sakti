
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Receipt, BarChart3, Database, Bell, Settings } from "lucide-react";
import POSInterface from "@/components/POSInterface";
import ProductManager from "@/components/ProductManager";
import InventoryTracker from "@/components/InventoryTracker";
import InventoryItemsManager from "@/components/InventoryItemsManager";
import BOMManager from "@/components/BOMManager";
import ProductionManager from "@/components/ProductionManager";
import TransactionHistory from "@/components/TransactionHistory";
import Dashboard from "@/components/Dashboard";
import { migrateData } from "@/utils/dataMigration";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMigrating, setIsMigrating] = useState(false);

  const handleDataMigration = async () => {
    setIsMigrating(true);
    try {
      await migrateData();
      toast({
        title: "Migrasi Data Berhasil",
        description: "Data produk dan inventory telah berhasil dimigrasikan ke Supabase",
      });
    } catch (error) {
      toast({
        title: "Migrasi Data Gagal",
        description: "Terjadi kesalahan saat migrasi data",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <img 
                  src="/lovable-uploads/973ab159-0b2c-4849-a27b-09eb6f1a4bf6.png" 
                  alt="Darling Pos Logo" 
                  className="h-6 w-6 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Darling Pos
                </h1>
                <p className="text-slate-500 text-sm font-medium">Point of Sale & Inventory Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleDataMigration}
                disabled={isMigrating}
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm"
              >
                <Database className="h-4 w-4 mr-2" />
                {isMigrating ? "Migrasi..." : "Migrasi Data"}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">Admin</p>
                  <p className="text-xs text-slate-500">{new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Modern Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-2 shadow-sm">
            <TabsList className="w-full bg-transparent p-0 h-auto gap-1">
              <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Dashboard</span>
                  <span className="sm:hidden font-medium">Dash</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pos" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">POS</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="products" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Package className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Produk</span>
                  <span className="sm:hidden font-medium">Prod</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="inventory" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Package className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Inventory</span>
                  <span className="sm:hidden font-medium">Inv</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="inventory-items" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Database className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Items</span>
                  <span className="sm:hidden font-medium">Item</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="bom" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Receipt className="h-5 w-5" />
                  <span className="font-medium">BOM</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="production" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Receipt className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Produksi</span>
                  <span className="sm:hidden font-medium">Prod</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="transactions" 
                  className="flex flex-col items-center space-y-2 p-4 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <Receipt className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Transaksi</span>
                  <span className="sm:hidden font-medium">Trans</span>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* Tab Contents with enhanced styling */}
          <div className="animate-fade-in">
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>

            <TabsContent value="pos" className="mt-0">
              <POSInterface />
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <ProductManager />
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <InventoryTracker />
            </TabsContent>

            <TabsContent value="inventory-items" className="mt-0">
              <InventoryItemsManager />
            </TabsContent>

            <TabsContent value="bom" className="mt-0">
              <BOMManager />
            </TabsContent>

            <TabsContent value="production" className="mt-0">
              <ProductionManager />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <TransactionHistory />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
