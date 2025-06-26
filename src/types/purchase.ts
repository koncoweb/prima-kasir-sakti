
export interface PurchaseTransaction {
  id: string;
  transaction_number: string;
  supplier_id?: string;
  inventory_item_id?: string;
  quantity_purchased: number;
  unit_price: number;
  total_amount: number;
  purchase_date: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  supplier?: {
    id: string;
    name: string;
  };
  inventory_item?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CreatePurchaseData {
  supplier_id: string;
  inventory_item_id: string;
  quantity_purchased: number;
  unit_price: number;
  invoice_number?: string;
  notes?: string;
}
