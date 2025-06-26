
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, FileText, Calculator } from "lucide-react";
import { useBillOfMaterials } from "@/hooks/useBillOfMaterials";
import { useProducts } from "@/hooks/useProducts";
import { useInventoryItems } from "@/hooks/useInventoryItems";

const BOMManager = () => {
  const { boms, loading, addBOM, addBOMItem, deleteBOMItem } = useBillOfMaterials();
  const { products } = useProducts();
  const { inventoryItems } = useInventoryItems();
  
  const [newBOM, setNewBOM] = useState({
    name: "",
    description: "",
    product_id: "",
    yield_quantity: 1
  });

  const [newBOMItem, setNewBOMItem] = useState({
    inventory_item_id: "",
    quantity_required: 0,
    notes: ""
  });

  const [selectedBOM, setSelectedBOM] = useState<string>("");
  const [isAddBOMModalOpen, setIsAddBOMModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const handleAddBOM = async () => {
    if (!newBOM.name) return;

    try {
      await addBOM({
        ...newBOM,
        product_id: newBOM.product_id || null,
        is_active: true
      });
      
      setNewBOM({
        name: "",
        description: "",
        product_id: "",
        yield_quantity: 1
      });
      setIsAddBOMModalOpen(false);
    } catch (error) {
      console.error('Error adding BOM:', error);
    }
  };

  const handleAddBOMItem = async () => {
    if (!selectedBOM || !newBOMItem.inventory_item_id || !newBOMItem.quantity_required) return;

    try {
      await addBOMItem(selectedBOM, {
        inventory_item_id: newBOMItem.inventory_item_id,
        quantity_required: newBOMItem.quantity_required,
        notes: newBOMItem.notes
      });
      
      setNewBOMItem({
        inventory_item_id: "",
        quantity_required: 0,
        notes: ""
      });
      setIsAddItemModalOpen(false);
    } catch (error) {
      console.error('Error adding BOM item:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bill of Materials (BOM) Manager</CardTitle>
            <Dialog open={isAddBOMModalOpen} onOpenChange={setIsAddBOMModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat BOM Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Buat Bill of Materials Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama BOM</label>
                    <Input
                      placeholder="Nama resep/formula"
                      value={newBOM.name}
                      onChange={(e) => setNewBOM({...newBOM, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deskripsi</label>
                    <Input
                      placeholder="Deskripsi BOM"
                      value={newBOM.description}
                      onChange={(e) => setNewBOM({...newBOM, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Produk Terkait (Opsional)</label>
                    <Select
                      value={newBOM.product_id}
                      onValueChange={(value) => setNewBOM({...newBOM, product_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tidak ada produk</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jumlah Hasil (Yield)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newBOM.yield_quantity}
                      onChange={(e) => setNewBOM({...newBOM, yield_quantity: Number(e.target.value)})}
                    />
                  </div>
                  <Button onClick={handleAddBOM} className="bg-blue-600 hover:bg-blue-700">
                    Buat BOM
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* BOM List */}
      <div className="grid gap-6">
        {boms.map((bom) => (
          <Card key={bom.id} className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{bom.name}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{bom.description}</p>
                  <div className="flex space-x-2 mt-2">
                    {bom.product && (
                      <Badge variant="outline">Produk: {bom.product.name}</Badge>
                    )}
                    <Badge variant="secondary">Yield: {bom.yield_quantity}</Badge>
                    <Badge variant="secondary">
                      Total Cost: Rp {(bom.total_cost || 0).toLocaleString('id-ID')}
                    </Badge>
                  </div>
                </div>
                <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedBOM(bom.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Komponen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Tambah Komponen ke BOM</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Item Inventory</label>
                        <Select
                          value={newBOMItem.inventory_item_id}
                          onValueChange={(value) => setNewBOMItem({...newBOMItem, inventory_item_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih item inventory" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Jumlah Diperlukan</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newBOMItem.quantity_required}
                          onChange={(e) => setNewBOMItem({...newBOMItem, quantity_required: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catatan (Opsional)</label>
                        <Input
                          placeholder="Catatan tambahan"
                          value={newBOMItem.notes}
                          onChange={(e) => setNewBOMItem({...newBOMItem, notes: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddBOMItem} className="bg-blue-600 hover:bg-blue-700">
                        Tambah Komponen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {bom.bom_items && bom.bom_items.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Komponen BOM:</h4>
                  {bom.bom_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.inventory_item?.name}</p>
                        <p className="text-sm text-gray-600">
                          Diperlukan: {item.quantity_required} {item.inventory_item?.unit}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          Rp {((item.unit_cost || item.inventory_item?.unit_cost || 0) * item.quantity_required).toLocaleString('id-ID')}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Komponen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus komponen "{item.inventory_item?.name}" dari BOM ini?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteBOMItem(item.id, bom.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada komponen dalam BOM ini</p>
                  <p className="text-sm">Klik "Tambah Komponen" untuk mulai menambahkan bahan</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {boms.length === 0 && (
        <Card className="bg-white shadow-sm">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Belum ada Bill of Materials</p>
            <p className="text-sm text-gray-400">Mulai dengan membuat BOM pertama Anda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BOMManager;
