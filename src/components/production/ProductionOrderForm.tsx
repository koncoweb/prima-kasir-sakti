
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BOM {
  id: string;
  name: string;
  yield_quantity: number;
  product?: {
    name: string;
  };
}

interface ProductionOrderFormProps {
  boms: BOM[];
  onSubmit: (orderData: any) => Promise<void>;
  onCancel: () => void;
}

const ProductionOrderForm: React.FC<ProductionOrderFormProps> = ({
  boms,
  onSubmit,
  onCancel
}) => {
  const [selectedBomId, setSelectedBomId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [plannedDate, setPlannedDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBomId) {
      toast({
        title: "Error",
        description: "Please select a BOM",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        bom_id: selectedBomId,
        quantity_to_produce: quantity,
        status: 'planned',
        planned_date: plannedDate || undefined,
        priority,
        notes: notes || undefined,
        created_by: 'Admin'
      });
      onCancel(); // Close form after successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBom = boms.find(bom => bom.id === selectedBomId);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Create New Production Order</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="bom-select">Bill of Materials *</Label>
              <Select value={selectedBomId} onValueChange={setSelectedBomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select BOM" />
                </SelectTrigger>
                <SelectContent>
                  {boms.map((bom) => (
                    <SelectItem key={bom.id} value={bom.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{bom.name}</span>
                        <span className="text-sm text-gray-500">
                          Yield: {bom.yield_quantity}
                          {bom.product?.name && ` → ${bom.product.name}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBom && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Selected:</strong> {selectedBom.name}
                  </p>
                  <p className="text-sm text-blue-600">
                    Expected yield: {quantity * selectedBom.yield_quantity} units
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity to Produce *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="planned-date">Planned Date</Label>
              <Input
                id="planned-date"
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="Additional notes for this production order..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Production Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductionOrderForm;
