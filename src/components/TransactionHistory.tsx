
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Download, Calendar } from "lucide-react";
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
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transaksi
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
            <p className="text-xs text-gray-500 mt-1">Total</p>
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
                <Input 
                  placeholder="Cari ID transaksi..." 
                  className="pl-10 w-48"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
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
              <Button variant="outline" onClick={fetchTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
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
                      <h3 className="font-medium text-gray-900">{transaction.transaction_number}</h3>
                      <p className="text-sm text-gray-500">
                        {transaction.transaction_date} - {transaction.transaction_time} | Kasir: {transaction.cashier_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transaction.items.length} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-bold text-green-600">
                        Rp {transaction.total_amount.toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.payment_method}
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
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Card className="bg-white shadow-sm border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Transaksi {selectedTransaction.transaction_number}</CardTitle>
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
                  <p className="font-medium">{selectedTransaction.transaction_date} - {selectedTransaction.transaction_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-medium">{selectedTransaction.payment_method}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Item yang dibeli:</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span>Rp {item.total_price.toLocaleString('id-ID')}</span>
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
                  <span>Rp {selectedTransaction.tax_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">Rp {selectedTransaction.total_amount.toLocaleString('id-ID')}</span>
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
