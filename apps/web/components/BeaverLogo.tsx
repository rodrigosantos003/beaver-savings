export function BeaverLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <ellipse cx="16" cy="18" rx="9" ry="7" className="fill-beaver-200" />
      <circle cx="11" cy="14" r="2.5" className="fill-beaver-950" />
      <circle cx="21" cy="14" r="2.5" className="fill-beaver-950" />
      <ellipse cx="16" cy="17.5" rx="3" ry="2" className="fill-beaver-400" />
      <path
        d="M8 10c-1.5-2-1-4 1-4.5 2-.5 3.5 1 4 2.5M24 10c1.5-2 1-4-1-4.5-2-.5-3.5 1-4 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-beaver-300"
      />
      <rect x="13" y="22" width="6" height="3" rx="1" className="fill-coin-400" />
    </svg>
  );
}
