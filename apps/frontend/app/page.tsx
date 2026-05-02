"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UserTable, { type User } from "../components/UserTable"; 

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [creating, setCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    role: "User",
    status: "Active",
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    role: "User",
    status: "Active",
  });

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/users", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data?.message || data?.error || `Failed (HTTP ${response.status})`;
      throw new Error(message);
    }
    setUsers(Array.isArray(data) ? (data as User[]) : []);
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch {
      // ignore network errors; frontend state cleanup is enough
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully", { id: toastId });
      router.push("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ok = Boolean(token);
    setIsAuthenticated(ok);
    if (!ok) {
      router.push("/login");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        await fetchUsers();
      } catch (error: any) {
        toast.error(error?.message || "Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Show nothing while redirecting
  }

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      password: "",
      role: user.role || "User",
      status: (user.status as string) || "Active",
    });
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Creating user...");
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(createForm),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        const message =
          result?.message || result?.error || `Create failed (HTTP ${response.status})`;
        throw new Error(message);
      }
      toast.success(result.message || "User created", { id: toastId });
      setCreateForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        role: "User",
        status: "Active",
      });
      setIsCreateModalOpen(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user", { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const toastId = toast.loading("Updating user...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        const message =
          result?.message || result?.error || `Update failed (HTTP ${response.status})`;
        throw new Error(message);
      }
      toast.success(result.message || "User updated", { id: toastId });
      setEditingUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user", { id: toastId });
    }
  };

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add User
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : users.length > 0 ? (
          <UserTable users={users} onEdit={openEdit} />
        ) : (
          <p className="text-gray-600">No users found.</p>
        )}
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add User</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
                value={createForm.firstname}
                onChange={(e) => setCreateForm((p) => ({ ...p, firstname: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
                value={createForm.lastname}
                onChange={(e) => setCreateForm((p) => ({ ...p, lastname: e.target.value }))}
                required
              />
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                value={createForm.city}
                onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))}
                required
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.status}
                onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg px-5 py-2.5 font-semibold bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`rounded-lg px-5 py-2.5 font-semibold text-white transition ${
                    creating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {creating ? "Creating..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-md px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
                value={editForm.firstname}
                onChange={(e) => setEditForm((p) => ({ ...p, firstname: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
                value={editForm.lastname}
                onChange={(e) => setEditForm((p) => ({ ...p, lastname: e.target.value }))}
                required
              />
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                value={editForm.city}
                onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                required
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New password (optional)"
                value={editForm.password}
                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
              />
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg px-5 py-2.5 font-semibold bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg px-5 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
