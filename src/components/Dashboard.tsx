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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data dashboard...</p>
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
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500"
    },
    {
      title: "Total Transaksi",
      value: stats.totalTransactions.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      title: "Produk Terjual",
      value: stats.productsSold.toString(),
      change: "+15.3%",
      trend: "up",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-500"
    },
    {
      title: "Rata-rata Transaksi",
      value: `Rp ${Math.round(stats.averageTransaction).toLocaleString('id-ID')}`,
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconBg: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">dari kemarin</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">Grafik Penjualan Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-slate-100">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl mb-4 inline-block">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <p className="text-slate-600 font-medium">Grafik Penjualan</p>
                <p className="text-slate-500 text-sm">Akan segera hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Top Products */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">Produk Terlaris Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 rounded-2xl mb-4 inline-block">
                  <Package className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium">Belum ada penjualan hari ini</p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-slate-300 to-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.sold} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">Rp {product.revenue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Activity */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 rounded-2xl mb-4 inline-block">
                  <ShoppingCart className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium">Belum ada aktivitas hari ini</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-150">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === "success" ? "bg-emerald-400" :
                    activity.status === "warning" ? "bg-yellow-400" : "bg-blue-400"
                  }`} />
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {activity.time}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 font-medium">{activity.action}</span>
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
