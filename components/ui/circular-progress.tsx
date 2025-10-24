interface CircularProgressProps {
  value: number;
  classNames?: {
    svg?: string;
    indicator?: string;
    track?: string;
    value?: string;
  };
  strokeWidth?: number;
  showValueLabel?: boolean;
  "aria-label"?: string;
}

export const CircularProgress = ({
  value,
  classNames = {},
  strokeWidth = 4,
  showValueLabel = true,
  "aria-label": ariaLabel,
}: CircularProgressProps) => {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" aria-label={ariaLabel}>
      <svg
        className={classNames.svg || "w-36 h-36"}
        viewBox="0 0 100 100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <circle
          className={classNames.track || "stroke-gray-200"}
          strokeWidth={strokeWidth}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <circle
          className={classNames.indicator || "stroke-blue-500"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.35s ease-in-out",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
        {showValueLabel && (
          <text
            x="50"
            y="50"
            textAnchor="middle"
            alignmentBaseline="middle"
            className={classNames.value || "text-3xl font-semibold fill-current"}
          >
            {Math.round(value)}%
          </text>
        )}
      </svg>
    </div>
  );
};
