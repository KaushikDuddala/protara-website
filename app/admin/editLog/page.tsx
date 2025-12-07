'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface EditLog {
  id: string;
  admin_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_name: string;
  changes: Record<string, any>;
  created_at: string;
}

/** Admin edit log - filterable table of product change history. */
export default function EditLogPage() {
  const [logs, setLogs] = useState<EditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [adminFilter, setAdminFilter] = useState<string>('__all__');
  const [actionFilter, setActionFilter] = useState<string>('__all__');
  const [admins, setAdmins] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/products/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuthenticated(true);
        await fetchLogs();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('password', password);
      if (adminFilter && adminFilter !== '__all__') params.append('adminName', adminFilter);
      if (actionFilter && actionFilter !== '__all__') params.append('action', actionFilter);

      const res = await fetch(`/api/admin/editLog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setAdmins(data.admins || []);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLogs();
    }
  }, [adminFilter, actionFilter]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void p-4">
        <Card className="w-full max-w-md p-8 bg-obsidian border border-white/[0.06]">
          <h1 className="text-2xl font-bold text-white mb-6">Edit Log Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-chrome mb-2">
                Admin Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-obsidian border-white/[0.15] text-white placeholder:text-steel"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Access Logs
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void p-6 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Logs</h1>
            <p className="text-steel">Track all changes made to products</p>
          </div>
          <Button
            onClick={() => {
              setAuthenticated(false);
              setLogs([]);
            }}
            variant="secondary"
            className="bg-obsidian text-white border-white/[0.15] hover:bg-white/[0.15]"
          >
            Logout
          </Button>
        </div>

        <Card className="bg-obsidian border border-white/[0.06] p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-chrome mb-2">
                Filter by Admin
              </label>
              <Select value={adminFilter} onValueChange={setAdminFilter}>
                <SelectTrigger className="bg-obsidian border-white/[0.15] text-white">
                  <SelectValue placeholder="All admins" />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-white/[0.15]">
                  <SelectItem value="__all__" className="text-white">All admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin} value={admin} className="text-white">
                      {admin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-chrome mb-2">
                Filter by Action
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="bg-obsidian border-white/[0.15] text-white">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-white/[0.15]">
                  <SelectItem value="__all__" className="text-white">All actions</SelectItem>
                  <SelectItem value="CREATE" className="text-white">
                    Create
                  </SelectItem>
                  <SelectItem value="UPDATE" className="text-white">
                    Update
                  </SelectItem>
                  <SelectItem value="DELETE" className="text-white">
                    Delete
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setAdminFilter('__all__');
                  setActionFilter('__all__');
                }}
                variant="secondary"
                className="bg-obsidian text-white border-white/[0.15] hover:bg-white/[0.15]"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center text-chrome">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center text-chrome py-8">No logs found</div>
        ) : (
          <Card className="bg-obsidian border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-obsidian">
                    <TableHead className="text-chrome">Date & Time</TableHead>
                    <TableHead className="text-chrome">Admin</TableHead>
                    <TableHead className="text-chrome">Action</TableHead>
                    <TableHead className="text-chrome">Record</TableHead>
                    <TableHead className="text-chrome">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-white/[0.08] hover:bg-obsidian/50"
                    >
                      <TableCell className="text-chrome text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-chrome font-medium">
                        {log.admin_name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.action === 'CREATE'
                              ? 'bg-green-900 text-green-200'
                              : log.action === 'UPDATE'
                                ? 'bg-blue-900 text-blue-200'
                                : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-chrome">
                        {log.record_name || log.table_name}
                      </TableCell>
                      <TableCell>
                        {log.changes && Object.keys(log.changes).length > 0 ? (
                          <Collapsible className="w-full">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-chrome hover:text-white p-0 h-auto"
                              >
                                <ChevronDown className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <pre data-lenis-prevent className="bg-obsidian p-3 rounded text-xs text-chrome overflow-auto max-h-48">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <span className="text-steel">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
