
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useProductionOrders } from "@/hooks/useProductionOrders";
import { useBillOfMaterials } from "@/hooks/useBillOfMaterials";

const ProductionManager = () => {
  const { productionOrders, loading, addProductionOrder, updateProductionOrder } = useProductionOrders();
  const { billOfMaterials } = useBillOfMaterials();
  const [newOrder, setNewOrder] = useState({
    bom_id: "",
    quantity_to_produce: 1,
    planned_date: "",
    notes: "",
    status: "planned" as const,
    created_by: "Admin"
  });

  const handleAddOrder = async () => {
    if (!newOrder.bom_id || newOrder.quantity_to_produce <= 0) return;

    try {
      await addProductionOrder({
        ...newOrder,
        order_number: "", // Will be generated automatically
        planned_date: newOrder.planned_date || undefined
      });
      
      setNewOrder({
        bom_id: "",
        quantity_to_produce: 1,
        planned_date: "",
        notes: "",
        status: "planned",
        created_by: "Admin"
      });
    } catch (error) {
      console.error('Error creating production order:', error);
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
      case 'planned': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Production Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Buat Production Order Baru</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bom">Bill of Materials</Label>
              <Select value={newOrder.bom_id} onValueChange={(value) => setNewOrder(prev => ({ ...prev, bom_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih BOM" />
                </SelectTrigger>
                <SelectContent>
                  {billOfMaterials.map((bom) => (
                    <SelectItem key={bom.id} value={bom.id}>
                      {bom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Jumlah Produksi</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newOrder.quantity_to_produce}
                onChange={(e) => setNewOrder(prev => ({ ...prev, quantity_to_produce: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div>
              <Label htmlFor="planned_date">Tanggal Rencana</Label>
              <Input
                id="planned_date"
                type="date"
                value={newOrder.planned_date}
                onChange={(e) => setNewOrder(prev => ({ ...prev, planned_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={newOrder.notes}
                onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan produksi..."
              />
            </div>
          </div>

          <Button onClick={handleAddOrder} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Buat Production Order
          </Button>
        </CardContent>
      </Card>

      {/* Production Orders List */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Daftar Production Orders</h3>
        {productionOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Belum ada production order
            </CardContent>
          </Card>
        ) : (
          productionOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{order.order_number}</h4>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      <strong>BOM:</strong> {order.bill_of_materials?.name || 'N/A'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <p><strong>Qty:</strong> {order.quantity_to_produce}</p>
                      <p><strong>Tanggal:</strong> {order.planned_date || 'Belum ditentukan'}</p>
                      <p><strong>Oleh:</strong> {order.created_by}</p>
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-gray-600">
                        <strong>Catatan:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'planned' && (
                      <Button
                        size="sm"
                        onClick={() => updateProductionOrder(order.id, { status: 'in_progress', started_at: new Date().toISOString() })}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {order.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProductionOrder(order.id, { status: 'completed', completed_at: new Date().toISOString() })}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductionManager;
