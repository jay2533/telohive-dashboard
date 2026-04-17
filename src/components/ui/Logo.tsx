// Shared TeloHive logo mark. Pass `size` to scale; default matches the sidebar (28px).

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <path d="M8 16L16 8L24 16L16 24Z" fill="white" />
      <circle cx="16" cy="16" r="4" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}
