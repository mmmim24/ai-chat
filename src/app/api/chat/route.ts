import { NextRequest, NextResponse } from 'next/server';


const api = 'http://localhost:11434/api/generate';

interface AIResponse {
    model: string,
    created_at: string,
    response: string,
    done: boolean
}

interface AIRequest {
    model: string,
    prompt: string,
    stream?: boolean
}

const ask = '';

const gemma: AIRequest = {
    model: 'gemma3:4b',
    prompt: ask,
    stream: true
}

const deepSeek: AIRequest = {
    model: 'deepseek-r1:1.5b',
    prompt: ask,
    stream: true
}

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: true });
}

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Model and prompt are required' }, { status: 400 });
        }

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: 'deepseek-r1:1.5b', prompt, stream: true }),
        });


        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `External API error: ${errorText}` }, { status: response.status });
        }

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) throw new Error('No readable stream from external API');

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        controller.close();
                        break;
                    }

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            // if (data.thinking) {
                            //     controller.enqueue(`[THINKING]${data.thinking}`);
                            // }
                            // if (data.response) {
                            //     controller.enqueue(`[RESPONSE]${data.response}`);
                            // }
                            if (data.response) controller.enqueue(data.response);
                            if (data.done) {
                                controller.close();
                                break;
                            }
                        } catch (e) {
                            console.error('Error parsing JSON chunk:', e);
                        }
                    }
                }
            },
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}