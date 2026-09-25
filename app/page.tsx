"use client"

import { useChat } from "@ai-sdk/react"

export default function Home() {
    const { messages, sendMessage, status } = useChat()

    const noMessages = true
    return (
        <main>
            page
            <section>
                {noMessages ? (
                    <>
                        <p>
                            Welcome to the RAG Cookbook! I&apos;m ready to help
                            you navigate our code recipes, architectural guides,
                            and implementation strategies.
                        </p>
                    </>
                ) : (
                    <></>
                )}
            </section>
        </main>
    )
}
