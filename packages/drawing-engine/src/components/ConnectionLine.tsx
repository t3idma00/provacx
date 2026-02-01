import React from "react";
import { Line, Circle, Group } from "react-konva";
import type { Connection } from "../types";

interface ConnectionLineProps {
  connection: Connection;
}

export function ConnectionLine({ connection }: ConnectionLineProps) {
  const { points, strokeColor, strokeWidth } = connection;

  // Draw connection points (for highlighting connection ends)
  const startPoint = { x: points[0], y: points[1] };
  const endPoint = { x: points[points.length - 2], y: points[points.length - 1] };

  return (
    <Group>
      {/* Main connection line */}
      <Line
        points={points}
        stroke={strokeColor || "#3b82f6"}
        strokeWidth={strokeWidth || 2}
        lineCap="round"
        lineJoin="round"
        perfectDrawEnabled={false}
      />

      {/* Connection start point */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={4}
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth={1}
      />

      {/* Connection end point */}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={4}
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth={1}
      />
    </Group>
  );
}

export default ConnectionLine;
