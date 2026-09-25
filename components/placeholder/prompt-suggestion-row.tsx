type PromptSuggestionRowProps = {
    onSelect: (suggestion: string) => void
}

const suggestions = [
    "What can I make with chicken and potatoes?",
    "Show me a quick dinner recipe",
    "What's a good crispy potato recipe?",
    "I want something easy to cook tonight",
]

export default function PromptSuggestionRow({
    onSelect,
}: PromptSuggestionRowProps) {
    return (
        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    )
}