type PagePlaceholderProps = {
  title: string;
};

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-cream/50">Content coming soon.</p>
    </div>
  );
}
