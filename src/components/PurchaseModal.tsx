import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Building, Clock, Package } from "lucide-react";
import { InventoryItem } from "@/hooks/useInventoryItems";
import { useSuppliers, Supplier, SupplierItem } from "@/hooks/useSuppliers";
import { usePurchases } from "@/hooks/usePurchases";

interface PurchaseModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: () => void;
}

const PurchaseModal = ({ item, isOpen, onClose, onStockUpdated }: PurchaseModalProps) => {
  const { suppliers, addSupplier, getSupplierItems, addSupplierItem } = useSuppliers();
  const { createPurchase, purchases, refetch: refetchPurchases } = usePurchases();
  
  const [supplierItems, setSupplierItems] = useState<SupplierItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [purchaseData, setPurchaseData] = useState({
    quantity: 0,
    unit_price: 0,
    invoice_number: "",
    notes: ""
  });

  // New supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });

  // New supplier item form
  const [newSupplierItem, setNewSupplierItem] = useState({
    supplier_id: "",
    unit_price: 0,
    minimum_order_quantity: 1,
    lead_time_days: 0,
    supplier_item_code: ""
  });

  const [activeTab, setActiveTab] = useState("purchase");

  useEffect(() => {
    if (item && isOpen) {
      loadSupplierItems();
      refetchPurchases(item.id);
      resetForms();
    }
  }, [item, isOpen]);

  const loadSupplierItems = async () => {
    if (!item) return;
    const items = await getSupplierItems(item.id);
    setSupplierItems(items);
  };

  const resetForms = () => {
    setSelectedSupplier("");
    setPurchaseData({
      quantity: 0,
      unit_price: 0,
      invoice_number: "",
      notes: ""
    });
    setNewSupplier({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      notes: ""
    });
    setNewSupplierItem({
      supplier_id: "",
      unit_price: 0,
      minimum_order_quantity: 1,
      lead_time_days: 0,
      supplier_item_code: ""
    });
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) return;

    try {
      await addSupplier({
        ...newSupplier,
        is_active: true
      });
      
      setNewSupplier({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: ""
      });
      
      setActiveTab("purchase");
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const handleAddSupplierItem = async () => {
    if (!item || !newSupplierItem.supplier_id || newSupplierItem.unit_price <= 0) return;

    try {
      await addSupplierItem({
        supplier_id: newSupplierItem.supplier_id,
        inventory_item_id: item.id,
        unit_price: newSupplierItem.unit_price,
        minimum_order_quantity: newSupplierItem.minimum_order_quantity,
        lead_time_days: newSupplierItem.lead_time_days,
        supplier_item_code: newSupplierItem.supplier_item_code || undefined,
        is_preferred: false
      });
      
      loadSupplierItems();
      setNewSupplierItem({
        supplier_id: "",
        unit_price: 0,
        minimum_order_quantity: 1,
        lead_time_days: 0,
        supplier_item_code: ""
      });
      
      setActiveTab("purchase");
    } catch (error) {
      console.error('Error adding supplier item:', error);
    }
  };

  const handleCreatePurchase = async () => {
    if (!item || !selectedSupplier || purchaseData.quantity <= 0 || purchaseData.unit_price <= 0) return;

    try {
      await createPurchase({
        supplier_id: selectedSupplier,
        inventory_item_id: item.id,
        quantity_purchased: purchaseData.quantity,
        unit_price: purchaseData.unit_price,
        invoice_number: purchaseData.invoice_number || undefined,
        notes: purchaseData.notes || undefined
      });
      
      onStockUpdated();
      resetForms();
      onClose();
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  };

  const getPreferredSupplierItem = () => {
    return supplierItems.find(si => si.is_preferred) || supplierItems[0];
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Kelola Pembelian - {item.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="purchase">Beli Barang</TabsTrigger>
            <TabsTrigger value="suppliers">Kelola Supplier</TabsTrigger>
            <TabsTrigger value="add-supplier">Tambah Supplier</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Pembelian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supplier</label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kuantitas ({item.unit})</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchaseData.quantity}
                      onChange={(e) => setPurchaseData({...purchaseData, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Harga per {item.unit}</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchaseData.unit_price}
                      onChange={(e) => setPurchaseData({...purchaseData, unit_price: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Harga</label>
                    <div className="p-2 bg-gray-50 rounded border font-bold">
                      Rp {(purchaseData.quantity * purchaseData.unit_price).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Invoice (Opsional)</label>
                    <Input
                      value={purchaseData.invoice_number}
                      onChange={(e) => setPurchaseData({...purchaseData, invoice_number: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catatan (Opsional)</label>
                    <Input
                      value={purchaseData.notes}
                      onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})}
                    />
                  </div>
                </div>

                {getPreferredSupplierItem() && (
                  <div className="p-3 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-800">
                      <strong>Supplier Terpilih:</strong> {getPreferredSupplierItem()?.supplier?.name} - 
                      Harga terakhir: Rp {getPreferredSupplierItem()?.unit_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleCreatePurchase} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!selectedSupplier || purchaseData.quantity <= 0 || purchaseData.unit_price <= 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Catat Pembelian & Update Stok
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supplier untuk {item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supplierItems.map((supplierItem) => (
                    <div key={supplierItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{supplierItem.supplier?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Harga: Rp {supplierItem.unit_price.toLocaleString('id-ID')} / {item.unit}
                        </p>
                        {supplierItem.lead_time_days > 0 && (
                          <p className="text-xs text-gray-500">
                            Lead time: {supplierItem.lead_time_days} hari
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {supplierItem.is_preferred && (
                          <Badge variant="secondary">Terpilih</Badge>
                        )}
                        {supplierItem.last_purchase_date && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(supplierItem.last_purchase_date).toLocaleDateString('id-ID')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {supplierItems.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada supplier untuk item ini</p>
                      <Button 
                        onClick={() => setActiveTab("add-supplier")} 
                        className="mt-2"
                      >
                        Tambah Supplier
                      </Button>
                    </div>
                  )}
                </div>
                
                {supplierItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Tambah Supplier Baru untuk Item Ini</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={newSupplierItem.supplier_id} 
                        onValueChange={(value) => setNewSupplierItem({...newSupplierItem, supplier_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.filter(s => !supplierItems.some(si => si.supplier_id === s.id)).map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        placeholder="Harga per unit"
                        value={newSupplierItem.unit_price}
                        onChange={(e) => setNewSupplierItem({...newSupplierItem, unit_price: Number(e.target.value)})}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAddSupplierItem} 
                      className="mt-3"
                      disabled={!newSupplierItem.supplier_id || newSupplierItem.unit_price <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Supplier Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-supplier" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tambah Supplier Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Supplier *</label>
                    <Input
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Person</label>
                    <Input
                      value={newSupplier.contact_person}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telepon</label>
                    <Input
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat</label>
                  <Textarea
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan</label>
                  <Textarea
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleAddSupplier} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!newSupplier.name}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Tambah Supplier
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riwayat Pembelian {item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchases.filter(p => p.inventory_item_id === item.id).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{purchase.supplier?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {purchase.quantity_purchased} {item.unit} × Rp {purchase.unit_price.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(purchase.purchase_date).toLocaleDateString('id-ID')} • {purchase.transaction_number}
                        </p>
                        {purchase.invoice_number && (
                          <p className="text-xs text-gray-500">Invoice: {purchase.invoice_number}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          Rp {purchase.total_amount.toLocaleString('id-ID')}
                        </div>
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {purchase.transaction_number}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {purchases.filter(p => p.inventory_item_id === item.id).length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada riwayat pembelian</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
