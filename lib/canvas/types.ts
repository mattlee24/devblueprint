/**
 * Canvas element types for the proposal whiteboard (Figma-style).
 * Elements live inside frames (slides) with frame-relative coordinates.
 */

export type CanvasElementType = "text" | "rectangle" | "ellipse" | "line";

export type TextAlign = "left" | "center" | "right";

/** Base props shared by all element types */
export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface CanvasElementText extends CanvasElementBase {
  type: "text";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: TextAlign;
}

export interface CanvasElementRectangle extends CanvasElementBase {
  type: "rectangle";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface CanvasElementEllipse extends CanvasElementBase {
  type: "ellipse";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** Line: x,y = start; width,height = delta to end point */
export interface CanvasElementLine extends CanvasElementBase {
  type: "line";
  stroke?: string;
  strokeWidth?: number;
}

export type CanvasElement =
  | CanvasElementText
  | CanvasElementRectangle
  | CanvasElementEllipse
  | CanvasElementLine;

export const DEFAULT_ELEMENT_SIZES = {
  text: { width: 120, height: 32 },
  rectangle: { width: 80, height: 60 },
  ellipse: { width: 60, height: 60 },
  line: { width: 100, height: 2 },
} as const;

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_TEXT_COLOR = "var(--text-primary)";
const DEFAULT_FILL = "var(--bg-elevated)";
const DEFAULT_STROKE = "var(--border)";
const DEFAULT_STROKE_WIDTH = 1;

function nextId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDefaultElement(
  type: CanvasElementType,
  x: number,
  y: number,
  overrides?: Partial<Pick<CanvasElement, "width" | "height">>
): CanvasElement {
  const sizes = DEFAULT_ELEMENT_SIZES[type];
  const width = overrides?.width ?? sizes.width;
  const height = overrides?.height ?? sizes.height;
  const id = nextId();

  switch (type) {
    case "text":
      return {
        id,
        type: "text",
        x,
        y,
        width,
        height,
        content: "Text",
        fontSize: DEFAULT_FONT_SIZE,
        color: DEFAULT_TEXT_COLOR,
        align: "left",
      };
    case "rectangle":
      return {
        id,
        type: "rectangle",
        x,
        y,
        width,
        height,
        fill: DEFAULT_FILL,
        stroke: DEFAULT_STROKE,
        strokeWidth: DEFAULT_STROKE_WIDTH,
      };
    case "ellipse":
      return {
        id,
        type: "ellipse",
        x,
        y,
        width,
        height,
        fill: DEFAULT_FILL,
        stroke: DEFAULT_STROKE,
        strokeWidth: DEFAULT_STROKE_WIDTH,
      };
    case "line":
      return {
        id,
        type: "line",
        x,
        y,
        width,
        height,
        stroke: DEFAULT_STROKE,
        strokeWidth: DEFAULT_STROKE_WIDTH,
      };
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function isTextElement(el: CanvasElement): el is CanvasElementText {
  return el.type === "text";
}
export function isRectangleElement(el: CanvasElement): el is CanvasElementRectangle {
  return el.type === "rectangle";
}
export function isEllipseElement(el: CanvasElement): el is CanvasElementEllipse {
  return el.type === "ellipse";
}
export function isLineElement(el: CanvasElement): el is CanvasElementLine {
  return el.type === "line";
}
