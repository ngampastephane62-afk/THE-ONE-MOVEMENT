import { useGetHealth } from "@workspace/api-client-react";

/**
 * Loading state convention (reference pattern for future pages):
 * 1. Destructure `data`, `isLoading`, and `isError` from the generated hook.
 * 2. While `isLoading`, render a lightweight inline loading indicator —
 *    never a blank screen.
 * 3. If `isError`, render a short, user-safe message. Never surface raw
 *    error objects or server error text to the client.
 * 4. Only render real data once loaded successfully.
 */
export default function Home() {
  const { data, isLoading, isError } = useGetHealth();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Home</h1>
      <p className="mt-3 text-neutral-600">Content coming soon.</p>

      <p className="mt-8 text-xs text-neutral-400">
        {isLoading && "Checking system status…"}
        {isError && "System status unavailable."}
        {data && `System status: ${data.status} · database: ${data.database}`}
      </p>
    </div>
  );
}
