import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import SerialPage from "./serial";

interface PageProps {
    params: Promise<{
        serialNumber: string;
    }>;
}

export default async function Page(props: PageProps) {

    const headersList = await headers();

    const config = await getCommunityFromHeaders(headersList);
    if (!config) {
        return <div>Community not found</div>;
    }

    const { serialNumber } = await props.params;

    return (
        <>
            <SerialPage config={config} serialNumber={serialNumber} />
        </>
    )
}
