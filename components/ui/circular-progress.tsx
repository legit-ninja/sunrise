export const CircularProgress = ({
  value,
  "aria-label": ariaLabel,
}: {
  value: number;
  "aria-label"?: string;
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className="relative mx-auto h-36 w-36"
      role="img"
      aria-label={ariaLabel ?? `${Math.round(clamped)} percent`}
    >
      <svg className="h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          className="stroke-muted text-muted"
          stroke="currentColor"
          strokeWidth="10"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
        />
        <circle
          className="stroke-primary text-primary"
          stroke="currentColor"
          style={{
            transition: "stroke-dashoffset 0.2s ease-out",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
          strokeWidth="10"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * clamped) / 100}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-xs font-semibold"
        >
          {Math.round(clamped)}%
        </text>
      </svg>
    </div>
  );
};
