import Navbar from "@/components/landing/Navbar";
import Headline from "@/components/landing/Headline";
import HeroArt from "@/components/landing/HeroArt";
import Slogan from "@/components/landing/Slogan";

export default function Home() {
    return (
        <div className="h-screen bg-journal-bg flex flex-col overflow-hidden">
            <div className="flex-shrink-0">
                <Navbar />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <Headline />
                <HeroArt />
                <Slogan />
            </div>
        </div>
    );
}
