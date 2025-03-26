import { headers } from "next/headers";
import { getCommunityFromHeaders } from "@/services/config";
import Wallet from "@/containers/wallet";
import ReadOnly from "./readonly";

interface PageProps {
    params: Promise<{
        address: string;
    }>;
}

export default async function Page(props: PageProps) {

    const headersList = await headers();

    const config = await getCommunityFromHeaders(headersList);
    if (!config) {
        return <div>Community not found</div>;
    }


    const params = await props.params;

    return (
        <>
            <ReadOnly config={config} />
        </>
    )
}
