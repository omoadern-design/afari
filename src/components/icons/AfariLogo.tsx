/**
 * AFARI logo — stylised "A" reproduced from the brand asset.
 *
 * Construction:
 *   – Two thick strokes (left leg + right leg) meeting at a sharp miter peak,
 *     rounded feet at the bottom. The hollow inner triangle is the background
 *     showing between the legs.
 *   – Wave crossbar: smooth quadratic bezier that dips DOWN (valley) then
 *     rises back up — the signature motion/travel element.
 *
 * Props
 *   size      – uniform px dimension (default 32)
 *   variant   – "dark"  = white mark on black bg (default)
 *               "light" = black mark on white bg
 *               "mark"  = mark only, no background rect
 *   className – forwarded to the <svg> element
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
      aria-label="AFARI"
    >
      {/* Background square */}
      {showBg && <rect width="100" height="100" rx="14" fill={bg} />}

      {/*
        Two legs of the A — single open path so the peak gets a clean
        miter join (sharp point) and the feet get rounded linecaps.
        Left foot → peak → right foot.
      */}
      <path
        d="M 12 91 L 50 9 L 88 91"
        stroke={fg}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="miter"
        strokeMiterlimit="20"
        fill="none"
      />

      {/*
        Wave crossbar — starts on the inner edge of the left leg,
        sweeps DOWN into a valley (concave-up), then rises toward
        the inner edge of the right leg.
        Two quadratic beziers stitched at the valley trough.
      */}
      <path
        d="M 30 62 Q 43 79 55 66 Q 65 55 73 60"
        stroke={fg}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Word-mark (logo + logotype side by side) ─────────────────────── */

interface AfariWordmarkProps {
  size?: number;
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
          AFARI
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
