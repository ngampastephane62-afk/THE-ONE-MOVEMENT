interface PagePlaceholderProps {
  title: string;
}

/**
 * Shared placeholder body used by every Stage 0 page. Later stages replace
 * each page's content individually — this component should not gain
 * features beyond the plain heading + copy shown here.
 */
export default function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-3 text-neutral-600">Content coming soon.</p>
    </div>
  );
}
