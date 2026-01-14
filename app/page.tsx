import Navbar from "@/components/landing/Navbar";
import Headline from "@/components/landing/Headline";
import HeroArt from "@/components/landing/HeroArt";
import Slogan from "@/components/landing/Slogan";

export default function Home() {
    return (
        <div className="min-h-screen bg-cream">
            <Navbar />
            <Headline />
            <HeroArt />
            <Slogan />
        </div>
    );
}
