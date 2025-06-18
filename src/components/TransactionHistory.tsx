
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Download, Calendar } from "lucide-react";

const TransactionHistory = () => {
  const [transactions] = useState([
    {
      id: "TRX001234",
      date: "2024-01-16",
      time: "14:30",
      items: [
        { name: "Caramel Milkshake", qty: 2, price: 26000 },
        { name: "Chicken Wings", qty: 1, price: 32000 }
      ],
      subtotal: 84000,
      tax: 8400,
      total: 92400,
      paymentMethod: "Cash",
      cashier: "Admin"
    },
    {
      id: "TRX001233",
      date: "2024-01-16",
      time: "14:25",
      items: [
        { name: "Coffee Latte", qty: 1, price: 30000 },
        { name: "Dino Nugget", qty: 1, price: 12000 }
      ],
      subtotal: 42000,
      tax: 4200,
      total: 46200,
      paymentMethod: "Card",
      cashier: "Admin"
    },
    {
      id: "TRX001232",
      date: "2024-01-16",
      time: "14:20",
      items: [
        { name: "Chocolate Frapucino", qty: 1, price: 39000 },
        { name: "Custom Cake", qty: 1, price: 45000 }
      ],
      subtotal: 84000,
      tax: 8400,
      total: 92400,
      paymentMethod: "Cash",
      cashier: "Admin"
    },
    {
      id: "TRX001231",
      date: "2024-01-16",
      time: "14:15",
      items: [
        { name: "Cha Tea Latte", qty: 3, price: 29000 }
      ],
      subtotal: 87000,
      tax: 8700,
      total: 95700,
      paymentMethod: "E-Wallet",
      cashier: "Admin"
    },
    {
      id: "TRX001230",
      date: "2024-01-16",
      time: "14:10",
      items: [
        { name: "Chicken Popcorn", qty: 2, price: 23000 },
        { name: "Caramel Mochiato", qty: 1, price: 30000 }
      ],
      subtotal: 76000,
      tax: 7600,
      total: 83600,
      paymentMethod: "Cash",
      cashier: "Admin"
    }
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterPayment, setFilterPayment] = useState("");

  const filteredTransactions = transactions.filter(transaction => {
    const dateMatch = !filterDate || transaction.date === filterDate;
    const paymentMatch = !filterPayment || filterPayment === "all" || transaction.paymentMethod === filterPayment;
    return dateMatch && paymentMatch;
  });

  const totalSales = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transaksi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
            <p className="text-xs text-gray-500 mt-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalSales.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hari ini</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Rata-rata Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {totalTransactions > 0 ? (totalSales / totalTransactions).toLocaleString('id-ID') : '0'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari ID transaksi..." className="pl-10 w-48" />
              </div>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40"
              />
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Metode Bayar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Kartu</SelectItem>
                  <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{transaction.id}</h3>
                    <p className="text-sm text-gray-500">
                      {transaction.date} - {transaction.time} | Kasir: {transaction.cashier}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transaction.items.length} item(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="font-bold text-green-600">
                      Rp {transaction.total.toLocaleString('id-ID')}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.paymentMethod}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal (simplified) */}
      {selectedTransaction && (
        <Card className="bg-white shadow-sm border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Transaksi {selectedTransaction.id}</CardTitle>
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Tutup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                  <p className="font-medium">{selectedTransaction.date} - {selectedTransaction.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-medium">{selectedTransaction.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Item yang dibeli:</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name} x{item.qty}</span>
                      <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rp {selectedTransaction.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Pajak (10%):</span>
                  <span>Rp {selectedTransaction.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">Rp {selectedTransaction.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistory;
