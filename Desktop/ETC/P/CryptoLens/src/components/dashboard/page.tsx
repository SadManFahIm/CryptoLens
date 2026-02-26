'use client'

import PriceChart from '@/components/charts/price-chart'
import TradingPanel from '@/components/dashboard/trading-panel'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="grid gap-6 p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">Crypto Trading Terminal</h1>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Panel */}
        <Card className="xl:col-span-2 glass">
          <CardContent className="pt-6">
            <PriceChart />
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <TradingPanel />
      </div>
    </div>
  )
}
