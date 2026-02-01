import React from "react";
import { Rect, Line, Circle, Text, Group } from "react-konva";
import type { DamperComponent } from "../../types";

interface DamperProps {
  component: DamperComponent;
}

export function Damper({ component }: DamperProps) {
  const {
    width = 400,
    height = 300,
    damperType,
    bladeType,
    fireRating,
    selected,
  } = component;

  // Scale factor
  const scale = 0.1;

  // Colors based on damper type
  const getColors = () => {
    switch (damperType) {
      case "fire":
        return {
          fill: selected ? "#fee2e2" : "#fef2f2",
          stroke: selected ? "#dc2626" : "#ef4444",
          accent: "#dc2626",
        };
      case "smoke":
        return {
          fill: selected ? "#fef3c7" : "#fffbeb",
          stroke: selected ? "#d97706" : "#f59e0b",
          accent: "#d97706",
        };
      case "backdraft":
        return {
          fill: selected ? "#e0e7ff" : "#eef2ff",
          stroke: selected ? "#4f46e5" : "#6366f1",
          accent: "#4f46e5",
        };
      default: // volume
        return {
          fill: selected ? "#dbeafe" : "#f0f9ff",
          stroke: selected ? "#2563eb" : "#3b82f6",
          accent: "#2563eb",
        };
    }
  };

  const colors = getColors();

  // Connection point radius
  const connPointRadius = 4;

  // Dimensions
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Calculate blade lines
  const bladeCount = Math.floor(scaledWidth / 12);

  return (
    <Group>
      {/* Damper frame */}
      <Rect
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2}
      />

      {/* Frame detail */}
      <Rect
        x={2}
        y={2}
        width={scaledWidth - 4}
        height={scaledHeight - 4}
        stroke={colors.stroke}
        strokeWidth={1}
      />

      {/* Damper blades */}
      {bladeType === "parallel_blade" || damperType === "volume" ? (
        // Parallel blade pattern
        [...Array(bladeCount)].map((_, i) => (
          <Line
            key={i}
            points={[
              5 + (i * (scaledWidth - 10)) / bladeCount,
              5,
              5 + (i * (scaledWidth - 10)) / bladeCount + ((scaledWidth - 10) / bladeCount) * 0.8,
              scaledHeight - 5,
            ]}
            stroke={colors.stroke}
            strokeWidth={1}
          />
        ))
      ) : bladeType === "opposed_blade" ? (
        // Opposed blade pattern
        [...Array(bladeCount)].map((_, i) => (
          <Line
            key={i}
            points={[
              5 + (i * (scaledWidth - 10)) / bladeCount,
              i % 2 === 0 ? 5 : scaledHeight - 5,
              5 + (i * (scaledWidth - 10)) / bladeCount + ((scaledWidth - 10) / bladeCount) * 0.8,
              i % 2 === 0 ? scaledHeight - 5 : 5,
            ]}
            stroke={colors.stroke}
            strokeWidth={1}
          />
        ))
      ) : (
        // Single blade (backdraft / fire damper)
        <Line
          points={[5, scaledHeight / 2, scaledWidth - 5, scaledHeight / 2]}
          stroke={colors.stroke}
          strokeWidth={2}
        />
      )}

      {/* Fire damper specific - fusible link symbol */}
      {damperType === "fire" && (
        <>
          <Circle
            x={scaledWidth - 12}
            y={12}
            radius={6}
            fill="#fecaca"
            stroke={colors.accent}
            strokeWidth={1}
          />
          <Text
            x={scaledWidth - 15}
            y={8}
            text="FL"
            fontSize={7}
            fill={colors.accent}
          />
        </>
      )}

      {/* Smoke damper specific - motor symbol */}
      {damperType === "smoke" && (
        <Rect
          x={scaledWidth - 15}
          y={5}
          width={10}
          height={12}
          fill="#fef3c7"
          stroke={colors.accent}
          strokeWidth={1}
        />
      )}

      {/* Volume damper - actuator symbol */}
      {damperType === "volume" && (
        <>
          <Rect
            x={scaledWidth / 2 - 8}
            y={-12}
            width={16}
            height={10}
            fill="#f0f9ff"
            stroke={colors.accent}
            strokeWidth={1}
          />
          <Line
            points={[scaledWidth / 2, -2, scaledWidth / 2, 5]}
            stroke={colors.accent}
            strokeWidth={1}
          />
        </>
      )}

      {/* Centerline */}
      <Line
        points={[0, scaledHeight / 2, scaledWidth, scaledHeight / 2]}
        stroke={colors.stroke}
        strokeWidth={0.5}
        dash={[3, 3]}
      />

      {/* Connection points */}
      <Circle x={0} y={scaledHeight / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle x={scaledWidth} y={scaledHeight / 2} radius={connPointRadius} fill="#22c55e" />

      {/* Type label */}
      <Text
        x={0}
        y={scaledHeight + 5}
        text={getDamperLabel(damperType, fireRating)}
        fontSize={10}
        fill={colors.accent}
        fontStyle="bold"
        width={scaledWidth}
        align="center"
      />

      {/* Size label */}
      <Text
        x={0}
        y={scaledHeight + 18}
        text={`${width}x${height}mm`}
        fontSize={9}
        fill="#6b7280"
        width={scaledWidth}
        align="center"
      />
    </Group>
  );
}

function getDamperLabel(type?: string, fireRating?: string): string {
  switch (type) {
    case "fire":
      return `FD${fireRating ? ` (${fireRating})` : ""}`;
    case "smoke":
      return "SD";
    case "backdraft":
      return "BDD";
    default:
      return "VCD";
  }
}

export default Damper;
