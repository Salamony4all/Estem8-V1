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
}

export function CostingCard({ costingFactors, setters }: CostingCardProps) {
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Costing Adjustments</CardTitle>
        <CardDescription>Adjust the percentages to calculate the final quote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {costItems.map(({ label, value, setter }) => (
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
      </CardContent>
    </Card>
  );
}
