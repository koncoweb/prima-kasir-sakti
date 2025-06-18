
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_time: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  cashier_name: string;
  created_at: string;
  items?: TransactionItem[];
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items(
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const transactionsWithItems = data?.map(transaction => ({
        ...transaction,
        items: transaction.transaction_items || []
      })) || [];
      
      setTransactions(transactionsWithItems);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (
    items: TransactionItem[],
    paymentMethod: string,
    cashierName: string = "Admin"
  ) => {
    try {
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = Math.round(subtotal * 0.1);
      const totalAmount = subtotal + taxAmount;
      
      // Generate transaction number
      const transactionNumber = `TRX${Date.now().toString().slice(-6)}`;
      
      // Insert transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          transaction_number: transactionNumber,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          cashier_name: cashierName
        }])
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Insert transaction items
      const itemsWithTransactionId = items.map(item => ({
        ...item,
        transaction_id: transaction.id
      }));
      
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsWithTransactionId);
      
      if (itemsError) throw itemsError;
      
      // Update inventory
      for (const item of items) {
        const { data: inventoryData } = await supabase
          .from('inventory')
          .select('current_stock')
          .eq('product_id', item.product_id)
          .single();
        
        if (inventoryData) {
          await supabase
            .from('inventory')
            .update({ 
              current_stock: inventoryData.current_stock - item.quantity 
            })
            .eq('product_id', item.product_id);
        }
      }
      
      toast({
        title: "Transaksi berhasil!",
        description: `Total: Rp ${totalAmount.toLocaleString('id-ID')}`,
      });
      
      await fetchTransactions();
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    refetch: fetchTransactions
  };
};
