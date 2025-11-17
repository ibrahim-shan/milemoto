'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';

// Corrected import
import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui/Card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
// Corrected import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
// Corrected import
import { Input } from '@/ui/input'; // Corrected import
import { Label } from '@/ui/label'; // Corrected import
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group'; // Corrected import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
// Corrected import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

type ShippingMethod = 'product' | 'flat' | 'area';
type AreaStatus = 'active' | 'inactive';
type OrderArea = {
  id: string;
  country: string;
  state: string;
  city: string;
  shippingCost: number;
  status: AreaStatus;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_AREAS: OrderArea[] = [
  {
    id: '1',
    country: 'Lebanon',
    state: 'Beirut',
    city: 'Beirut',
    shippingCost: 5,
    status: 'active',
  },
  {
    id: '2',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    shippingCost: 10,
    status: 'active',
  },
];

// Reusable form field for dialogs
function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id}>{label}</Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

/**
 * A reusable card for an input field
 */
function SettingInputCard({
  title,
  label,
  id,
  placeholder,
}: {
  title: string;
  label: string;
  id: string;
  placeholder?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="text" // Use text for left alignment
          inputMode="decimal" // Get numeric keypad on mobile
          placeholder={placeholder}
          className="mt-2"
        />
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          variant="solid"
          size="sm"
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * The Dialog component for Adding/Editing an Order Area
 */
function OrderAreaDialog({
  open,
  onOpenChange,
  area,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: OrderArea | null;
}) {
  const isEditMode = Boolean(area);

  // Form State
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [status, setStatus] = useState<AreaStatus>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing area:', { id: area?.id, country, state, city, shippingCost, status });
    } else {
      console.log('Adding area:', { country, state, city, shippingCost, status });
    }
    onOpenChange(false); // Close modal
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Order Area' : 'Add Order Area'}</DialogTitle>
        </DialogHeader>
        <form
          id="area-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <FormField
            id="country"
            label="Country"
          >
            <Input
              id="country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g., Lebanon"
            />
          </FormField>
          <FormField
            id="state"
            label="State"
          >
            <Input
              id="state"
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="e.g., Beirut"
            />
          </FormField>
          <FormField
            id="city"
            label="City"
          >
            <Input
              id="city"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g., Beirut"
            />
          </FormField>
          <FormField
            id="cost"
            label="Shipping Cost"
          >
            <Input
              id="cost"
              type="text"
              inputMode="decimal"
              value={shippingCost}
              onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
              placeholder="e.g., 5.00"
            />
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={status}
              onValueChange={(value: AreaStatus) => setStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="area-form"
            variant="solid"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The Order Area table component
 */
function OrderAreaTable() {
  const [areas, setAreas] = useState(DUMMY_AREAS);

  // --- ADDED STATE FOR MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<OrderArea | null>(null);

  const handleOpenAdd = () => {
    setEditingArea(null); // Set to null for "Add New" mode
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: OrderArea) => {
    setEditingArea(area); // Set to the area object for "Edit" mode
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete area:', id);
    setAreas(prev => prev.filter(a => a.id !== id));
  };
  // --- END ADDED STATE ---

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Area</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd} // <-- This now works
            >
              Add Order Area
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Shipping Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map(area => (
                <TableRow key={area.id}>
                  <TableCell>{area.country}</TableCell>
                  <TableCell>{area.state}</TableCell>
                  <TableCell>{area.city}</TableCell>
                  <TableCell>${area.shippingCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        // Used cn utility
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        area.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {area.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Open menu"
                          justify="center"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(area)}>
                          {' '}
                          {/* <-- This now works */}
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(area.id)}>
                          {' '}
                          {/* <-- This now works */}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- ADDED THE DIALOG RENDER --- */}
      <OrderAreaDialog
        key={editingArea?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        area={editingArea}
      />
    </>
  );
}

/**
 * The Main Shipping Page
 */

function RadioItem({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem
        value={value}
        id={id}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

export default function ShippingPage() {
  const [method, setMethod] = useState<ShippingMethod>('product');

  return (
    <div className="space-y-6">
      {/* 1. Shipping Method Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={method}
            onValueChange={(value: ShippingMethod) => setMethod(value)}
            className="space-y-3"
          >
            <RadioItem
              id="product"
              value="product"
              label="Product Wise"
            />
            <RadioItem
              id="flat"
              value="flat"
              label="Flat Rate Wise"
            />
            <RadioItem
              id="area"
              value="area"
              label="Area Wise"
            />
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 2. Conditional "Flat Rate" Card */}
      {method === 'flat' && (
        <SettingInputCard
          title="Flat Rate Wise"
          label="Shipping Cost"
          id="flat-cost"
          placeholder="Enter flat shipping cost"
        />
      )}

      {/* 3. Conditional "Area Wise" Cards */}
      {method === 'area' && (
        <div className="space-y-6">
          <SettingInputCard
            title="Area Wise"
            label="Default Shipping Cost"
            id="area-default-cost"
            placeholder="Enter default cost when area is not matched"
          />
          <OrderAreaTable />
        </div>
      )}
    </div>
  );
}
