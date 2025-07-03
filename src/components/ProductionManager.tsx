
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3 } from 'lucide-react';
import { useProductionOrders } from '@/hooks/useProductionOrders';
import { useBillOfMaterials } from '@/hooks/useBillOfMaterials';
import { 
  completeProductionOrderEnhanced, 
  showProductionCompletionSuccess,
  showProductionCompletionError 
} from '@/utils/enhancedProductionUtils';
import { toast } from '@/hooks/use-toast';
import ProductionDashboard from './ProductionDashboard';
import ProductionOrderForm from './production/ProductionOrderForm';
import ProductionOrderCard from './production/ProductionOrderCard';
import ProductionFilters from './production/ProductionFilters';
import ProductionStats from './production/ProductionStats';
import RealtimeProductionDashboard from './production/RealtimeProductionDashboard';

const ProductionManager = () => {
  const { productionOrders, loading: ordersLoading, addProductionOrder, updateProductionOrder } = useProductionOrders();
  const { boms, loading: bomsLoading } = useBillOfMaterials();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    dateRange: '',
    bomId: ''
  });

  // Filter production orders based on current filters
  const filteredOrders = useMemo(() => {
    return productionOrders.filter(order => {
      // Search filter
      if (filters.search && !order.order_number.toLowerCase().includes(filters.search.toLowerCase()) &&
          !order.bill_of_materials?.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status && order.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) {
        return false;
      }

      // BOM filter
      if (filters.bomId && order.bom_id !== filters.bomId) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && order.planned_date) {
        const orderDate = new Date(order.planned_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        switch (filters.dateRange) {
          case 'today':
            if (orderDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'tomorrow':
            if (orderDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case 'this_week':
            if (orderDate > nextWeek) return false;
            break;
          case 'overdue':
            if (orderDate >= today || order.status === 'completed') return false;
            break;
        }
      }

      return true;
    });
  }, [productionOrders, filters]);

  const handleCreateOrder = async (orderData: any) => {
    try {
      await addProductionOrder(orderData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating production order:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (processingOrders.has(orderId)) {
      return; // Prevent double processing
    }

    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      
      const updates: any = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        updates.started_at = new Date().toISOString();
        await updateProductionOrder(orderId, updates);
      } else if (newStatus === 'completed') {
        // Use the enhanced production completion function
        console.log('Using enhanced production completion for order:', orderId);
        
        const result = await completeProductionOrderEnhanced(orderId);
        
        if (!result.success) {
          showProductionCompletionError(result.error || "Failed to complete production");
          return;
        }
        
        showProductionCompletionSuccess(result);
        
        // Refresh the production orders list to show updated data
        window.location.reload();
      } else {
        await updateProductionOrder(orderId, updates);
      }

    } catch (error) {
      console.error('Error updating production order:', error);
      toast({
        title: "Error",
        description: "Failed to update production order status",
        variant: "destructive"
      });
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  if (ordersLoading || bomsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Production Management System
          </h2>
          <p className="text-gray-600 mt-1">Advanced production planning and real-time monitoring</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Production Order
        </Button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ProductionOrderForm
            boms={boms}
            onSubmit={handleCreateOrder}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Enhanced Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports & BI</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Production Stats */}
          <ProductionStats orders={productionOrders} />

          {/* Filters */}
          <ProductionFilters
            filters={filters}
            onFiltersChange={setFilters}
            boms={boms}
            totalOrders={productionOrders.length}
            filteredCount={filteredOrders.length}
          />

          {/* Production Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <ProductionOrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isProcessing={processingOrders.has(order.id)}
              />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl mb-4 inline-block">
                <BarChart3 className="h-16 w-16 text-blue-500 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                {productionOrders.length === 0 
                  ? "No production orders yet" 
                  : "No orders match your filters"
                }
              </p>
              <p className="text-gray-400">
                {productionOrders.length === 0 
                  ? "Create your first production order to get started" 
                  : "Try adjusting your search criteria"
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealtimeProductionDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ProductionDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-8 rounded-2xl mb-4 inline-block">
              <BarChart3 className="h-16 w-16 text-purple-500 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Advanced Reporting Module</p>
            <p className="text-gray-400">Coming soon - Export capabilities, advanced analytics, and custom reports</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionManager;
