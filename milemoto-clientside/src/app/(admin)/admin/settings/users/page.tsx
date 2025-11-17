'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';
import { toast } from 'sonner';

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

type UserStatus = 'active' | 'disabled';
type UserRole = 'user' | 'admin';
type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
};

// DUMMY DATA: Replace this with data from your API
const DUMMY_DATA: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@milemoto.com',
    phone: '+123456789',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Test Customer',
    email: 'customer@milemoto.com',
    phone: '+987654321',
    role: 'user',
    status: 'active',
  },
  {
    id: '3',
    name: 'Disabled User',
    email: 'disabled@milemoto.com',
    phone: null,
    role: 'user',
    status: 'disabled',
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
 * The Add/Edit User Modal/Dialog
 */
function UserDialog({
  open,
  onOpenChange,
  user, // Pass a user object to edit, or null to add
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}) {
  const isEditMode = Boolean(user);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for "Add New"
    if (!isEditMode) {
      if (!password || password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    if (isEditMode) {
      console.log('Editing user:', { id: user?.id, name, email, phone, role, status });
    } else {
      console.log('Adding user:', { name, email, phone, role, status, password });
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
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <FormField
            id="name"
            label="Full Name"
          >
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., John Doe"
            />
          </FormField>
          <FormField
            id="email"
            label="Email"
          >
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g., user@example.com"
            />
          </FormField>
          <FormField
            id="phone"
            label="Phone"
          >
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g., +123456789"
            />
          </FormField>
          <FormField
            id="role"
            label="Role"
          >
            <Select
              value={role}
              onValueChange={(value: UserRole) => setRole(value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={status}
              onValueChange={(value: UserStatus) => setStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Only show password fields when creating a new user */}
          {!isEditMode && (
            <>
              <FormField
                id="password"
                label="Password"
              >
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </FormField>
              <FormField
                id="confirmPassword"
                label="Confirm"
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </FormField>
            </>
          )}
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
            form="user-form"
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
 * The Main Users Page
 */
export default function UsersPage() {
  const [users, setUsers] = useState(DUMMY_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting user:', id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        user.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {user.status === 'active' ? 'Active' : 'Disabled'}
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user.id)}>
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
      <UserDialog
        key={editingUser?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={editingUser}
      />
    </>
  );
}
