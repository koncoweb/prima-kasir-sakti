
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Package,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  getProductionCostAnalysis, 
  getInventoryValuation, 
  getBOMProfitability,
  getLowStockItems,
  type ProductionCostAnalysis,
  type InventoryValuation,
  type BOMProfitability
} from '@/utils/enhancedProductionUtils';

const ProductionDashboard = () => {
  const [costAnalysis, setCostAnalysis] = useState<ProductionCostAnalysis[]>([]);
  const [inventoryValuation, setInventoryValuation] = useState<InventoryValuation[]>([]);
  const [bomProfitability, setBomProfitability] = useState<BOMProfitability[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryValuation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        const [costData, inventoryData, profitabilityData, lowStockData] = await Promise.all([
          getProductionCostAnalysis(),
          getInventoryValuation(),
          getBOMProfitability(),
          getLowStockItems()
        ]);

        console.log('Dashboard data fetched:', {
          costData: costData.length,
          inventoryData: inventoryData.length,
          profitabilityData: profitabilityData.length,
          lowStockData: lowStockData.length
        });

        setCostAnalysis(costData);
        setInventoryValuation(inventoryData);
        setBomProfitability(profitabilityData);
        setLowStockItems(lowStockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOW_STOCK': return 'bg-red-100 text-red-800';
      case 'OVERSTOCK': return 'bg-yellow-100 text-yellow-800';
      case 'NORMAL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalInventoryValue = inventoryValuation.reduce((sum, item) => sum + item.latest_value, 0);
  const avgProfitMargin = bomProfitability.length > 0 
    ? bomProfitability.reduce((sum, bom) => sum + bom.profit_margin_percent, 0) / bomProfitability.length 
    : 0;
  const completedProductions = costAnalysis.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Production Dashboard</h2>
        <p className="text-gray-600">Monitor production efficiency, costs, and inventory health</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryValuation.length} active items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProfitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across {bomProfitability.length} BOMs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Productions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProductions}</div>
            <p className="text-xs text-muted-foreground">
              Out of {costAnalysis.length} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="cost-analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Valuation</TabsTrigger>
          <TabsTrigger value="profitability">BOM Profitability</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="cost-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Production Cost Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costAnalysis.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No production data available</p>
                ) : (
                  costAnalysis.slice(0, 10).map((production) => (
                    <div key={production.production_order_id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{production.order_number}</h4>
                          <p className="text-sm text-gray-600">{production.recipe_name}</p>
                        </div>
                        <Badge variant={production.status === 'completed' ? 'default' : 'secondary'}>
                          {production.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Planned Cost</p>
                          <p className="font-medium">{formatCurrency(production.planned_cost || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Actual Cost</p>
                          <p className="font-medium">{formatCurrency(production.actual_cost || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Variance</p>
                          <p className={`font-medium ${
                            (production.cost_variance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {production.cost_variance > 0 ? '+' : ''}{formatCurrency(production.cost_variance || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Inventory Valuation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryValuation.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{item.item_type}</p>
                      </div>
                      <Badge className={getStatusColor(item.stock_status)}>
                        {item.stock_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stock</p>
                        <p className="font-medium">{item.current_stock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Unit Cost</p>
                        <p className="font-medium">{formatCurrency(item.latest_cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-medium">{formatCurrency(item.latest_value)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Min/Max</p>
                        <p className="font-medium">{item.min_stock}/{item.max_stock}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>BOM Profitability Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bomProfitability.map((bom) => (
                  <div key={bom.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{bom.bom_name}</h4>
                        <p className="text-sm text-gray-600">{bom.product_name}</p>
                      </div>
                      <Badge className={
                        bom.profit_margin_percent > 30 ? 'bg-green-100 text-green-800' :
                        bom.profit_margin_percent > 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {bom.profit_margin_percent.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Selling Price</p>
                        <p className="font-medium">{formatCurrency(bom.selling_price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Production Cost</p>
                        <p className="font-medium">{formatCurrency(bom.production_cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gross Profit</p>
                        <p className="font-medium text-green-600">{formatCurrency(bom.gross_profit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Margin</p>
                        <p className="font-medium">{bom.profit_margin_percent.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Stock Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">All items are well stocked!</p>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">{item.name}</h4>
                          <p className="text-sm text-red-600 capitalize">{item.item_type}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          Low Stock
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-red-600">Current Stock</p>
                          <p className="font-medium text-red-800">{item.current_stock}</p>
                        </div>
                        <div>
                          <p className="text-red-600">Minimum Required</p>
                          <p className="font-medium text-red-800">{item.min_stock}</p>
                        </div>
                        <div>
                          <p className="text-red-600">Reorder Needed</p>
                          <p className="font-medium text-red-800">{item.max_stock - item.current_stock}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDashboard;
