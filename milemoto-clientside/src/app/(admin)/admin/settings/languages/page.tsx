'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card';
import { Country, CountryDropdown } from '@/ui/country-dropdown'; // Adjust import path

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
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

type LanguageStatus = 'active' | 'inactive';
type DisplayMode = 'LTR' | 'RTL';
type Language = {
  id: string;
  name: string;
  code: string;
  displayMode: DisplayMode;
  countryCode: string | null; // Changed from flagUrl to countryCode
  status: LanguageStatus;
};

// DUMMY DATA: Updated to use country codes instead of flag URLs
const DUMMY_DATA: Language[] = [
  {
    id: '1',
    name: 'English',
    code: 'en',
    displayMode: 'LTR',
    countryCode: 'US', // Using country code instead of URL
    status: 'active',
  },
  {
    id: '2',
    name: 'Arabic',
    code: 'ar',
    displayMode: 'RTL',
    countryCode: 'SA', // Using country code instead of URL
    status: 'active',
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
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-4">
      <Label
        htmlFor={id}
        className="md:pt-1.5"
      >
        {label}
      </Label>
      <div className="col-span-1 md:col-span-3">{children}</div>
    </div>
  );
}

/**
 * The Add/Edit Language Modal/Dialog
 */
function LanguageDialog({
  open,
  onOpenChange,
  language,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language | null;
}) {
  const isEditMode = Boolean(language);

  // Form state
  const [name, setName] = useState(language?.name || '');
  const [code, setCode] = useState(language?.code || '');
  const [status, setStatus] = useState<LanguageStatus>(language?.status || 'active');
  const [displayMode, setDisplayMode] = useState<DisplayMode>(language?.displayMode || 'LTR');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing language:', {
        id: language?.id,
        name,
        code,
        status,
        displayMode,
        countryCode: selectedCountry?.alpha2,
      });
    } else {
      console.log('Adding language:', {
        name,
        code,
        status,
        displayMode,
        countryCode: selectedCountry?.alpha2,
      });
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
          <DialogTitle>{isEditMode ? 'Edit Language' : 'Add New Language'}</DialogTitle>
        </DialogHeader>
        <form
          id="language-form"
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
              placeholder="e.g., English"
              required
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
              placeholder="e.g., en"
              required
            />
          </FormField>
          <FormField
            id="displayMode"
            label="Display Mode"
          >
            <Select
              value={displayMode}
              onValueChange={(value: DisplayMode) => setDisplayMode(value)}
            >
              <SelectTrigger id="displayMode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LTR">LTR (Left-to-Right)</SelectItem>
                <SelectItem value="RTL">RTL (Right-to-Left)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="country"
            label="Country Flag"
          >
            <CountryDropdown
              showCallingCode={false}
              onChange={setSelectedCountry}
              defaultValue={language?.countryCode || ''}
              placeholder="Select country for flag"
            />
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={status}
              onValueChange={(value: LanguageStatus) => setStatus(value)}
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
            form="language-form"
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
 * The Main Languages Page
 */
export default function LanguagesPage() {
  const [languages, setLanguages] = useState(DUMMY_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  const handleOpenAdd = () => {
    setEditingLanguage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (language: Language) => {
    setEditingLanguage(language);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting language:', id);
    setLanguages(prev => prev.filter(lang => lang.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Languages</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add Language
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Display Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map(lang => (
                <TableRow key={lang.id}>
                  <TableCell>
                    {lang.countryCode ? (
                      <div className="h-5 w-5 overflow-hidden rounded-full">
                        <img
                          src={`https://flagcdn.com/${lang.countryCode.toLowerCase()}.svg`}
                          alt={lang.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{lang.name}</TableCell>
                  <TableCell>{lang.code}</TableCell>
                  <TableCell>{lang.displayMode}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        lang.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {lang.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(lang)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(lang.id)}>
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

      <LanguageDialog
        key={editingLanguage?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        language={editingLanguage}
      />
    </>
  );
}
