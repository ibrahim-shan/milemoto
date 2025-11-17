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

type UnitStatus = 'active' | 'inactive';
type Unit = {
  id: string;
  name: string;
  code: string;
  status: UnitStatus;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_DATA: Unit[] = [
  {
    id: '1',
    name: 'Piece',
    code: 'pc',
    status: 'active',
  },
  {
    id: '2',
    name: 'Kilogram',
    code: 'kg',
    status: 'active',
  },
  {
    id: '3',
    name: 'Box',
    code: 'box',
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
 * The Add/Edit Unit Modal/Dialog
 */
function UnitDialog({
  open,
  onOpenChange,
  unit, // Pass a unit object to edit, or null to add
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
}) {
  const isEditMode = Boolean(unit);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<UnitStatus>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing unit:', { id: unit?.id, name, code, status });
    } else {
      console.log('Adding unit:', { name, code, status });
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
          <DialogTitle>{isEditMode ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this unit.'
              : 'Add a new product unit to your store.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="unit-form"
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
              placeholder="e.g., Piece"
            />
          </FormField>
          <FormField
            id="code"
            label="Code"
          >
            <Input
              id="code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g., pc"
            />
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={status}
              onValueChange={(value: UnitStatus) => setStatus(value)}
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
            form="unit-form"
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
 * The Main Units Page
 */
export default function UnitsPage() {
  const [units, setUnits] = useState(DUMMY_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting unit:', id);
    // Add optimistic update or refetch logic here
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Units</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.code}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        unit.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {unit.status === 'active' ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(unit)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(unit.id)}>
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
      <UnitDialog
        key={editingUnit?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        unit={editingUnit}
      />
    </>
  );
}
