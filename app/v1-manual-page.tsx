"use client"

import LoadingBubble from "@/components/placeholder/loading-bubble"
import PromptSuggestionRow from "@/components/placeholder/prompt-suggestion-row"
import { useChat } from "@ai-sdk/react"
import { useState } from "react"

export default function Home() {
    const { messages, sendMessage, status } = useChat()
    const [input, setInput] = useState("")

    const handleSubmit = (event: React.SubmitEvent) => {
        event.preventDefault()

        if (!input.trim()) {
            return
        }

        sendMessage({
            text: input,
        })

        setInput("")
    }

    const noMessages = messages.length === 0

   const handlePrompt = (text: string) => {
    sendMessage({
        text,
    })
}

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold">RAG Cookbook</h1>

                    <p className="mt-1 text-sm text-zinc-400">
                        Ask questions about recipes, ingredients, and cooking.
                    </p>
                </header>

                <div className="flex flex-1 flex-col">
                    {noMessages ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center">
                            <h2 className="text-2xl font-semibold">
                                What are you cooking?
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                                Ask me about recipes, ingredients, cooking
                                methods, or what you can make for dinner.
                            </p>

                            <br />

                            <PromptSuggestionRow onSelect={handlePrompt} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 pb-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                            message.role === "user"
                                                ? "bg-orange-500 text-white"
                                                : "bg-zinc-900 text-zinc-200"
                                        }`}
                                    >
                                        {message.parts.map((part, index) => {
                                            if (part.type === "text") {
                                                return (
                                                    <p key={index}>
                                                        {part.text}
                                                    </p>
                                                )
                                            }

                                            return null
                                        })}
                                    </div>
                                </div>
                            ))}

                            {(status === "submitted" ||
                                status === "streaming") && <LoadingBubble />}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="sticky bottom-4 mt-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl">
                        <input
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                            onChange={(event) => setInput(event.target.value)}
                            value={input}
                            placeholder="Ask me about recipes..."
                        />

                        <button
                            type="submit"
                            disabled={status === "streaming" || !input.trim()}
                            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}
