import { NextRequest, NextResponse } from 'next/server';

// Mock database
let users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

export async function GET(request: NextRequest) {
    // Read: Return all users
    return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
    // Create: Add a new user
    const { name } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const newUser = { id: users.length + 1, name };
    users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
}