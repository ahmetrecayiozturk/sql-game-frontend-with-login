"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changing, setChanging] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<User[]>("/admin/users");
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch users");
      } else {
        setError("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user: User, newRole: "admin" | "user") => {
    setChanging(user.id);
    try {
      await api.put<User>(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Role update failed");
      } else {
        alert("Role update failed");
      }
    } finally {
      setChanging(null);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border p-2">{user.id}</td>
              <td className="border p-2 text-blue-800">{user.username}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  disabled={changing === user.id}
                  onChange={(e) => handleRoleChange(user, e.target.value as "admin" | "user")}
                  className="border rounded px-2 py-1"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}