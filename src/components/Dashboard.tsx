
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  todaySales: number;
  totalTransactions: number;
  productsSold: number;
  averageTransaction: number;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

interface Activity {
  time: string;
  action: string;
  status: 'success' | 'warning' | 'info';
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalTransactions: 0,
    productsSold: 0,
    averageTransaction: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's transactions
      const { data: todayTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            quantity,
            total_price,
            product_name
          )
        `)
        .eq('transaction_date', today);

      if (transactionsError) throw transactionsError;

      // Calculate stats
      const todaySales = todayTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
      const totalTransactions = todayTransactions?.length || 0;
      const productsSold = todayTransactions?.reduce((sum, t) => 
        sum + (t.transaction_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0), 0
      ) || 0;
      const averageTransaction = totalTransactions > 0 ? todaySales / totalTransactions : 0;

      setStats({
        todaySales,
        totalTransactions,
        productsSold,
        averageTransaction
      });

      // Calculate top products
      const productSales: { [key: string]: { sold: number; revenue: number } } = {};
      
      todayTransactions?.forEach(transaction => {
        transaction.transaction_items?.forEach((item: any) => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { sold: 0, revenue: 0 };
          }
          productSales[item.product_name].sold += item.quantity;
          productSales[item.product_name].revenue += item.total_price;
        });
      });

      const topProductsList = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setTopProducts(topProductsList);

      // Generate recent activities from transactions
      const recentActivities: Activity[] = todayTransactions
        ?.slice(0, 5)
        .map(transaction => ({
          time: transaction.transaction_time.substring(0, 5),
          action: `Transaksi ${transaction.transaction_number} - Rp ${transaction.total_amount.toLocaleString('id-ID')}`,
          status: 'success' as const
        })) || [];

      setActivities(recentActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Penjualan Hari Ini",
      value: `Rp ${stats.todaySales.toLocaleString('id-ID')}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Transaksi",
      value: stats.totalTransactions.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Produk Terjual",
      value: stats.productsSold.toString(),
      change: "+15.3%",
      trend: "up",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Rata-rata Transaksi",
      value: `Rp ${Math.round(stats.averageTransaction).toLocaleString('id-ID')}`,
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">dari kemarin</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart Placeholder */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Grafik Penjualan Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-500">Grafik Penjualan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Produk Terlaris Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada penjualan hari ini</p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sold} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Rp {product.revenue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada aktivitas hari ini</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "success" ? "bg-green-400" :
                    activity.status === "warning" ? "bg-yellow-400" : "bg-blue-400"
                  }`} />
                  <span className="text-sm text-gray-500">{activity.time}</span>
                  <span className="text-sm text-gray-700 flex-1">{activity.action}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
