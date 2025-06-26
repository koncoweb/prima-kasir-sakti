
import InventoryItemCard from "./InventoryItemCard";

interface InventoryItemsListProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onPurchase: (item: any) => void;
}

const InventoryItemsList = ({ items, onEdit, onDelete, onUpdateStock, onPurchase }: InventoryItemsListProps) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateStock={onUpdateStock}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
};

export default InventoryItemsList;
