'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

type TaxStatus = 'active' | 'inactive';
type Tax = {
  id: string;
  name: string;
  code: string;
  rate: number;
  status: TaxStatus;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_DATA: Tax[] = [
  {
    id: '1',
    name: 'VAT',
    code: 'VAT_LB',
    rate: 11.0,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sales Tax',
    code: 'SALES_AE',
    rate: 5.0,
    status: 'active',
  },
  {
    id: '3',
    name: 'Old Tax',
    code: 'OLD_TAX',
    rate: 10.0,
    status: 'inactive',
  },
];

// Helper component for the modal's form fields
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
 * The Add/Edit Tax Modal/Dialog
 */
function TaxDialog({
  open,
  onOpenChange,
  tax, // Pass a tax object to edit, or null to add
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tax?: Tax | null;
}) {
  const isEditMode = Boolean(tax);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [rate, setRate] = useState(0);
  const [status, setStatus] = useState<TaxStatus>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing tax:', { id: tax?.id, name, code, rate, status });
    } else {
      console.log('Adding tax:', { name, code, rate, status });
    }
    onOpenChange(false); // Close modal on save
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this tax rate.'
              : 'Add a new tax rate to your store.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="tax-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <FormField
            id="name"
            label="Name"
          >
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., VAT"
            />
          </FormField>
          <FormField
            id="code"
            label="Code"
          >
            <Input
              id="code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., VAT_LB"
            />
          </FormField>
          <FormField
            id="rate"
            label="Tax Rate (%)"
          >
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              step="0.01"
              placeholder="e.g., 11.0"
              className="text-left"
            />
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={status}
              onValueChange={(value: TaxStatus) => setStatus(value)}
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
            form="tax-form"
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
 * The Main Taxes Page
 */
export default function TaxesPage() {
  const [taxes, setTaxes] = useState(DUMMY_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  const handleOpenAdd = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tax: Tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting tax:', id);
    // Add optimistic update or refetch logic here
    setTaxes(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Taxes & Duties</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add Tax
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map(tax => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell>{tax.code}</TableCell>
                  <TableCell>{tax.rate.toFixed(2)}%</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        tax.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {tax.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          justify="center"
                          className="h-8 w-8"
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(tax)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(tax.id)}>
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

      {/* The Modal for Add/Edit */}
      <TaxDialog
        key={editingTax?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        tax={editingTax}
      />
    </>
  );
}
