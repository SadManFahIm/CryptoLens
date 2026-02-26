"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import usePortfolioStore from "@/store/usePortfolioStore";
import { demoSearchData } from "@/store/searchData";
import Image from "next/image";
import { toast } from "sonner";

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price?: number;
}

interface AddHoldingDialogProps {
  liveCoins: CoinOption[];
}

export default function AddHoldingDialog({ liveCoins }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CoinOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const { addHolding } = usePortfolioStore();

  // Merge live coin data (has images + prices) with searchData for lookup
  const coinList: CoinOption[] = liveCoins.length > 0 ? liveCoins : demoSearchData;

  const filtered = coinList
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8);

  const handleSelect = (coin: CoinOption) => {
    setSelected(coin);
    if (coin.current_price) {
      setBuyPrice(coin.current_price.toString());
    }
    setSearch("");
  };

  const handleAdd = () => {
    if (!selected || !quantity || !buyPrice) {
      toast.error("Please fill all fields");
      return;
    }
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      toast.error("Enter valid quantity and price");
      return;
    }
    addHolding({
      id: selected.id,
      name: selected.name,
      symbol: selected.symbol.toUpperCase(),
      image: selected.image || "",
      quantity: qty,
      avgBuyPrice: price,
    });
    toast.success(`Added ${selected.name} to portfolio`);
    setOpen(false);
    setSelected(null);
    setQuantity("");
    setBuyPrice("");
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setSelected(null);
      setSearch("");
      setQuantity("");
      setBuyPrice("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {!selected ? (
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search coin (e.g. Bitcoin)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {search && (
                <div className="mt-2 rounded-md border bg-background shadow-sm max-h-60 overflow-y-auto">
                  {filtered.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No coins found
                    </p>
                  )}
                  {filtered.map((coin) => (
                    <button
                      key={coin.id}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors text-sm"
                      onClick={() => handleSelect(coin)}
                    >
                      {coin.image && (
                        <Image
                          src={coin.image.replace("/large/", "/small/")}
                          alt={coin.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className="font-medium">{coin.name}</span>
                      <span className="text-muted-foreground uppercase text-xs">
                        {coin.symbol}
                      </span>
                      {coin.current_price && (
                        <span className="ml-auto text-muted-foreground">
                          ${coin.current_price.toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
              {selected.image && (
                <Image
                  src={selected.image.replace("/large/", "/small/")}
                  alt={selected.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-sm">{selected.name}</p>
                <p className="text-xs text-muted-foreground uppercase">
                  {selected.symbol}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => setSelected(null)}
              >
                Change
              </Button>
            </div>
          )}

          {selected && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  placeholder="e.g. 0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Buy Price (USD per coin)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 45000"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  min={0}
                />
                {selected.current_price && (
                  <p className="text-xs text-muted-foreground">
                    Current price: ${selected.current_price.toLocaleString()}
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={handleAdd}>
                Add to Portfolio
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
