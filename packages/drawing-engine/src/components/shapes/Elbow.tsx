import React from "react";
import { Shape, Line, Circle, Text, Group, Arc } from "react-konva";
import type { FittingComponent } from "../../types";

interface ElbowProps {
  component: FittingComponent;
}

export function Elbow({ component }: ElbowProps) {
  const {
    width = 400,
    height = 300,
    diameter,
    angle = 90,
    radiusRatio = 1,
    turningVanes,
    selected,
  } = component;

  // Scale factor
  const scale = 0.1;

  // Colors
  const fillColor = selected ? "#dbeafe" : "#f3f4f6";
  const strokeColor = selected ? "#2563eb" : "#4b5563";

  // Connection point radius
  const connPointRadius = 4;

  // Calculate elbow dimensions
  const scaledWidth = width * scale;
  const ductWidth = scaledWidth;
  const radius = ductWidth * radiusRatio;
  const angleRad = (angle * Math.PI) / 180;

  // Draw elbow using custom shape
  return (
    <Group>
      {/* Elbow body */}
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();

          // Outer arc
          context.arc(0, radius, radius + ductWidth / 2, -Math.PI / 2, -Math.PI / 2 + angleRad);

          // End cap
          const endX = Math.sin(angleRad) * (radius + ductWidth / 2);
          const endY = radius - Math.cos(angleRad) * (radius + ductWidth / 2);
          const innerEndX = Math.sin(angleRad) * (radius - ductWidth / 2);
          const innerEndY = radius - Math.cos(angleRad) * (radius - ductWidth / 2);

          context.lineTo(innerEndX, innerEndY);

          // Inner arc (reverse direction)
          context.arc(0, radius, radius - ductWidth / 2, -Math.PI / 2 + angleRad, -Math.PI / 2, true);

          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Turning vanes (if present) */}
      {turningVanes && angle === 90 && (
        <>
          <Arc
            x={0}
            y={radius}
            innerRadius={radius - ductWidth / 4}
            outerRadius={radius - ductWidth / 4}
            angle={90}
            rotation={-90}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Arc
            x={0}
            y={radius}
            innerRadius={radius}
            outerRadius={radius}
            angle={90}
            rotation={-90}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Arc
            x={0}
            y={radius}
            innerRadius={radius + ductWidth / 4}
            outerRadius={radius + ductWidth / 4}
            angle={90}
            rotation={-90}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </>
      )}

      {/* Centerline */}
      <Arc
        x={0}
        y={radius}
        innerRadius={radius}
        outerRadius={radius}
        angle={angle}
        rotation={-90}
        stroke={strokeColor}
        strokeWidth={0.5}
        dash={[4, 4]}
      />

      {/* Connection points */}
      <Circle x={0} y={ductWidth / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle
        x={Math.sin(angleRad) * radius}
        y={radius - Math.cos(angleRad) * radius}
        radius={connPointRadius}
        fill="#22c55e"
      />

      {/* Label */}
      <Text
        x={radius / 2}
        y={radius + ductWidth / 2 + 5}
        text={`${angle}° Elbow`}
        fontSize={10}
        fill="#6b7280"
      />
    </Group>
  );
}

export default Elbow;
