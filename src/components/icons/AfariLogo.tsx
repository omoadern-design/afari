/**
 * AFARI logo — stylised "A" with mountain peak and wave crossbar,
 * faithfully reproduced from the brand asset (white mark on dark square).
 *
 * Props
 *   size        – uniform px dimension (default 32)
 *   variant     – "dark" = white mark on black bg (default)
 *                 "light" = black mark on white bg
 *                 "mark"  = mark only, no background rect
 *   className   – forwarded to the <svg> element
 */

interface AfariLogoProps {
  size?: number;
  variant?: "dark" | "light" | "mark";
  className?: string;
}

export function AfariLogo({
  size = 32,
  variant = "dark",
  className,
}: AfariLogoProps) {
  const bg = variant === "light" ? "#ffffff" : "#0a0a0a";
  const fg = variant === "light" ? "#0a0a0a" : "#ffffff";
  const showBg = variant !== "mark";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Afari"
    >
      {/* Background */}
      {showBg && <rect width="100" height="100" rx="16" fill={bg} />}

      {/*
        Outer A shape — two angled strokes meeting at the peak.
        Fill rule evenodd with the inner triangle cutout gives the
        hollow centre of the letter.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 10 L87 90 H71 L50 38 L29 90 H13 Z
           M50 36 L65 76 H35 Z"
        fill={fg}
      />

      {/*
        Wave / travel-path element — replaces the flat crossbar.
        Starts at the left inner leg, swoops down into a valley,
        crests slightly right of centre, then fades out along
        the right leg. Mimics a mountain-range or journey arc.
      */}
      <path
        d="M32 68 Q42 52 50 60 Q58 68 68 54"
        stroke={fg}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Word-mark (logo + logotype side by side) ─────────────────────── */

interface AfariWordmarkProps {
  size?: number;          // height of the icon part
  variant?: "dark" | "light" | "mark";
  showTagline?: boolean;
  className?: string;
}

export function AfariWordmark({
  size = 36,
  variant = "dark",
  showTagline = false,
  className,
}: AfariWordmarkProps) {
  const textColor = variant === "light" ? "#ffffff" : "#0a0a0a";

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <AfariLogo size={size} variant={variant} />
      <div className="flex flex-col leading-none">
        <span
          style={{
            color: textColor,
            fontSize: size * 0.5,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          afari
        </span>
        {showTagline && (
          <span
            style={{
              color: textColor,
              fontSize: size * 0.28,
              fontWeight: 400,
              opacity: 0.55,
              letterSpacing: "0.01em",
              marginTop: 2,
            }}
          >
            Work Smart. Travel Easy.
          </span>
        )}
      </div>
    </div>
  );
}
