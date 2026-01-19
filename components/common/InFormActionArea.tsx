"use client";

interface InFormActionAreaProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    submitDisabled?: boolean;
    loading?: boolean;
}

export default function InFormActionArea({
    onCancel,
    onSubmit,
    submitLabel = 'log coffee',
    submitDisabled = false,
    loading = false
}: InFormActionAreaProps) {
    return (
        <div className="relative mt-8">
            {/* Soft gradient fade at top */}
            <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-journal-bg pointer-events-none" />

            {/* Action area */}
            <div className="bg-journal-card rounded-2xl px-6 py-5 flex items-center justify-between lowercase">
                {/* Cancel Button */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-journal-text/70 hover:text-journal-text transition-colors text-sm font-medium"
                    disabled={loading}
                >
                    cancel
                </button>

                {/* Submit Button */}
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitDisabled || loading}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${submitDisabled || loading
                            ? 'bg-journal-text/30 text-journal-card/50 cursor-not-allowed'
                            : 'bg-journal-text text-journal-card hover:opacity-90'
                        }`}
                >
                    {loading ? 'logging...' : submitLabel}
                </button>
            </div>
        </div>
    );
}
