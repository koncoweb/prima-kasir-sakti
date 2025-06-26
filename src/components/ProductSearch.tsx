
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

const ProductSearch = ({ onSearchChange, onCategoryChange, selectedCategory }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Semua", "Minuman", "Makanan", "Snack", "Dessert"];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pilih Produk</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input 
              placeholder="Cari produk..." 
              className="pl-8 w-48 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex space-x-1 mb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={`text-xs px-2 py-1 h-7 ${selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSearch;
