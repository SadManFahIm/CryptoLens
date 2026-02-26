'use client'

import PriceChart from '@/components/charts/price-chart'
import TradingPanel from '@/components/dashboard/trading-panel'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="grid gap-6 p-6">
      <h1 className="text-3xl font-bold">Crypto Trading Terminal</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 glass">
          <CardContent className="pt-6">
            <PriceChart />
          </CardContent>
        </Card>

        <TradingPanel />
      </div>
    </div>
  )
}
