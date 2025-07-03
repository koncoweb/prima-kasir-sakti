
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RealtimeActivity {
  id: string;
  type: 'production_order_created' | 'production_order_updated' | 'production_completed' | 'stock_alert';
  title: string;
  description: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
  metadata?: any;
}

const RealtimeProductionDashboard: React.FC = () => {
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    let channel: any;

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('production-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'production_orders'
          },
          (payload) => {
            console.log('Production order change:', payload);
            handleProductionOrderChange(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items'
          },
          (payload) => {
            console.log('Inventory change:', payload);
            handleInventoryChange(payload);
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
          
          if (status === 'SUBSCRIBED') {
            toast({
              title: "Real-time Connected",
              description: "Live updates are now active",
              variant: "default"
            });
          }
        });
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const handleProductionOrderChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    let activity: RealtimeActivity;

    switch (eventType) {
      case 'INSERT':
        activity = {
          id: `prod_${newRecord.id}_${Date.now()}`,
          type: 'production_order_created',
          title: 'New Production Order',
          description: `Order ${newRecord.order_number} created for ${newRecord.quantity_to_produce} units`,
          timestamp: new Date().toISOString(),
          status: 'info',
          metadata: newRecord
        };
        break;
      case 'UPDATE':
        const statusChanged = oldRecord.status !== newRecord.status;
        activity = {
          id: `prod_${newRecord.id}_${Date.now()}`,
          type: newRecord.status === 'completed' ? 'production_completed' : 'production_order_updated',
          title: statusChanged ? `Production ${newRecord.status.replace('_', ' ').toUpperCase()}` : 'Production Updated',
          description: statusChanged 
            ? `Order ${newRecord.order_number} status changed to ${newRecord.status.replace('_', ' ')}`
            : `Order ${newRecord.order_number} has been updated`,
          timestamp: new Date().toISOString(),
          status: newRecord.status === 'completed' ? 'success' : 'info',
          metadata: newRecord
        };
        break;
      default:
        return;
    }

    addActivity(activity);
  };

  const handleInventoryChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'UPDATE' && oldRecord && newRecord) {
      const stockLevel = newRecord.current_stock;
      const minStock = newRecord.min_stock;
      
      // Check for low stock alert
      if (stockLevel <= minStock && oldRecord.current_stock > minStock) {
        const activity: RealtimeActivity = {
          id: `stock_${newRecord.id}_${Date.now()}`,
          type: 'stock_alert',
          title: 'Low Stock Alert',
          description: `${newRecord.name} stock is low (${stockLevel} units remaining)`,
          timestamp: new Date().toISOString(),
          status: 'warning',
          metadata: newRecord
        };
        
        addActivity(activity);
      }
    }
  };

  const addActivity = (activity: RealtimeActivity) => {
    setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
    setLastUpdate(new Date());
    
    // Show toast notification for important events
    if (activity.status === 'warning' || activity.status === 'error') {
      toast({
        title: activity.title,
        description: activity.description,
        variant: activity.status === 'error' ? 'destructive' : 'default'
      });
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'production_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'stock_alert':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'production_order_created':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span>Real-time Production Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardHeader>
      </Card>

      {/* Activities Feed */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Waiting for real-time activities...</p>
                <p className="text-sm">Production updates will appear here automatically</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeProductionDashboard;
