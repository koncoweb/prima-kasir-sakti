import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Download, Calendar, User, Package, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TransactionItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_time: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  cashier_name: string;
  items: TransactionItem[];
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [searchId, setSearchId] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Gagal mengambil data transaksi",
          variant: "destructive"
        });
        return;
      }

      const formattedTransactions: Transaction[] = transactionData?.map(transaction => ({
        id: transaction.id,
        transaction_number: transaction.transaction_number,
        transaction_date: transaction.transaction_date,
        transaction_time: transaction.transaction_time,
        subtotal: transaction.subtotal,
        tax_amount: transaction.tax_amount,
        total_amount: transaction.total_amount,
        payment_method: transaction.payment_method,
        cashier_name: transaction.cashier_name,
        items: transaction.transaction_items || []
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const dateMatch = !filterDate || transaction.transaction_date === filterDate;
    const paymentMatch = !filterPayment || filterPayment === "all" || transaction.payment_method === filterPayment;
    const searchMatch = !searchId || transaction.transaction_number.toLowerCase().includes(searchId.toLowerCase());
    return dateMatch && paymentMatch && searchMatch;
  });

  const totalSales = filteredTransactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
  const totalTransactions = filteredTransactions.length;
  
  const getStatusBadge = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'Cash': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'Card': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'E-Wallet': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
    }
  };

  const getPlatformIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'Cash': return <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center"><CreditCard className="h-3 w-3 text-white" /></div>;
      case 'Card': return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center"><CreditCard className="h-3 w-3 text-white" /></div>;
      case 'E-Wallet': return <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center"><CreditCard className="h-3 w-3 text-white" /></div>;
      default: return <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center"><CreditCard className="h-3 w-3 text-white" /></div>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTransactions}</div>
            <p className="text-xs text-slate-500 mt-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              Rp {totalSales.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Rata-rata Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {totalTransactions > 0 ? (totalSales / totalTransactions).toLocaleString('id-ID') : '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Table */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Recent Orders</CardTitle>
                <p className="text-sm text-slate-500">Riwayat transaksi terbaru</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-48 bg-white/80 backdrop-blur-sm border-slate-200"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-slate-200">
                  <Download className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-slate-200">
                  Sort By
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 rounded-2xl mb-4 inline-block">
                <Package className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-600 font-medium">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Product(s)</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="group">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {transaction.cashier_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">{transaction.cashier_name}</p>
                          <p className="text-sm text-slate-500">{transaction.transaction_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.items.length > 0 ? transaction.items[0].product_name : 'Mixed Items'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(transaction.payment_method)}
                        <span className="font-medium text-slate-900">Darling POS</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900">
                        Rp {transaction.total_amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-slate-500">
                        {transaction.transaction_date} {transaction.transaction_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{transaction.payment_method}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(transaction.payment_method)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-blue-200 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800">Detail Transaksi {selectedTransaction.transaction_number}</CardTitle>
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
                className="bg-white/80 backdrop-blur-sm"
              >
                Tutup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Tanggal & Waktu</p>
                  <p className="font-medium text-slate-900">{selectedTransaction.transaction_date} - {selectedTransaction.transaction_time}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Metode Pembayaran</p>
                  <p className="font-medium text-slate-900">{selectedTransaction.payment_method}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-2">Item yang dibeli:</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl">
                      <span className="font-medium text-slate-900">{item.product_name} x{item.quantity}</span>
                      <span className="font-semibold text-slate-900">Rp {item.total_price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">Rp {selectedTransaction.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Pajak (10%):</span>
                  <span className="font-medium text-slate-900">Rp {selectedTransaction.tax_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-emerald-600">Rp {selectedTransaction.total_amount.toLocaleString('id-ID')}</span>
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
