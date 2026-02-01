import React from "react";
import { Rect, Line, Circle, Text, Group, RegularPolygon } from "react-konva";
import type { TerminalComponent } from "../../types";

interface DiffuserProps {
  component: TerminalComponent;
}

export function Diffuser({ component }: DiffuserProps) {
  const {
    faceWidth = 600,
    faceHeight = 600,
    neckSize = 250,
    pattern = "4-way",
    airflow,
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
  const scaledFaceWidth = faceWidth * scale;
  const scaledFaceHeight = faceHeight * scale;
  const scaledNeckSize = neckSize * scale;

  // Draw different patterns
  const renderPattern = () => {
    const centerX = scaledFaceWidth / 2;
    const centerY = scaledFaceHeight / 2;
    const innerMargin = 8;

    switch (pattern) {
      case "4-way":
        // 4-way diffuser pattern (concentric squares)
        return (
          <>
            <Rect
              x={innerMargin}
              y={innerMargin}
              width={scaledFaceWidth - innerMargin * 2}
              height={scaledFaceHeight - innerMargin * 2}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Rect
              x={innerMargin * 2}
              y={innerMargin * 2}
              width={scaledFaceWidth - innerMargin * 4}
              height={scaledFaceHeight - innerMargin * 4}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Rect
              x={innerMargin * 3}
              y={innerMargin * 3}
              width={scaledFaceWidth - innerMargin * 6}
              height={scaledFaceHeight - innerMargin * 6}
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Center neck indicator */}
            <Rect
              x={centerX - scaledNeckSize / 2}
              y={centerY - scaledNeckSize / 2}
              width={scaledNeckSize}
              height={scaledNeckSize}
              fill="#e5e7eb"
              stroke={strokeColor}
              strokeWidth={1}
            />
          </>
        );

      case "2-way":
        // 2-way slot pattern
        return (
          <>
            <Line
              points={[innerMargin, innerMargin, scaledFaceWidth - innerMargin, innerMargin]}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Line
              points={[innerMargin, scaledFaceHeight - innerMargin, scaledFaceWidth - innerMargin, scaledFaceHeight - innerMargin]}
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Slots */}
            <Rect
              x={innerMargin}
              y={centerY - 6}
              width={scaledFaceWidth - innerMargin * 2}
              height={4}
              fill="#e5e7eb"
              stroke={strokeColor}
              strokeWidth={0.5}
            />
            <Rect
              x={innerMargin}
              y={centerY + 2}
              width={scaledFaceWidth - innerMargin * 2}
              height={4}
              fill="#e5e7eb"
              stroke={strokeColor}
              strokeWidth={0.5}
            />
          </>
        );

      case "1-way":
        // 1-way pattern
        return (
          <>
            <Rect
              x={innerMargin}
              y={centerY - 8}
              width={scaledFaceWidth - innerMargin * 2}
              height={16}
              fill="#e5e7eb"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Deflection vanes */}
            {[...Array(5)].map((_, i) => (
              <Line
                key={i}
                points={[
                  innerMargin + (scaledFaceWidth - innerMargin * 2) * (i / 4),
                  centerY - 8,
                  innerMargin + (scaledFaceWidth - innerMargin * 2) * (i / 4),
                  centerY + 8,
                ]}
                stroke={strokeColor}
                strokeWidth={0.5}
              />
            ))}
          </>
        );

      case "radial":
        // Round radial diffuser
        return (
          <>
            <Circle
              x={centerX}
              y={centerY}
              radius={Math.min(scaledFaceWidth, scaledFaceHeight) / 2 - innerMargin}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Circle
              x={centerX}
              y={centerY}
              radius={Math.min(scaledFaceWidth, scaledFaceHeight) / 3 - innerMargin}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Circle
              x={centerX}
              y={centerY}
              radius={scaledNeckSize / 2}
              fill="#e5e7eb"
              stroke={strokeColor}
              strokeWidth={1}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Group>
      {/* Diffuser face */}
      <Rect
        x={0}
        y={0}
        width={scaledFaceWidth}
        height={scaledFaceHeight}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Pattern */}
      {renderPattern()}

      {/* Connection point (center, for duct connection) */}
      <Circle
        x={scaledFaceWidth / 2}
        y={scaledFaceHeight / 2}
        radius={connPointRadius}
        fill="#22c55e"
      />

      {/* Airflow indicator arrows */}
      {pattern === "4-way" && (
        <>
          <Line
            points={[
              scaledFaceWidth / 2, 0,
              scaledFaceWidth / 2, -10,
            ]}
            stroke="#3b82f6"
            strokeWidth={1}
          />
          <RegularPolygon
            x={scaledFaceWidth / 2}
            y={-12}
            sides={3}
            radius={4}
            fill="#3b82f6"
            rotation={0}
          />
        </>
      )}

      {/* Label */}
      <Text
        x={0}
        y={scaledFaceHeight + 5}
        text={`${faceWidth}x${faceHeight} (Ø${neckSize})`}
        fontSize={10}
        fill="#6b7280"
        width={scaledFaceWidth}
        align="center"
      />

      {/* Airflow label */}
      {airflow && (
        <Text
          x={0}
          y={scaledFaceHeight + 18}
          text={`${airflow} L/s`}
          fontSize={9}
          fill="#3b82f6"
          width={scaledFaceWidth}
          align="center"
        />
      )}
    </Group>
  );
}

export default Diffuser;
