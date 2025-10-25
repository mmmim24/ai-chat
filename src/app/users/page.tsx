'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [message, setMessage] = useState('');

    // Fetch all users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data: User[] = await response.json();
            setUsers(data);
        } catch (error) {
            // setMessage(`Error: ${error.message}`);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error);
            }
            const newUser: User = await response.json();
            setUsers([...users, newUser]);
            setName('');
            setMessage('User created successfully!');
        } catch (error) {
            // setMessage(`Error: ${error.message}`);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName }),
            });
            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error);
            }
            const updatedUser: User = await response.json();
            setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
            setEditUserId(null);
            setEditName('');
            setMessage('User updated successfully!');
        } catch (error) {
            // setMessage(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error);
            }
            setUsers(users.filter((user) => user.id !== id));
            setMessage('User deleted successfully!');
        } catch (error) {
            // setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>

            {/* Create User Form */}
            <form onSubmit={handleCreate} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter user name"
                        className="border p-2 rounded flex-1"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Add User
                    </button>
                </div>
            </form>

            {/* Feedback Message */}
            {message && <p className="text-red-500 mb-4">{message}</p>}

            {/* User List */}
            <ul className="space-y-2">
                {users.map((user) => (
                    <li key={user.id} className="flex items-center gap-2 p-2 border rounded">
                        {editUserId === user.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border p-2 rounded flex-1"
                                    required
                                />
                                <button
                                    onClick={() => handleUpdate(user.id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditUserId(null)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1">{user.name} (ID: {user.id})</span>
                                <button
                                    onClick={() => {
                                        setEditUserId(user.id);
                                        setEditName(user.name);
                                    }}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}