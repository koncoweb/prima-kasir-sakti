
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  PlayCircle,
  XCircle
} from 'lucide-react';

interface ProductionOrder {
  id: string;
  status: string;
  planned_date?: string;
  quantity_to_produce: number;
  priority?: string;
  created_at: string;
}

interface ProductionStatsProps {
  orders: ProductionOrder[];
}

const ProductionStats: React.FC<ProductionStatsProps> = ({ orders }) => {
  // Calculate statistics
  const totalOrders = orders.length;
  const plannedOrders = orders.filter(o => o.status === 'planned').length;
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  // Calculate overdue orders
  const today = new Date();
  const overdueOrders = orders.filter(o => 
    o.planned_date && 
    new Date(o.planned_date) < today && 
    o.status !== 'completed' && 
    o.status !== 'cancelled'
  ).length;

  // Calculate high priority orders
  const highPriorityOrders = orders.filter(o => 
    o.priority === 'urgent' || o.priority === 'high'
  ).length;

  // Calculate total production quantity
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity_to_produce, 0);
  const completedQuantity = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.quantity_to_produce, 0);

  // Calculate completion rate
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Calculate efficiency metrics
  const activeOrders = plannedOrders + inProgressOrders;
  const efficiency = activeOrders > 0 ? ((inProgressOrders / activeOrders) * 100) : 0;

  const statsData = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: `${completionRate.toFixed(1)}% complete`,
      trend: completionRate > 70 ? "up" : "down",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      title: "In Progress",
      value: inProgressOrders.toString(),
      change: `${efficiency.toFixed(0)}% of active`,
      trend: efficiency > 50 ? "up" : "down",
      icon: PlayCircle,
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-500"
    },
    {
      title: "Completed",
      value: completedOrders.toString(),
      change: `${completedQuantity.toLocaleString()} units`,
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500"
    },
    {
      title: "Overdue",
      value: overdueOrders.toString(),
      change: overdueOrders > 0 ? "Needs attention" : "On track",
      trend: overdueOrders > 0 ? "down" : "up",
      icon: AlertTriangle,
      color: overdueOrders > 0 ? "text-red-600" : "text-green-600",
      bgColor: overdueOrders > 0 ? "bg-gradient-to-br from-red-50 to-red-100" : "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: overdueOrders > 0 ? "bg-red-500" : "bg-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Planned</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{plannedOrders}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <PlayCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">In Progress</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">{inProgressOrders}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Completed</span>
              </div>
              <Badge className="bg-green-100 text-green-800">{completedOrders}</Badge>
            </div>
            {cancelledOrders > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Cancelled</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{cancelledOrders}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Priority Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">High Priority Orders</span>
              <Badge className={highPriorityOrders > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                {highPriorityOrders}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Production Volume</span>
              <span className="font-semibold">{totalQuantity.toLocaleString()} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="font-semibold">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Orders Efficiency</span>
              <span className="font-semibold">{efficiency.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionStats;
