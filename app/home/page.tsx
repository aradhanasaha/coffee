import HomeClient from "./HomeClient";
import { fetchPublicCoffeeFeed } from "@/services/coffeeService";

export const revalidate = 60; // optionally cache the public feed for 60 seconds

export default async function AuthenticatedHome() {
    // Fetch generic initial logs on the server for instant render
    // It will be re-fetched/re-sorted with user-specific data client-side if needed
    const initialLogs = await fetchPublicCoffeeFeed({ limit: 20 });

    return <HomeClient initialLogs={initialLogs} />;
}
