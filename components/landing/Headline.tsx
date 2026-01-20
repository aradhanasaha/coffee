import Link from "next/link";

export default function Headline() {
    return (
        <div className="w-full px-4 pt-4 pb-2 md:pt-8 md:pb-4 text-center shrink-0">
            <div className="max-w-4xl mx-auto space-y-2 md:space-y-4">
                <h1 className="text-espresso font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight">
                    your coffee, your people, your pace
                </h1>

                <p className="text-espresso/80 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                    imnotupyet is a quiet space to log your coffee, discover cafés, and see what
                    your friends are sipping—one cup at a time
                </p>
            </div>
        </div>
    );
}
