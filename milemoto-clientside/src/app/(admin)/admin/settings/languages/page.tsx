'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Image as ImageIcon, MoreHorizontal, Plus } from 'lucide-react';

import { ImageDropzone } from '@/features/admin/components/ImageDropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card';
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
  flagUrl: string | null;
  status: LanguageStatus;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_DATA: Language[] = [
  {
    id: '1',
    name: 'English',
    code: 'en',
    displayMode: 'LTR',
    flagUrl: '/images/flags/us.svg', // Example path
    status: 'active',
  },
  {
    id: '2',
    name: 'العربية',
    code: 'ar',
    displayMode: 'RTL',
    flagUrl: '/images/flags/lb.svg', // Example path
    status: 'active',
  },
];

// Helper component for the modal's form fields (same as your other pages)
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
  language, // Pass a language object to edit, or null to add
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language | null;
}) {
  const isEditMode = Boolean(language);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<LanguageStatus>('active');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('LTR');
  const [flagUrl, setFlagUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log('Editing language:', {
        id: language?.id,
        name,
        code,
        status,
        displayMode,
        flagUrl,
      });
    } else {
      console.log('Adding language:', { name, code, status, displayMode, flagUrl });
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
            id="flagUrl"
            label="Flag Image"
          >
            <ImageDropzone
              value={flagUrl}
              onUpload={setFlagUrl}
              onRemove={() => setFlagUrl(null)}
              folder="flags" // Send to a 'flags' folder in Firebase
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
                    <div className="flex items-center gap-2">
                      {lang.flagUrl ? (
                        <Image
                          src={lang.flagUrl}
                          alt={lang.name}
                          width={20}
                          height={14}
                          className="rounded-sm border"
                        />
                      ) : (
                        <span className="flex h-4 w-5 items-center justify-center rounded-sm border">
                          <ImageIcon className="text-muted-foreground h-3 w-3" />
                        </span>
                      )}
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  </TableCell>
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

      {/* The Modal for Add/Edit */}

      <LanguageDialog
        key={editingLanguage?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        language={editingLanguage}
      />
    </>
  );
}
