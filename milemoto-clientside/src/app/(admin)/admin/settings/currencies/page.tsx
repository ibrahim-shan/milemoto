'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

type Currency = {
  id: string;
  name: string;
  symbol: string;
  code: string;
  exchangeRate: number;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_DATA: Currency[] = [
  {
    id: '1',
    name: 'US Dollar',
    symbol: '$',
    code: 'USD',
    exchangeRate: 1.0,
  },
  {
    id: '2',
    name: 'Lebanese Pound',
    symbol: 'L£',
    code: 'LBP',
    exchangeRate: 90000.0,
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
 * The Add/Edit Currency Modal
 */
function CurrencyDialog({
  open,
  onOpenChange,
  currency, // Pass a currency object to edit, or null to add
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: Currency | null;
}) {
  const isEditMode = Boolean(currency);

  // In a real app, you'd use react-hook-form here
  // For now, simple useState
  const [name, setName] = useState(currency?.name || '');
  const [code, setCode] = useState(currency?.code || '');
  const [symbol, setSymbol] = useState(currency?.symbol || '');
  const [rate, setRate] = useState(currency?.exchangeRate || 1.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing currency:', { id: currency?.id, name, code, symbol, rate });
    } else {
      console.log('Adding currency:', { name, code, symbol, rate });
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
          <DialogTitle>{isEditMode ? 'Edit Currency' : 'Add New Currency'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this currency.'
              : 'Add a new currency to your store.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="currency-form"
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
              placeholder="e.g., US Dollar"
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
              placeholder="e.g., USD"
            />
          </FormField>
          <FormField
            id="symbol"
            label="Symbol"
          >
            <Input
              id="symbol"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              placeholder="e.g., $"
            />
          </FormField>
          <FormField
            id="rate"
            label="Exchange Rate"
          >
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              step="0.0001"
              placeholder="e.g., 1.0"
            />
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
            form="currency-form"
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
 * The Main Currencies Page
 */
export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState(DUMMY_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting currency:', id);
    // Add optimistic update or refetch logic here
    setCurrencies(prev => prev.filter(c => c.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Currencies</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add Currency
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map(currency => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{currency.code}</TableCell>
                  <TableCell>{currency.exchangeRate}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(currency)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(currency.id)}>
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
      <CurrencyDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        currency={editingCurrency}
      />
    </>
  );
}
