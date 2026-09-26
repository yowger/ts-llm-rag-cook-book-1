"use client"

import {
    Conversation,
    ConversationContent,
    ConversationDownload,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message"
import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import {
    PromptInput,
    PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"

export default function Home() {
    const { messages, sendMessage, status } = useChat()
    const [input, setInput] = useState("")

    const noMessages = messages.length === 0

    const handleSubmit = (message: PromptInputMessage) => {
        if (message.text.trim()) {
            sendMessage({ text: message.text })
            setInput("")
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold">RAG Cookbook</h1>

                    <p className="mt-1 text-sm text-zinc-400">
                        Ask questions about recipes, ingredients, and cooking.
                    </p>
                </header>

                <Conversation>
                    <ConversationContent>
                        {noMessages ? (
                            <ConversationEmptyState
                                icon={<MessageSquare className="size-12" />}
                                title="Start a conversation"
                                description="Type a message below to begin chatting"
                            />
                        ) : (
                            messages.map((message) => {
                                console.log("🚀 ~ Home ~ message:", message)

                                return (
                                    <Message
                                        key={message.id}
                                        from={message.role}
                                    >
                                        <MessageContent>
                                            {message.parts.map((part, i) => {
                                                switch (part.type) {
                                                    case "text":
                                                        return (
                                                            <MessageResponse
                                                                key={`${message.id}-${i}`}
                                                            >
                                                                {part.text}
                                                            </MessageResponse>
                                                        )
                                                    default:
                                                        return null
                                                }
                                            })}
                                        </MessageContent>
                               
                                        <ConversationScrollButton />
                                    </Message>
                                )
                            })
                        )}
                    </ConversationContent>
                </Conversation>

              
                <PromptInput
                    onSubmit={handleSubmit}
                    className="mt-4 w-full max-w-2xl mx-auto relative"
                >
                    <PromptInputTextarea
                        value={input}
                        placeholder="Say something..."
                        onChange={(e) => setInput(e.currentTarget.value)}
                        className="pr-12"
                    />
                    <PromptInputSubmit
                        status={status === "streaming" ? "streaming" : "ready"}
                        disabled={!input.trim()}
                        className="absolute bottom-1 right-1"
                    />
                </PromptInput>
            </section>
        </main>
    )
}
