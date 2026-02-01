import React from "react";
import { Rect, Line, Circle, Text, Group, Shape } from "react-konva";
import type { FittingComponent } from "../../types";

interface TeeProps {
  component: FittingComponent;
}

export function Tee({ component }: TeeProps) {
  const {
    width = 400,
    height = 300,
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
  const scaledMainWidth = width * scale;
  const scaledBranchWidth = (height || width * 0.75) * scale;
  const mainLength = scaledMainWidth * 2.5;
  const branchLength = scaledBranchWidth * 2;

  // Wye fitting
  if (fittingType === "wye") {
    const wyeAngle = 45;
    const angleRad = (wyeAngle * Math.PI) / 180;

    return (
      <Group>
        {/* Main duct */}
        <Rect
          x={0}
          y={0}
          width={mainLength}
          height={scaledMainWidth}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />

        {/* Branch 1 (45 degrees up) */}
        <Shape
          sceneFunc={(context, shape) => {
            const branchStartX = mainLength / 2;
            const branchStartY = 0;

            context.beginPath();
            context.moveTo(branchStartX - scaledBranchWidth / 2, branchStartY);
            context.lineTo(
              branchStartX - branchLength * Math.sin(angleRad) - scaledBranchWidth / 2 * Math.cos(angleRad),
              branchStartY - branchLength * Math.cos(angleRad) + scaledBranchWidth / 2 * Math.sin(angleRad)
            );
            context.lineTo(
              branchStartX - branchLength * Math.sin(angleRad) + scaledBranchWidth / 2 * Math.cos(angleRad),
              branchStartY - branchLength * Math.cos(angleRad) - scaledBranchWidth / 2 * Math.sin(angleRad)
            );
            context.lineTo(branchStartX + scaledBranchWidth / 2, branchStartY);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />

        {/* Connection points */}
        <Circle x={0} y={scaledMainWidth / 2} radius={connPointRadius} fill="#22c55e" />
        <Circle x={mainLength} y={scaledMainWidth / 2} radius={connPointRadius} fill="#22c55e" />
        <Circle
          x={mainLength / 2 - branchLength * Math.sin(angleRad)}
          y={-branchLength * Math.cos(angleRad)}
          radius={connPointRadius}
          fill="#22c55e"
        />

        {/* Label */}
        <Text
          x={mainLength / 2}
          y={scaledMainWidth + 5}
          text="45° Wye"
          fontSize={10}
          fill="#6b7280"
          align="center"
          offsetX={20}
        />
      </Group>
    );
  }

  // Standard Tee
  return (
    <Group>
      {/* Main duct */}
      <Rect
        x={0}
        y={0}
        width={mainLength}
        height={scaledMainWidth}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Branch duct (perpendicular) */}
      <Rect
        x={mainLength / 2 - scaledBranchWidth / 2}
        y={-branchLength}
        width={scaledBranchWidth}
        height={branchLength}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Clean up intersection */}
      <Rect
        x={mainLength / 2 - scaledBranchWidth / 2 + 2}
        y={-2}
        width={scaledBranchWidth - 4}
        height={4}
        fill={fillColor}
      />

      {/* Centerlines */}
      <Line
        points={[0, scaledMainWidth / 2, mainLength, scaledMainWidth / 2]}
        stroke={strokeColor}
        strokeWidth={0.5}
        dash={[4, 4]}
      />
      <Line
        points={[mainLength / 2, 0, mainLength / 2, -branchLength]}
        stroke={strokeColor}
        strokeWidth={0.5}
        dash={[4, 4]}
      />

      {/* Connection points */}
      <Circle x={0} y={scaledMainWidth / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle x={mainLength} y={scaledMainWidth / 2} radius={connPointRadius} fill="#22c55e" />
      <Circle x={mainLength / 2} y={-branchLength} radius={connPointRadius} fill="#22c55e" />

      {/* Label */}
      <Text
        x={mainLength / 2}
        y={scaledMainWidth + 5}
        text={`Tee ${width}x${height || width}mm`}
        fontSize={10}
        fill="#6b7280"
        align="center"
        offsetX={40}
      />
    </Group>
  );
}

export default Tee;
