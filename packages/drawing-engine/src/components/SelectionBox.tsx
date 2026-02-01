import React from "react";
import { Rect } from "react-konva";
import type { SelectionBox as SelectionBoxType } from "../types";

interface SelectionBoxProps {
  box: SelectionBoxType;
}

export function SelectionBox({ box }: SelectionBoxProps) {
  const x = Math.min(box.startX, box.endX);
  const y = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3b82f6"
      strokeWidth={1}
      dash={[5, 5]}
      perfectDrawEnabled={false}
      listening={false}
    />
  );
}

export default SelectionBox;
