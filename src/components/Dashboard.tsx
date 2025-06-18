
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Penjualan Hari Ini",
      value: "Rp 2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Transaksi",
      value: "147",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Produk Terjual",
      value: "324",
      change: "+15.3%",
      trend: "up",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Rata-rata Transaksi",
      value: "Rp 16,667",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const topProducts = [
    { name: "Chicken Wings", sold: 45, revenue: "Rp 1,440,000" },
    { name: "Caramel Milkshake", sold: 38, revenue: "Rp 988,000" },
    { name: "Chocolate Frapucino", sold: 32, revenue: "Rp 1,248,000" },
    { name: "Coffee Latte", sold: 28, revenue: "Rp 840,000" },
    { name: "Chicken Popcorn", sold: 25, revenue: "Rp 575,000" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            <CardTitle className="text-lg font-semibold">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
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
                  <p className="font-semibold text-gray-900">{product.revenue}</p>
                </div>
              </div>
            ))}
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
            {[
              { time: "14:30", action: "Transaksi #001234 - Rp 65,000", status: "success" },
              { time: "14:25", action: "Stok Chicken Wings berkurang 2 pcs", status: "warning" },
              { time: "14:20", action: "Transaksi #001233 - Rp 45,000", status: "success" },
              { time: "14:15", action: "Produk baru ditambahkan: Green Tea Latte", status: "info" },
              { time: "14:10", action: "Transaksi #001232 - Rp 78,000", status: "success" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" ? "bg-green-400" :
                  activity.status === "warning" ? "bg-yellow-400" : "bg-blue-400"
                }`} />
                <span className="text-sm text-gray-500">{activity.time}</span>
                <span className="text-sm text-gray-700 flex-1">{activity.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
