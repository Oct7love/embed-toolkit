"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VoltageDividerTab } from "./voltage-divider-tab";
import { RCFilterTab } from "./rc-filter-tab";

export function RCCalculator() {
  return (
    <Tabs defaultValue="divider" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="divider">分压电路</TabsTrigger>
        <TabsTrigger value="low-pass">RC 低通</TabsTrigger>
        <TabsTrigger value="high-pass">RC 高通</TabsTrigger>
      </TabsList>

      <TabsContent value="divider">
        <VoltageDividerTab />
      </TabsContent>
      <TabsContent value="low-pass">
        <RCFilterTab filterType="low-pass" />
      </TabsContent>
      <TabsContent value="high-pass">
        <RCFilterTab filterType="high-pass" />
      </TabsContent>
    </Tabs>
  );
}
