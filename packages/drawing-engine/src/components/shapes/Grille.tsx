import React from "react";
import { Rect, Line, Circle, Text, Group } from "react-konva";
import type { TerminalComponent } from "../../types";

interface GrilleProps {
  component: TerminalComponent;
}

export function Grille({ component }: GrilleProps) {
  const {
    faceWidth = 600,
    faceHeight = 300,
    terminalType,
    hasFilter,
    selected,
  } = component;

  // Scale factor
  const scale = 0.1;

  // Colors
  const fillColor = selected ? "#dbeafe" : "#ffffff";
  const strokeColor = selected ? "#2563eb" : "#4b5563";

  // Connection point radius
  const connPointRadius = 4;

  // Dimensions
  const scaledWidth = faceWidth * scale;
  const scaledHeight = faceHeight * scale;

  // Calculate louver spacing
  const louverSpacing = 4;
  const louverCount = Math.floor((scaledHeight - 8) / louverSpacing);

  return (
    <Group>
      {/* Grille frame */}
      <Rect
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Inner frame */}
      <Rect
        x={3}
        y={3}
        width={scaledWidth - 6}
        height={scaledHeight - 6}
        stroke={strokeColor}
        strokeWidth={1}
      />

      {/* Louvers */}
      {[...Array(louverCount)].map((_, i) => (
        <Line
          key={i}
          points={[
            5,
            6 + i * louverSpacing,
            scaledWidth - 5,
            6 + i * louverSpacing,
          ]}
          stroke={strokeColor}
          strokeWidth={0.5}
        />
      ))}

      {/* Filter indicator */}
      {hasFilter && (
        <>
          <Line
            points={[3, 3, scaledWidth - 3, scaledHeight - 3]}
            stroke="#f59e0b"
            strokeWidth={0.5}
            dash={[2, 2]}
          />
          <Line
            points={[scaledWidth - 3, 3, 3, scaledHeight - 3]}
            stroke="#f59e0b"
            strokeWidth={0.5}
            dash={[2, 2]}
          />
        </>
      )}

      {/* Connection point */}
      <Circle
        x={scaledWidth / 2}
        y={scaledHeight / 2}
        radius={connPointRadius}
        fill="#22c55e"
      />

      {/* Type indicator */}
      {terminalType === "register" && (
        <Rect
          x={scaledWidth / 2 - 8}
          y={scaledHeight / 2 - 4}
          width={16}
          height={8}
          fill="#f3f4f6"
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}

      {/* Label */}
      <Text
        x={0}
        y={scaledHeight + 5}
        text={`${terminalType === "register" ? "Register" : "Grille"} ${faceWidth}x${faceHeight}`}
        fontSize={10}
        fill="#6b7280"
        width={scaledWidth}
        align="center"
      />
    </Group>
  );
}

export default Grille;
