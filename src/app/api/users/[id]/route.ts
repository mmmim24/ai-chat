import { NextRequest, NextResponse } from 'next/server';

// Mock database (shared for simplicity)
let users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    // Read: Return single user
    const { id } = await params;
    const userId = parseInt(id);
    const user = users.find((u) => u.id === userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    // Update: Modify user
    const { id } = await params;
    const userId = parseInt(id);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { name } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    users[userIndex] = { id: userId, name };
    return NextResponse.json(users[userIndex]);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    // Delete: Remove user
    const { id } = await params;
    const userId = parseInt(id);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const deletedUser = users.splice(userIndex, 1)[0];
    return NextResponse.json(deletedUser);
}