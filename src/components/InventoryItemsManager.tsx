import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Edit, Trash2, Package, Beaker, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventoryItems";

const InventoryItemsManager = () => {
  const { inventoryItems, loading, addInventoryItem, updateInventoryItem, updateStock, deleteInventoryItem } = useInventoryItems();
  
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    item_type: "raw_material" as const,
    unit: "pcs",
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    unit_cost: 0,
    supplier_info: ""
  });

  const [editItem, setEditItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleAddItem = async () => {
    if (!newItem.name) return;

    try {
      await addInventoryItem({
        ...newItem,
        is_active: true
      });
      
      setNewItem({
        name: "",
        description: "",
        item_type: "raw_material",
        unit: "pcs",
        current_stock: 0,
        min_stock: 0,
        max_stock: 0,
        unit_cost: 0,
        supplier_info: ""
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editItem) return;

    try {
      await updateInventoryItem(editItem.id, {
        name: editItem.name,
        description: editItem.description,
        item_type: editItem.item_type,
        unit: editItem.unit,
        min_stock: editItem.min_stock,
        max_stock: editItem.max_stock,
        unit_cost: editItem.unit_cost,
        supplier_info: editItem.supplier_info
      });
      
      setEditItem(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openEditModal = (item: any) => {
    setEditItem({ ...item });
    setIsEditModalOpen(true);
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'raw_material': return <Beaker className="h-4 w-4" />;
      case 'supply': return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'raw_material': return 'Bahan Baku';
      case 'supply': return 'Perlengkapan';
      default: return 'Produk';
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'raw_material': return 'from-emerald-500 to-teal-600';
      case 'supply': return 'from-orange-500 to-red-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current < min) return { variant: 'destructive' as const, text: 'Stok Rendah' };
    return { variant: 'secondary' as const, text: 'Normal' };
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.item_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Manajemen Inventory Items</CardTitle>
                <p className="text-sm text-slate-500">Kelola semua item inventory Anda</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari item..." 
                  className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Filter tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="raw_material">Bahan Baku</SelectItem>
                  <SelectItem value="supply">Perlengkapan</SelectItem>
                  <SelectItem value="product">Produk</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle>Tambah Inventory Item Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Item</label>
                        <Input
                          placeholder="Nama Item"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipe Item</label>
                        <Select
                          value={newItem.item_type}
                          onValueChange={(value: any) => setNewItem({...newItem, item_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="raw_material">Bahan Baku</SelectItem>
                            <SelectItem value="supply">Perlengkapan</SelectItem>
                            <SelectItem value="product">Produk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Deskripsi</label>
                      <Input
                        placeholder="Deskripsi item"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Satuan</label>
                        <Input
                          placeholder="pcs, kg, liter"
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stok Awal</label>
                        <Input
                          type="number"
                          value={newItem.current_stock}
                          onChange={(e) => setNewItem({...newItem, current_stock: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Harga Satuan</label>
                        <Input
                          type="number"
                          value={newItem.unit_cost}
                          onChange={(e) => setNewItem({...newItem, unit_cost: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stok Minimum</label>
                        <Input
                          type="number"
                          value={newItem.min_stock}
                          onChange={(e) => setNewItem({...newItem, min_stock: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stok Maksimum</label>
                        <Input
                          type="number"
                          value={newItem.max_stock}
                          onChange={(e) => setNewItem({...newItem, max_stock: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">
                      Tambah Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.current_stock, item.min_stock);
              const stockTrend = item.current_stock >= item.min_stock ? 'up' : 'down';
              
              return (
                <div key={item.id} className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`bg-gradient-to-br ${getItemTypeColor(item.item_type)} text-white`}>
                        {getItemTypeIcon(item.item_type)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getItemTypeLabel(item.item_type)}
                        </Badge>
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.text}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          {stockTrend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 font-medium">Stok</p>
                      <p className="font-bold text-xl text-slate-900">{item.current_stock} {item.unit}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-slate-500 font-medium">Harga/Unit</p>
                      <p className="font-semibold text-slate-700">Rp {(item.unit_cost || 0).toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Input
                        type="number"
                        placeholder="Update stok"
                        className="w-24 h-9 bg-white/80 backdrop-blur-sm border-slate-200"
                        id={`stock-${item.id}`}
                      />
                      <Button 
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`stock-${item.id}`) as HTMLInputElement;
                          const newStock = parseFloat(input.value) || 0;
                          if (newStock >= 0) {
                            updateStock(item.id, newStock);
                            input.value = '';
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Update
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditModal(item)}
                        className="bg-white/80 backdrop-blur-sm border-slate-200"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus "{item.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Item</label>
                  <Input
                    placeholder="Nama Item"
                    value={editItem.name}
                    onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipe Item</label>
                  <Select
                    value={editItem.item_type}
                    onValueChange={(value: any) => setEditItem({...editItem, item_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_material">Bahan Baku</SelectItem>
                      <SelectItem value="supply">Perlengkapan</SelectItem>
                      <SelectItem value="product">Produk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  placeholder="Deskripsi item"
                  value={editItem.description}
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Satuan</label>
                  <Input
                    placeholder="pcs, kg, liter"
                    value={editItem.unit}
                    onChange={(e) => setEditItem({...editItem, unit: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Harga Satuan</label>
                  <Input
                    type="number"
                    value={editItem.unit_cost}
                    onChange={(e) => setEditItem({...editItem, unit_cost: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stok Minimum</label>
                  <Input
                    type="number"
                    value={editItem.min_stock}
                    onChange={(e) => setEditItem({...editItem, min_stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stok Maksimum</label>
                  <Input
                    type="number"
                    value={editItem.max_stock}
                    onChange={(e) => setEditItem({...editItem, max_stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier Info</label>
                  <Input
                    placeholder="Informasi Supplier"
                    value={editItem.supplier_info}
                    onChange={(e) => setEditItem({...editItem, supplier_info: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateItem} className="bg-blue-600 hover:bg-blue-700">
                Update Item
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryItemsManager;
