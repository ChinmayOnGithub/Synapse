import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { AdminUser } from '@/types';
import { toast } from 'sonner';

export const UsersTab = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ users: AdminUser[] }>(
        `/api/admin/users?page=${page}&limit=20&search=${search}`
      );
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const handleBan = async (userId: string) => {
    try {
      await api.post(`/api/admin/users/${userId}/ban`, {});
      toast.success('User banned');
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await api.post(`/api/admin/users/${userId}/unban`, {});
      toast.success('User unbanned');
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unban user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.role !== 'admin' && (
                      <>
                        {user.isBanned ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnban(user.id)}>
                            Unban
                          </Button>
                        ) : (
                          <Button size="sm" variant="destructive" onClick={() => handleBan(user.id)}>
                            Ban
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-between">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button onClick={() => setPage((p) => p + 1)} disabled={users.length < 20}>
          Next
        </Button>
      </div>
    </div>
  );
};
