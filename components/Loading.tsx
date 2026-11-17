type LoadingProps = {
  message?: string;
  fullScreen?: boolean;
};

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? 'min-h-screen' : 'min-h-40'
      }`}
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-secondary"
      />
      <p className="text-sm text-stone-600">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
