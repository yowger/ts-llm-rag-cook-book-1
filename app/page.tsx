"use client"

import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction,
} from "@/components/ai-elements/message"
import { useChat } from "@ai-sdk/react"
import { Fragment, useState } from "react"
import { CopyIcon, MessageSquare, RefreshCcwIcon } from "lucide-react"
import {
    PromptInput,
    PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"

export default function Home() {
    const [input, setInput] = useState("")
    const { messages, sendMessage, status, regenerate } = useChat()

    const noMessages = messages.length === 0

    const handleSubmit = (message: PromptInputMessage) => {
        if (message.text.trim()) {
            sendMessage({ text: message.text })
            setInput("")
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
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
                            messages.map((message, messageIndex) => {
                                console.log("🚀 ~ Home ~ message:", message)
                                const isLastMessage =
                                    messageIndex === messages.length - 1

                                const text = message.parts
                                    .filter((part) => part.type === "text")
                                    .map((part) => part.text)
                                    .join("")

                                return (
                                    <Fragment key={message.id}>
                                        <Message from={message.role}>
                                            <MessageContent>
                                                {message.parts.map(
                                                    (part, i) => {
                                                        switch (part.type) {
                                                            case "text":
                                                                return (
                                                                    <MessageResponse
                                                                        key={`${message.id}-${i}`}
                                                                    >
                                                                        {
                                                                            part.text
                                                                        }
                                                                    </MessageResponse>
                                                                )
                                                            default:
                                                                return null
                                                        }
                                                    },
                                                )}
                                            </MessageContent>
                                        </Message>

                                        {message.role === "assistant" &&
                                            isLastMessage && (
                                                <MessageActions>
                                                    {" "}
                                                    <MessageAction
                                                        onClick={() =>
                                                            regenerate()
                                                        }
                                                        label="Retry"
                                                    >
                                                        {" "}
                                                        <RefreshCcwIcon className="size-3" />{" "}
                                                    </MessageAction>{" "}
                                                    <MessageAction
                                                        onClick={() =>
                                                            handleCopy(text)
                                                        }
                                                        label="Copy"
                                                    >
                                                        {" "}
                                                        <CopyIcon className="size-3" />{" "}
                                                    </MessageAction>{" "}
                                                </MessageActions>
                                            )}
                                    </Fragment>
                                )
                            })
                        )}
                    </ConversationContent>
                    <ConversationScrollButton />
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
