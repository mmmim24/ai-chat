'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';

export default function Chat() {
    const [prompt, setPrompt] = React.useState('');
    const [response, setResponse] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    let responseStream = '';

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const askAI = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to get response from AI');
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No readable stream from API');

            responseStream = '';
            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                const text = new TextDecoder().decode(value);
                responseStream += text;
                setResponse(responseStream);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl flex flex-col items-center justify-center mx-auto p-4">
            <div className="my-20">
                <h1 className="text-2xl text-center font-bold mb-4">Ask any questions to this AI</h1>
            </div>
            <form className="flex flex-col items-center gap-8" onSubmit={askAI}>
                <textarea
                    value={prompt}
                    onChange={handleChange}
                    className="bg-gray-700 w-150 mx-auto p-2 rounded resize-none"
                    placeholder="Type your question here..."
                    rows={4}
                />
                <div>
                    <button
                        type="submit"
                        className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        {loading ? 'Thinking...' : 'ASK'}
                    </button>
                </div>
            </form>
            {response && (
                <div className="mt-6 p-4 w-150 bg-gray-800 rounded">
                    <h2 className="text-lg font-semibold">Answer:</h2>
                    <div className="mt-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                    </div>
                </div>
            )}
            {error && (
                <div className="mt-6 p-4 bg-red-800 rounded">
                    <p className="text-red-200">Error: {error}</p>
                </div>
            )}
        </div>
    );
}