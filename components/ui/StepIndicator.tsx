"use client";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} style={{ display: "flex", alignItems: "flex-end" }}>
            {/* Label + Circle stacked */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 120 }}>
              {/* Label above */}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? "var(--color-text-primary)"
                    : isCompleted
                    ? "rgba(0,0,0,0.45)"
                    : "var(--color-text-tertiary)",
                  textAlign: "center",
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                  maxWidth: 110,
                  transition: "color 250ms ease",
                }}
              >
                {step.label}
              </span>

              {/* Circle with number */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: isCompleted || isActive ? "#1A1A1A" : "transparent",
                  border: isCompleted || isActive ? "none" : "1.5px solid #CCCCCC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isActive
                    ? "0 4px 16px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)"
                    : isCompleted
                    ? "0 2px 8px rgba(0,0,0,0.14)"
                    : "none",
                  transition: "all 250ms ease",
                }}
              >
                {isCompleted ? (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isActive ? "#FFFFFF" : "#BBBBBB",
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
            </div>

            {/* Connector line — sits at circle midpoint (20px from bottom of column) */}
            {index < steps.length - 1 && (
              <div
                style={{
                  width: 64,
                  height: 1.5,
                  backgroundColor: isCompleted ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.1)",
                  marginBottom: 19, // aligns with center of 40px circle
                  flexShrink: 0,
                  transition: "background-color 250ms ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
