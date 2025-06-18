
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Receipt, BarChart3, Database } from "lucide-react";
import POSInterface from "@/components/POSInterface";
import ProductManager from "@/components/ProductManager";
import InventoryTracker from "@/components/InventoryTracker";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <img 
                  src="/lovable-uploads/973ab159-0b2c-4849-a27b-09eb6f1a4bf6.png" 
                  alt="Shopping Cart Logo" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistem POS</h1>
                <p className="text-gray-600">Point of Sale & Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleDataMigration}
                disabled={isMigrating}
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Database className="h-4 w-4 mr-2" />
                {isMigrating ? "Migrasi..." : "Migrasi Data"}
              </Button>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
              <div className="text-right">
                <p className="text-sm text-gray-600">Kasir: Admin</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 h-12">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>POS</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Produk</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Transaksi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="pos">
            <POSInterface />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTracker />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
