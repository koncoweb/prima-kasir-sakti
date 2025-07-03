
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertTriangle, Package } from 'lucide-react';

interface ProductionOrder {
  id: string;
  order_number: string;
  bom_id: string;
  quantity_to_produce: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  planned_date?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  priority?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  bill_of_materials?: {
    name: string;
    description?: string;
  };
}

interface ProductionOrderCardProps {
  order: ProductionOrder;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isProcessing: boolean;
}

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({
  order,
  onStatusUpdate,
  isProcessing
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const isOverdue = order.planned_date && new Date(order.planned_date) < new Date() && order.status !== 'completed';

  return (
    <Card className={`bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
      isOverdue ? 'border-l-4 border-l-red-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">{order.order_number}</h3>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {order.priority && (
              <Badge className={`${getPriorityColor(order.priority)} text-xs`}>
                {order.priority.toUpperCase()}
              </Badge>
            )}
            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Bill of Materials:</p>
          <p className="font-medium">{order.bill_of_materials?.name || 'Unknown'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Quantity:</p>
            <p className="font-medium">{order.quantity_to_produce.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Planned Date:</p>
            <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {order.planned_date ? new Date(order.planned_date).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
        </div>

        {order.notes && (
          <div>
            <p className="text-sm text-gray-600">Notes:</p>
            <p className="text-sm bg-gray-50 p-2 rounded">{order.notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Created: {new Date(order.created_at).toLocaleString('id-ID')}</p>
          {order.started_at && (
            <p>Started: {new Date(order.started_at).toLocaleString('id-ID')}</p>
          )}
          {order.completed_at && (
            <p>Completed: {new Date(order.completed_at).toLocaleString('id-ID')}</p>
          )}
        </div>

        <Separator />

        <div className="flex space-x-2">
          {order.status === 'planned' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(order.id, 'in_progress')}
              className="bg-yellow-600 hover:bg-yellow-700 flex-1"
              disabled={isProcessing}
            >
              <PlayCircle className="h-3 w-3 mr-1" />
              {isProcessing ? 'Starting...' : 'Start Production'}
            </Button>
          )}
          {order.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(order.id, 'completed')}
              className="bg-green-600 hover:bg-green-700 flex-1"
              disabled={isProcessing}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {isProcessing ? 'Completing...' : 'Complete'}
            </Button>
          )}
          {(order.status === 'planned' || order.status === 'in_progress') && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onStatusUpdate(order.id, 'cancelled')}
              className="flex-1"
              disabled={isProcessing}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionOrderCard;
