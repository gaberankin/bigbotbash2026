import type { Selectable, Point } from "./types";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function drawSelectablePath(
  ctx: CanvasRenderingContext2D,
  selectableItem: Selectable,
): void {
  ctx.beginPath();

  if (selectableItem.type === "rect") {
    ctx.rect(
      selectableItem.x ?? 0,
      selectableItem.y ?? 0,
      selectableItem.width ?? 0,
      selectableItem.height ?? 0,
    );
    return;
  }

  if (selectableItem.type === "circle") {
    ctx.arc(
      selectableItem.x ?? 0,
      selectableItem.y ?? 0,
      selectableItem.radius ?? 0,
      0,
      Math.PI * 2,
    );
    return;
  }

  if (
    selectableItem.type === "polygon" &&
    selectableItem.points &&
    selectableItem.points.length > 0
  ) {
    const [first, ...rest] = selectableItem.points;
    if (!first) {
      return;
    }
    ctx.moveTo(first.x, first.y);
    for (const p of rest) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  }
}

export function pointInPolygon(point: Point, polygonPoints: Point[]): boolean {
  let inside = false;
  const total = polygonPoints.length;

  // a polygon needs at least 3 points to be valid
  // anything less is a line, a point, or nothing.
  if (total < 3) {
    return false;
  }

  for (let i = 0, j = total - 1; i < total; j = i, i += 1) {
    const current = polygonPoints[i];
    const previous = polygonPoints[j];

    if (!current || !previous) {
      continue;
    }

    const xi = current.x;
    const yi = current.y;
    const xj = previous.x;
    const yj = previous.y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function isPointInSelectableItem(
  point: Point,
  selectableItem: Selectable,
): boolean {
  if (selectableItem.type === "rect") {
    const { x = 0, y = 0, width = 0, height = 0 } = selectableItem;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  if (selectableItem.type === "circle") {
    const { x = 0, y = 0, radius = 0 } = selectableItem;
    const dx = point.x - x;
    const dy = point.y - y;
    return dx * dx + dy * dy <= radius * radius;
  }

  if (selectableItem.type === "polygon") {
    return selectableItem.points
      ? pointInPolygon(point, selectableItem.points)
      : false;
  }

  return false;
}
