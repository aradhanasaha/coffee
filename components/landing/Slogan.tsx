import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Slogan() {
    return (
        <div className="w-full px-4 py-6 md:py-8 text-center shrink-0">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 md:gap-3 text-espresso font-bold text-2xl md:text-4xl lg:text-5xl hover:opacity-80 transition-opacity cursor-pointer group"
                >
                    <span>start logging</span>
                    <ArrowRight className="w-6 h-6 md:w-10 md:h-10 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Link>
            </div>
        </div>
    );
}
