'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Currency = {
  code: string;
  rate: number;
  symbol: string;
};

interface CostingCardProps {
  costingFactors: {
    netMargin: number;
    freight: number;
    customs: number;
    installation: number;
  };
  setters: {
    setNetMargin: (value: number) => void;
    setFreight: (value: number) => void;
    setCustoms: (value: number) => void;
    setInstallation: (value: number) => void;
  };
  fromCurrency: Currency;
  toCurrency: Currency;
  setFromCurrency: (currency: Currency) => void;
  setToCurrency: (currency: Currency) => void;
  currencies: Currency[];
}

export function CostingCard({
  costingFactors,
  setters,
  fromCurrency,
  toCurrency,
  setFromCurrency,
  setToCurrency,
  currencies,
}: CostingCardProps) {
  const { netMargin, freight, customs, installation } = costingFactors;
  const { setNetMargin, setFreight, setCustoms, setInstallation } = setters;

  const costItems = [
    {
      label: 'Net Margin',
      value: netMargin,
      setter: setNetMargin,
    },
    {
      label: 'Freight',
      value: freight,
      setter: setFreight,
    },
    {
      label: 'Customs',
      value: customs,
      setter: setCustoms,
    },
    {
      label: 'Installation',
      value: installation,
      setter: setInstallation,
    },
  ];

  const handleCurrencyChange = (setter: (currency: Currency) => void) => (value: string) => {
    const selected = currencies.find((c) => c.code === value);
    if (selected) {
      setter(selected);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Costing Adjustments</CardTitle>
        <CardDescription>Adjust the percentages to calculate the final quote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {costItems.slice(0, 2).map(({ label, value, setter }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${label}-slider`}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20 h-8"
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <Slider
                  id={`${label}-slider`}
                  value={[value]}
                  onValueChange={(values) => setter(values[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {costItems.slice(2, 4).map(({ label, value, setter }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${label}-slider`}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20 h-8"
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <Slider
                  id={`${label}-slider`}
                  value={[value]}
                  onValueChange={(values) => setter(values[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-3">
            <Label htmlFor="from-currency-select">From Currency</Label>
            <Select
              value={fromCurrency.code}
              onValueChange={handleCurrencyChange(setFromCurrency)}
            >
              <SelectTrigger id="from-currency-select" className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="to-currency-select">To Currency</Label>
            <Select
              value={toCurrency.code}
              onValueChange={handleCurrencyChange(setToCurrency)}
            >
              <SelectTrigger id="to-currency-select" className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
