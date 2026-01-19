"use client";

interface FixedActionBarProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    submitDisabled?: boolean;
    loading?: boolean;
}

export default function FixedActionBar({
    onCancel,
    onSubmit,
    submitLabel = 'log coffee',
    submitDisabled = false,
    loading = false
}: FixedActionBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-journal-card shadow-[0_-4px_6px_-1px_rgba(74,46,37,0.1)] z-40">
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between lowercase">
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
