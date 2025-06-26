import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, PlayCircle, CheckCircle, XCircle, Package, Clock } from 'lucide-react';
import { useProductionOrders } from '@/hooks/useProductionOrders';
import { useBillOfMaterials } from '@/hooks/useBillOfMaterials';
import { consumeProductionMaterials, showInsufficientStockWarning } from '@/utils/productionUtils';
import { toast } from '@/hooks/use-toast';

const ProductionManager = () => {
  const { productionOrders, loading: ordersLoading, addProductionOrder, updateProductionOrder } = useProductionOrders();
  const { boms, loading: bomsLoading } = useBillOfMaterials();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [plannedDate, setPlannedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  const handleCreateOrder = async () => {
    if (!selectedBomId) {
      toast({
        title: "Error",
        description: "Pilih BOM terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      await addProductionOrder({
        bom_id: selectedBomId,
        quantity_to_produce: quantity,
        status: 'planned',
        planned_date: plannedDate || undefined,
        notes: notes || undefined,
        created_by: 'Admin'
      });

      // Reset form
      setSelectedBomId('');
      setQuantity(1);
      setPlannedDate('');
      setNotes('');
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
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        
        // Find the production order to get BOM and quantity info
        const productionOrder = productionOrders.find(order => order.id === orderId);
        
        if (productionOrder && productionOrder.bom_id) {
          console.log('Processing material consumption for completed production order');
          
          // Consume materials from inventory
          const consumptionResult = await consumeProductionMaterials(
            productionOrder.bom_id,
            productionOrder.quantity_to_produce
          );
          
          if (!consumptionResult.success) {
            if (consumptionResult.insufficientStock) {
              showInsufficientStockWarning(consumptionResult.insufficientStock);
            } else {
              toast({
                title: "Error",
                description: consumptionResult.error || "Gagal mengkonsumsi material",
                variant: "destructive"
              });
            }
            return; // Don't update status if material consumption failed
          }
          
          toast({
            title: "Produksi Selesai",
            description: `Production order ${productionOrder.order_number} selesai dan material telah dikonsumsi dari inventory`,
          });
        }
      }

      await updateProductionOrder(orderId, updates);
    } catch (error) {
      console.error('Error updating production order:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status production order",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (ordersLoading || bomsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat data production orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Manager</h2>
          <p className="text-gray-600">Kelola production orders dan manufacturing</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Production Order Baru
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Buat Production Order Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bom-select">Bill of Materials</Label>
              <select
                id="bom-select"
                value={selectedBomId}
                onChange={(e) => setSelectedBomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih BOM</option>
                {boms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.name} (Yield: {bom.yield_quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity to Produce</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="planned-date">Planned Date</Label>
                <Input
                  id="planned-date"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Catatan production order..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateOrder} className="bg-green-600 hover:bg-green-700">
                Buat Order
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productionOrders.map((order) => (
          <Card key={order.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.order_number}</CardTitle>
                <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">BOM:</p>
                <p className="font-medium">{order.bill_of_materials?.name || 'Unknown'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Quantity:</p>
                  <p className="font-medium">{order.quantity_to_produce}</p>
                </div>
                <div>
                  <p className="text-gray-600">Planned Date:</p>
                  <p className="font-medium">
                    {order.planned_date ? new Date(order.planned_date).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes:</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}

              <Separator />

              <div className="flex space-x-2">
                {order.status === 'planned' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                    className="bg-yellow-600 hover:bg-yellow-700 flex-1"
                    disabled={processingOrders.has(order.id)}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    {processingOrders.has(order.id) ? 'Processing...' : 'Start'}
                  </Button>
                )}
                {order.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={processingOrders.has(order.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {processingOrders.has(order.id) ? 'Processing...' : 'Complete'}
                  </Button>
                )}
                {(order.status === 'planned' || order.status === 'in_progress') && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    className="flex-1"
                    disabled={processingOrders.has(order.id)}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productionOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada production orders</p>
          <p className="text-gray-400">Buat production order pertama Anda</p>
        </div>
      )}
    </div>
  );
};

export default ProductionManager;
