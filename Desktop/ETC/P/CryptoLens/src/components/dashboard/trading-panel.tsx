'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TradingPanel() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Trade BTC/USDT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Price" type="number" />
        <Input placeholder="Amount" type="number" />
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-green-600 hover:bg-green-700">BUY</Button>
          <Button variant="destructive">SELL</Button>
        </div>
      </CardContent>
    </Card>
  )
}
