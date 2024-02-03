import Transaction from "@/containers/Transaction";

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <Transaction />;
}
