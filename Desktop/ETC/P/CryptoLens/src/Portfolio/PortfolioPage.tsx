"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import usePortfolioStore, { Holding } from "@/store/usePortfolioStore";
import useStore from "@/store/useStore";
import AddHoldingDialog from "./AddHoldingDialog";
import Image from "next/image";
import numPrettier from "@/lib/numPrettier";
import { toast } from "sonner";

interface LivePriceMap {
  [coinId: string]: number;
}

export default function PortfolioPage() {
  const { holdings, removeHolding } = usePortfolioStore();
  const { coins, fetchCoins, loadingCoins } = useStore((s) => ({
    coins: s.coins,
    fetchCoins: s.fetchCoins,
    loadingCoins: s.loadingCoins,
  }));

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Fetch live prices on mount
  useEffect(() => {
    fetchCoins(1, 100);
    setLastRefreshed(new Date());
  }, [fetchCoins]);

  const handleRefresh = () => {
    fetchCoins(1, 100);
    setLastRefreshed(new Date());
    toast.success("Prices refreshed");
  };

  // Build a map of coinId → current_price
  const livePrices: LivePriceMap = useMemo(() => {
    const map: LivePriceMap = {};
    coins.forEach((c: any) => {
      map[c.id] = c.current_price;
    });
    return map;
  }, [coins]);

  // Enrich holdings with live data
  const enriched = useMemo(
    () =>
      holdings.map((h) => {
        const currentPrice = livePrices[h.id] ?? null;
        const currentValue =
          currentPrice !== null ? currentPrice * h.quantity : null;
        const investedValue = h.avgBuyPrice * h.quantity;
        const pnl =
          currentValue !== null ? currentValue - investedValue : null;
        const pnlPct =
          pnl !== null ? (pnl / investedValue) * 100 : null;
        return { ...h, currentPrice, currentValue, investedValue, pnl, pnlPct };
      }),
    [holdings, livePrices]
  );

  // Portfolio summary
  const summary = useMemo(() => {
    const totalInvested = enriched.reduce((acc, h) => acc + h.investedValue, 0);
    const totalCurrent = enriched.reduce(
      (acc, h) => acc + (h.currentValue ?? h.investedValue),
      0
    );
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, totalPnl, totalPnlPct };
  }, [enriched]);

  const handleRemove = (id: string, name: string) => {
    removeHolding(id);
    toast.success(`Removed ${name} from portfolio`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-col flex-1 gap-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              My Portfolio
            </h1>
            {lastRefreshed && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingCoins}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingCoins ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <AddHoldingDialog liveCoins={coins} />
          </div>
        </div>

        {/* Summary Cards */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Invested"
              value={`$${summary.totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub="Your cost basis"
            />
            <SummaryCard
              title="Current Value"
              value={`$${summary.totalCurrent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub="Live portfolio value"
            />
            <SummaryCard
              title="Total P&L"
              value={`${summary.totalPnl >= 0 ? "+" : ""}$${summary.totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={`${summary.totalPnlPct >= 0 ? "+" : ""}${summary.totalPnlPct.toFixed(2)}% overall`}
              valueClass={
                summary.totalPnl >= 0 ? "text-green-500" : "text-red-500"
              }
            />
            <SummaryCard
              title="Holdings"
              value={`${holdings.length}`}
              sub="Unique coins tracked"
            />
          </div>
        )}

        {/* Holdings Table */}
        {holdings.length === 0 ? (
          <EmptyState />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Holdings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coin</TableHead>
                      <TableHead className="text-right">Holdings</TableHead>
                      <TableHead className="text-right">Avg Buy Price</TableHead>
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enriched.map((h) => (
                      <HoldingRow
                        key={h.id}
                        holding={h}
                        onRemove={() => handleRemove(h.id, h.name)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({
  title,
  value,
  sub,
  valueClass = "",
}: {
  title: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className={`text-xl font-bold mt-1 ${valueClass}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

function HoldingRow({
  holding,
  onRemove,
}: {
  holding: Holding & {
    currentPrice: number | null;
    currentValue: number | null;
    investedValue: number;
    pnl: number | null;
    pnlPct: number | null;
  };
  onRemove: () => void;
}) {
  const positive = (holding.pnl ?? 0) >= 0;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {holding.image ? (
            <Image
              src={holding.image.replace("/large/", "/small/")}
              alt={holding.name}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {holding.symbol.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{holding.name}</p>
            <p className="text-xs text-muted-foreground uppercase">
              {holding.symbol}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right text-sm">
        {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </TableCell>

      <TableCell className="text-right text-sm">
        ${holding.avgBuyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </TableCell>

      <TableCell className="text-right text-sm">
        {holding.currentPrice !== null
          ? `$${holding.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
          : <span className="text-muted-foreground text-xs">Loading…</span>}
      </TableCell>

      <TableCell className="text-right text-sm font-medium">
        {holding.currentValue !== null
          ? `$${holding.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "—"}
      </TableCell>

      <TableCell className="text-right">
        {holding.pnl !== null ? (
          <div className="flex flex-col items-end gap-0.5">
            <Badge
              variant="outline"
              className={`text-xs ${positive ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}`}
            >
              {positive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {positive ? "+" : ""}
              {holding.pnlPct?.toFixed(2)}%
            </Badge>
            <span
              className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}
            >
              {positive ? "+" : ""}$
              {Math.abs(holding.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-red-500"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Wallet className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold">No holdings yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start tracking your crypto portfolio by adding your first coin. Your
          data is saved locally on your device.
        </p>
        <AddHoldingDialog liveCoins={[]} />
      </CardContent>
    </Card>
  );
}
