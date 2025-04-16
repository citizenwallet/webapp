export default function Layout({ children }: { children: React.ReactNode }) {
return (
  <div className="flex min-h-screen w-full">
    <div className="m-auto w-full max-w-xl px-4 py-8">{children}</div>
  </div>
);
}
