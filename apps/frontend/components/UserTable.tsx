import React from 'react';

// 1. Define the interface for the User object
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  city?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | string;
}

// this components will show only 'users' 
const UserTable = ({
  users,
  onEdit,
}: {
  users: User[];
  onEdit?: (user: User) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">First Name</th>
              <th className="px-6 py-4">Last Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              {onEdit ? <th className="px-6 py-4">Action</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{user.firstname}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{user.lastname}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.city || "-"}</td>
                <td className="px-6 py-4 capitalize">{user.phone}</td>
                <td className="px-6 py-4 capitalize">{user.role || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status || "-"}
                  </span>
                </td>
                {onEdit ? (
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;