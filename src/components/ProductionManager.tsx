
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Factory, Calculator, Clock, CheckCircle, XCircle, Play } from "lucide-react";
import { useProductionOrders } from "@/hooks/useProductionOrders";
import { useBillOfMaterials } from "@/hooks/useBillOfMaterials";

const ProductionManager = () => {
  const { productionOrders, loading, addProductionOrder, updateProductionOrderStatus, simulateProduction } = useProductionOrders();
  const { boms } = useBillOfMaterials();
  
  const [newOrder, setNewOrder] = useState({
    bom_id: "",
    quantity_to_produce: 1,
    planned_date: "",
    notes: ""
  });

  const [simulation, setSimulation] = useState<any>(null);
  const [simulationBOM, setSimulationBOM] = useState("");
  const [simulationQuantity, setSimulationQuantity] = useState(1);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  const handleAddOrder = async () => {
    if (!newOrder.bom_id || !newOrder.quantity_to_produce) return;

    try {
      await addProductionOrder({
        ...newOrder,
        planned_date: newOrder.planned_date || null,
        status: 'planned',
        created_by: 'Admin'
      });
      
      setNewOrder({
        bom_id: "",
        quantity_to_produce: 1,
        planned_date: "",
        notes: ""
      });
      setIsAddOrderModalOpen(false);
    } catch (error) {
      console.error('Error adding production order:', error);
    }
  };

  const handleSimulation = async () => {
    if (!simulationBOM || !simulationQuantity) return;

    try {
      const result = await simulateProduction(simulationBOM, simulationQuantity);
      setSimulation(result);
    } catch (error) {
      console.error('Error running simulation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="simulation">Production Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Header */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Production Orders</CardTitle>
                <Dialog open={isAddOrderModalOpen} onOpenChange={setIsAddOrderModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Order Produksi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Buat Production Order Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bill of Materials</label>
                        <Select
                          value={newOrder.bom_id}
                          onValueChange={(value) => setNewOrder({...newOrder, bom_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih BOM" />
                          </SelectTrigger>
                          <SelectContent>
                            {boms.map((bom) => (
                              <SelectItem key={bom.id} value={bom.id}>
                                {bom.name} (Yield: {bom.yield_quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Jumlah Produksi</label>
                        <Input
                          type="number"
                          value={newOrder.quantity_to_produce}
                          onChange={(e) => setNewOrder({...newOrder, quantity_to_produce: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tanggal Rencana</label>
                        <Input
                          type="date"
                          value={newOrder.planned_date}
                          onChange={(e) => setNewOrder({...newOrder, planned_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catatan</label>
                        <Input
                          placeholder="Catatan produksi"
                          value={newOrder.notes}
                          onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddOrder} className="bg-blue-600 hover:bg-blue-700">
                        Buat Order
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Production Orders List */}
          <div className="space-y-4">
            {productionOrders.map((order) => (
              <Card key={order.id} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Factory className="h-5 w-5 text-gray-600" />
                        <h3 className="font-medium text-lg">{order.order_number}</h3>
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>BOM:</strong> {order.bill_of_materials?.name}</p>
                        <p><strong>Quantity:</strong> {order.quantity_to_produce} unit</p>
                        {order.planned_date && (
                          <p><strong>Tanggal:</strong> {new Date(order.planned_date).toLocaleDateString('id-ID')}</p>
                        )}
                        {order.notes && <p><strong>Catatan:</strong> {order.notes}</p>}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'planned' && (
                        <Button 
                          size="sm"
                          onClick={() => updateProductionOrderStatus(order.id, 'in_progress')}
                        >
                          Mulai Produksi
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button 
                          size="sm"
                          onClick={() => updateProductionOrderStatus(order.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Selesai
                        </Button>
                      )}
                      {(order.status === 'planned' || order.status === 'in_progress') && (
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => updateProductionOrderStatus(order.id, 'cancelled')}
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {productionOrders.length === 0 && (
            <Card className="bg-white shadow-sm">
              <CardContent className="text-center py-8">
                <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">Belum ada production order</p>
                <p className="text-sm text-gray-400">Mulai dengan membuat order produksi pertama</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Production Simulator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bill of Materials</label>
                  <Select
                    value={simulationBOM}
                    onValueChange={setSimulationBOM}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih BOM untuk simulasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {boms.map((bom) => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah yang Ingin Diproduksi</label>
                  <Input
                    type="number"
                    value={simulationQuantity}
                    onChange={(e) => setSimulationQuantity(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSimulation}
                disabled={!simulationBOM || !simulationQuantity}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Jalankan Simulasi
              </Button>

              {simulation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-4">Hasil Simulasi: {simulation.bomName}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Diminta</p>
                      <p className="font-bold text-lg">{simulation.requestedQuantity} unit</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maksimal Bisa Diproduksi</p>
                      <p className="font-bold text-lg">{simulation.maxProducible} unit</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge variant={simulation.canProduce ? "secondary" : "destructive"}>
                      {simulation.canProduce ? "✓ Dapat Diproduksi" : `✗ Tidak Cukup Bahan (${simulation.limitingFactor})`}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Estimasi Total Cost: Rp {simulation.estimatedCost.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Kebutuhan Material:</h5>
                    {simulation.materialRequirements.map((req: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-sm text-gray-600">
                            Diperlukan: {req.required} {req.unit} | Tersedia: {req.available} {req.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={req.canSupply ? "secondary" : "destructive"}>
                            {req.canSupply ? "✓" : "✗"}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            Rp {req.totalCost.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionManager;
