import React from "react";
import { Rect, Line, Text, Group, Circle } from "react-konva";
import type { DuctComponent } from "../../types";

interface DuctSectionProps {
  component: DuctComponent;
}

export function DuctSection({ component }: DuctSectionProps) {
  const {
    ductType,
    width,
    height,
    length,
    diameter,
    material,
    hasInsulation,
    insulationThickness,
    selected,
  } = component;

  // Scale factor for drawing (1 pixel = 1mm by default)
  const scale = 0.1;

  // Colors
  const fillColor = selected ? "#dbeafe" : "#f3f4f6";
  const strokeColor = selected ? "#2563eb" : "#4b5563";
  const insulationColor = "#fef3c7";

  // Connection point radius
  const connPointRadius = 4;

  if (ductType === "round") {
    // Round duct - draw as ellipse (representing circular cross-section)
    const scaledDiameter = (diameter || 200) * scale;
    const scaledLength = length * scale;

    return (
      <Group>
        {/* Insulation (if present) */}
        {hasInsulation && (
          <Rect
            x={-2}
            y={-scaledDiameter / 2 - (insulationThickness || 25) * scale}
            width={scaledLength + 4}
            height={scaledDiameter + (insulationThickness || 25) * scale * 2}
            fill={insulationColor}
            stroke="#f59e0b"
            strokeWidth={1}
            cornerRadius={scaledDiameter / 2}
          />
        )}

        {/* Duct body */}
        <Rect
          x={0}
          y={-scaledDiameter / 2}
          width={scaledLength}
          height={scaledDiameter}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
          cornerRadius={scaledDiameter / 2}
        />

        {/* Centerline */}
        <Line
          points={[0, 0, scaledLength, 0]}
          stroke={strokeColor}
          strokeWidth={0.5}
          dash={[4, 4]}
        />

        {/* Connection points */}
        <Circle x={0} y={0} radius={connPointRadius} fill="#22c55e" />
        <Circle x={scaledLength} y={0} radius={connPointRadius} fill="#22c55e" />

        {/* Label */}
        <Text
          x={scaledLength / 2}
          y={scaledDiameter / 2 + 5}
          text={`Ø${diameter}mm`}
          fontSize={10}
          fill="#6b7280"
          align="center"
          offsetX={20}
        />
      </Group>
    );
  }

  // Rectangular duct
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledLength = length * scale;

  // Determine drawing based on view (plan view by default)
  // In plan view, we see width x length
  return (
    <Group>
      {/* Insulation (if present) */}
      {hasInsulation && (
        <Rect
          x={-(insulationThickness || 25) * scale}
          y={-(insulationThickness || 25) * scale}
          width={scaledLength + (insulationThickness || 25) * scale * 2}
          height={scaledWidth + (insulationThickness || 25) * scale * 2}
          fill={insulationColor}
          stroke="#f59e0b"
          strokeWidth={1}
        />
      )}

      {/* Duct body */}
      <Rect
        x={0}
        y={0}
        width={scaledLength}
        height={scaledWidth}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Inner lines (showing it's a duct section) */}
      <Line
        points={[5, 5, scaledLength - 5, 5]}
        stroke={strokeColor}
        strokeWidth={0.5}
      />
      <Line
        points={[5, scaledWidth - 5, scaledLength - 5, scaledWidth - 5]}
        stroke={strokeColor}
        strokeWidth={0.5}
      />

      {/* Centerline */}
      <Line
        points={[0, scaledWidth / 2, scaledLength, scaledWidth / 2]}
        stroke={strokeColor}
        strokeWidth={0.5}
        dash={[4, 4]}
      />

      {/* Connection points */}
      <Circle x={0} y={scaledWidth / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle x={scaledLength} y={scaledWidth / 2} radius={connPointRadius} fill="#22c55e" />

      {/* Label */}
      <Text
        x={scaledLength / 2}
        y={scaledWidth + 5}
        text={`${width}x${height}mm`}
        fontSize={10}
        fill="#6b7280"
        align="center"
        offsetX={25}
      />
    </Group>
  );
}

export default DuctSection;
