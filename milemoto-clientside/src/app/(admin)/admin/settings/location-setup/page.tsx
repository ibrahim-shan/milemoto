'use client';

import { CitiesTab } from '@/features/admin/Settings/location-setup/CitiesTab';
import { CountriesTab } from '@/features/admin/Settings/location-setup/CountriesTab';
import { StatesTab } from '@/features/admin/Settings/location-setup/StatesTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';

export default function LocationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="countries">
          <TabsList aria-label="Location setup sections">
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
          </TabsList>

          <TabsContent value="countries">
            <CountriesTab />
          </TabsContent>
          <TabsContent value="states">
            <StatesTab />
          </TabsContent>
          <TabsContent value="cities">
            <CitiesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
