import React from "react";
import { Rect, Line, Circle, Text, Group, RegularPolygon, Arc } from "react-konva";
import type { EquipmentComponent } from "../../types";

interface AHUProps {
  component: EquipmentComponent;
}

export function AHU({ component }: AHUProps) {
  const {
    physicalWidth = 2000,
    physicalHeight = 1500,
    physicalDepth = 1000,
    equipmentType,
    model,
    coolingCapacity,
    airflow,
    selected,
  } = component;

  // Scale factor
  const scale = 0.05; // Smaller scale for equipment

  // Colors
  const fillColor = selected ? "#dbeafe" : "#f3f4f6";
  const strokeColor = selected ? "#2563eb" : "#4b5563";
  const accentColor = "#3b82f6";

  // Connection point radius
  const connPointRadius = 5;

  // Dimensions (showing plan view: width x depth)
  const scaledWidth = physicalWidth * scale;
  const scaledDepth = physicalDepth * scale;

  // Render based on equipment type
  const renderEquipmentSymbol = () => {
    switch (equipmentType) {
      case "ahu":
        return (
          <>
            {/* AHU sections */}
            {/* Filter section */}
            <Rect
              x={5}
              y={5}
              width={scaledWidth * 0.15}
              height={scaledDepth - 10}
              fill="#fef3c7"
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Text
              x={8}
              y={scaledDepth / 2}
              text="F"
              fontSize={12}
              fill={strokeColor}
            />

            {/* Coil section */}
            <Rect
              x={5 + scaledWidth * 0.15}
              y={5}
              width={scaledWidth * 0.25}
              height={scaledDepth - 10}
              fill="#dbeafe"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Coil lines */}
            {[...Array(4)].map((_, i) => (
              <Line
                key={i}
                points={[
                  5 + scaledWidth * 0.15 + 5,
                  10 + i * ((scaledDepth - 20) / 3),
                  5 + scaledWidth * 0.4 - 5,
                  10 + i * ((scaledDepth - 20) / 3),
                ]}
                stroke={accentColor}
                strokeWidth={1}
              />
            ))}

            {/* Fan section */}
            <Rect
              x={5 + scaledWidth * 0.4}
              y={5}
              width={scaledWidth * 0.35}
              height={scaledDepth - 10}
              fill="#f3f4f6"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Fan symbol */}
            <Circle
              x={5 + scaledWidth * 0.575}
              y={scaledDepth / 2}
              radius={Math.min(scaledWidth * 0.12, scaledDepth * 0.3)}
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Fan blades */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <Line
                key={angle}
                points={[
                  5 + scaledWidth * 0.575,
                  scaledDepth / 2,
                  5 + scaledWidth * 0.575 + Math.cos((angle * Math.PI) / 180) * Math.min(scaledWidth * 0.1, scaledDepth * 0.25),
                  scaledDepth / 2 + Math.sin((angle * Math.PI) / 180) * Math.min(scaledWidth * 0.1, scaledDepth * 0.25),
                ]}
                stroke={strokeColor}
                strokeWidth={1}
              />
            ))}

            {/* Outlet section */}
            <Rect
              x={5 + scaledWidth * 0.75}
              y={5}
              width={scaledWidth * 0.2}
              height={scaledDepth - 10}
              fill="#f3f4f6"
              stroke={strokeColor}
              strokeWidth={1}
            />
          </>
        );

      case "fcu":
        return (
          <>
            {/* Compact FCU symbol */}
            <Rect
              x={5}
              y={5}
              width={scaledWidth - 10}
              height={scaledDepth - 10}
              fill="#e0f2fe"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Fan symbol */}
            <Circle
              x={scaledWidth / 2}
              y={scaledDepth / 2}
              radius={Math.min(scaledWidth, scaledDepth) * 0.25}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Text
              x={scaledWidth / 2 - 10}
              y={scaledDepth / 2 - 6}
              text="FCU"
              fontSize={10}
              fill={strokeColor}
            />
          </>
        );

      case "vrf_outdoor":
        return (
          <>
            {/* Outdoor unit symbol */}
            <Rect
              x={5}
              y={5}
              width={scaledWidth - 10}
              height={scaledDepth - 10}
              fill="#dcfce7"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Fan grille pattern */}
            <Circle
              x={scaledWidth / 2}
              y={scaledDepth / 2}
              radius={Math.min(scaledWidth, scaledDepth) * 0.3}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <Circle
              x={scaledWidth / 2}
              y={scaledDepth / 2}
              radius={Math.min(scaledWidth, scaledDepth) * 0.2}
              stroke={strokeColor}
              strokeWidth={0.5}
            />
            <Circle
              x={scaledWidth / 2}
              y={scaledDepth / 2}
              radius={Math.min(scaledWidth, scaledDepth) * 0.1}
              stroke={strokeColor}
              strokeWidth={0.5}
            />
          </>
        );

      case "vrf_indoor":
        return (
          <>
            {/* Indoor ducted unit */}
            <Rect
              x={5}
              y={5}
              width={scaledWidth - 10}
              height={scaledDepth - 10}
              fill="#fef3c7"
              stroke={strokeColor}
              strokeWidth={1}
            />
            {/* Airflow direction */}
            <Line
              points={[scaledWidth / 2, 10, scaledWidth / 2, scaledDepth - 10]}
              stroke={accentColor}
              strokeWidth={1}
            />
            <RegularPolygon
              x={scaledWidth / 2}
              y={scaledDepth - 15}
              sides={3}
              radius={5}
              fill={accentColor}
              rotation={180}
            />
          </>
        );

      default:
        return (
          <Text
            x={5}
            y={scaledDepth / 2 - 6}
            text={equipmentType?.toUpperCase() || "EQUIP"}
            fontSize={12}
            fill={strokeColor}
          />
        );
    }
  };

  return (
    <Group>
      {/* Equipment outline */}
      <Rect
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledDepth}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Equipment symbol */}
      {renderEquipmentSymbol()}

      {/* Connection points */}
      {/* Supply connection */}
      <Circle
        x={scaledWidth}
        y={scaledDepth * 0.3}
        radius={connPointRadius}
        fill="#22c55e"
      />
      <Text
        x={scaledWidth + 5}
        y={scaledDepth * 0.3 - 5}
        text="S"
        fontSize={8}
        fill={strokeColor}
      />

      {/* Return connection */}
      <Circle
        x={0}
        y={scaledDepth * 0.7}
        radius={connPointRadius}
        fill="#f59e0b"
      />
      <Text
        x={-12}
        y={scaledDepth * 0.7 - 5}
        text="R"
        fontSize={8}
        fill={strokeColor}
      />

      {/* Model label */}
      <Text
        x={0}
        y={scaledDepth + 5}
        text={model || equipmentType?.toUpperCase() || "Equipment"}
        fontSize={10}
        fill="#374151"
        fontStyle="bold"
        width={scaledWidth}
        align="center"
      />

      {/* Capacity label */}
      {coolingCapacity && (
        <Text
          x={0}
          y={scaledDepth + 18}
          text={`${coolingCapacity} kW`}
          fontSize={9}
          fill={accentColor}
          width={scaledWidth}
          align="center"
        />
      )}

      {/* Airflow label */}
      {airflow && (
        <Text
          x={0}
          y={scaledDepth + 30}
          text={`${airflow} L/s`}
          fontSize={9}
          fill="#6b7280"
          width={scaledWidth}
          align="center"
        />
      )}
    </Group>
  );
}

export default AHU;
