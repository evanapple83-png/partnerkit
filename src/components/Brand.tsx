// Brand marks. The PartnerKit tile uses a four-square motif as a nod to the
// Microsoft ecosystem, but in its own blue monochrome so it stays clearly
// distinct from Microsoft's trademarked four-color logo.

export function LogoMark({ size = 28 }: { size?: number }) {
  const s = size;
  return (
    <span
      className="inline-grid place-items-center rounded-[0.55rem] shrink-0"
      style={{
        width: s,
        height: s,
        background: "linear-gradient(145deg, #1d2738, #0d1320)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px -2px rgba(0,0,0,0.6)",
      }}
    >
      <svg
        width={s * 0.52}
        height={s * 0.52}
        viewBox="0 0 21 21"
        fill="none"
        aria-hidden
      >
        <rect x="0" y="0" width="10" height="10" rx="1.5" fill="#9cc4ff" />
        <rect x="11" y="0" width="10" height="10" rx="1.5" fill="#4c9aff" />
        <rect x="0" y="11" width="10" height="10" rx="1.5" fill="#2f7fe8" />
        <rect x="11" y="11" width="10" height="10" rx="1.5" fill="#1a5fc4" />
      </svg>
    </span>
  );
}

export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** Footer credit with a gradient EVX wordmark. */
export function BuiltByEvx() {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-muted">Built by</span>
      <span
        className="font-bold tracking-wide"
        style={{
          backgroundImage: "linear-gradient(90deg, #9cc4ff, #4c9aff, #2f7fe8)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        EVX
      </span>
    </span>
  );
}
