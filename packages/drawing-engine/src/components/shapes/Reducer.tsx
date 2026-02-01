import React from "react";
import { Shape, Line, Circle, Text, Group } from "react-konva";
import type { FittingComponent } from "../../types";

interface ReducerProps {
  component: FittingComponent;
}

export function Reducer({ component }: ReducerProps) {
  const {
    inletWidth = 600,
    inletHeight = 400,
    outletWidth = 400,
    outletHeight = 300,
    fittingType,
    selected,
  } = component;

  // Scale factor
  const scale = 0.1;

  // Colors
  const fillColor = selected ? "#dbeafe" : "#f3f4f6";
  const strokeColor = selected ? "#2563eb" : "#4b5563";

  // Connection point radius
  const connPointRadius = 4;

  // Dimensions
  const scaledInletWidth = inletWidth * scale;
  const scaledOutletWidth = outletWidth * scale;
  const length = Math.max(scaledInletWidth, scaledOutletWidth) * 1.5;

  // Transition (shape change)
  if (fittingType === "transition") {
    return (
      <Group>
        {/* Transition body */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            // Rectangular inlet
            context.moveTo(0, 0);
            context.lineTo(length, (scaledInletWidth - scaledOutletWidth) / 2);
            context.lineTo(length, (scaledInletWidth + scaledOutletWidth) / 2);
            context.lineTo(0, scaledInletWidth);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />

        {/* Centerline */}
        <Line
          points={[0, scaledInletWidth / 2, length, scaledInletWidth / 2]}
          stroke={strokeColor}
          strokeWidth={0.5}
          dash={[4, 4]}
        />

        {/* Connection points */}
        <Circle x={0} y={scaledInletWidth / 2} radius={connPointRadius} fill="#22c55e" />
        <Circle x={length} y={scaledInletWidth / 2} radius={connPointRadius} fill="#22c55e" />

        {/* Label */}
        <Text
          x={length / 2}
          y={scaledInletWidth + 5}
          text={`Transition ${inletWidth}→${outletWidth}mm`}
          fontSize={10}
          fill="#6b7280"
          align="center"
          offsetX={50}
        />
      </Group>
    );
  }

  // Concentric reducer
  return (
    <Group>
      {/* Reducer body */}
      <Shape
        sceneFunc={(context, shape) => {
          const offsetY = (scaledInletWidth - scaledOutletWidth) / 2;

          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(length, offsetY);
          context.lineTo(length, offsetY + scaledOutletWidth);
          context.lineTo(0, scaledInletWidth);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Centerline */}
      <Line
        points={[0, scaledInletWidth / 2, length, scaledInletWidth / 2]}
        stroke={strokeColor}
        strokeWidth={0.5}
        dash={[4, 4]}
      />

      {/* Connection points */}
      <Circle x={0} y={scaledInletWidth / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle x={length} y={scaledInletWidth / 2} radius={connPointRadius} fill="#22c55e" />

      {/* Label */}
      <Text
        x={length / 2}
        y={scaledInletWidth + 5}
        text={`Reducer ${inletWidth}→${outletWidth}mm`}
        fontSize={10}
        fill="#6b7280"
        align="center"
        offsetX={50}
      />
    </Group>
  );
}

export default Reducer;
