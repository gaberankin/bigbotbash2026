import { useEffect, useMemo, useRef, useState } from "react";
import headJson from "../regions/head.json";
import bodyJson from "../regions/body.json";
import armsJson from "../regions/arms.json";
import legsJson from "../regions/legs.json";
import flavorJson from "../regions/flavor.json";

type Point = { x: number; y: number };

type Region = {
  id: string;
  label: string;
  type: "polygon" | "rect" | "circle";
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  active?: boolean;
};

type RegionMap = Record<string, Region[]>;
type SelectionMap = Record<string, string | null>;
type SectionMeta = {
  id: string;
  title: string;
  sortOrder: number;
  regionSelectionColor: string;
};

type SectionDefinition = {
  title: string;
  sortOrder: number;
  regionSelectionColor: string;
  selectable: Region[];
};

type SectionMetaMap = Record<string, SectionMeta>;

const IMAGE_SRC = new URL("../images/85189d6b-8615-442b-9805-e139be629f3f.jpeg", import.meta.url).href;
const SECTION_DEFINITIONS: Record<string, SectionDefinition> = {
  head: headJson as SectionDefinition,
  body: bodyJson as SectionDefinition,
  arms: armsJson as SectionDefinition,
  legs: legsJson as SectionDefinition,
  flavor: flavorJson as SectionDefinition
};

const SORTED_SECTIONS: SectionMeta[] = Object.entries(SECTION_DEFINITIONS)
  .map(([id, definition]) => ({
    id,
    title: definition.title,
    sortOrder: definition.sortOrder,
    regionSelectionColor: definition.regionSelectionColor
  }))
  .sort((a, b) => a.sortOrder - b.sortOrder);

const SECTION_META_BY_ID: SectionMetaMap = SORTED_SECTIONS.reduce<SectionMetaMap>((acc, section) => {
  acc[section.id] = section;
  return acc;
}, {});

const DEFAULT_ACTIVE_SECTION = SORTED_SECTIONS[0]?.id ?? "head";

function normalizeRegions(input: Region[]): Region[] {
  return input.map((region) => ({
    ...region,
    active: false
  }));
}

const INITIAL_REGIONS: RegionMap = {
  head: normalizeRegions((headJson as SectionDefinition).selectable),
  body: normalizeRegions((bodyJson as SectionDefinition).selectable),
  arms: normalizeRegions((armsJson as SectionDefinition).selectable),
  legs: normalizeRegions((legsJson as SectionDefinition).selectable),
  flavor: normalizeRegions((flavorJson as SectionDefinition).selectable)
};

const INITIAL_SELECTIONS: SelectionMap = {
  head: null,
  body: null,
  arms: null,
  legs: null,
  flavor: null
};

function pointInPolygon(point: Point, polygonPoints: Point[]): boolean {
  let inside = false;
  const total = polygonPoints.length;

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

function isPointInRegion(point: Point, region: Region): boolean {
  if (region.type === "rect") {
    const { x = 0, y = 0, width = 0, height = 0 } = region;
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }

  if (region.type === "circle") {
    const { x = 0, y = 0, radius = 0 } = region;
    const dx = point.x - x;
    const dy = point.y - y;
    return dx * dx + dy * dy <= radius * radius;
  }

  if (region.type === "polygon") {
    return region.points ? pointInPolygon(point, region.points) : false;
  }

  return false;
}

function drawRegionPath(ctx: CanvasRenderingContext2D, region: Region): void {
  ctx.beginPath();

  if (region.type === "rect") {
    ctx.rect(region.x ?? 0, region.y ?? 0, region.width ?? 0, region.height ?? 0);
    return;
  }

  if (region.type === "circle") {
    ctx.arc(region.x ?? 0, region.y ?? 0, region.radius ?? 0, 0, Math.PI * 2);
    return;
  }

  if (region.type === "polygon" && region.points && region.points.length > 0) {
    const [first, ...rest] = region.points;
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [activeSection, setActiveSection] = useState<string>(DEFAULT_ACTIVE_SECTION);
  const [regionsBySection, setRegionsBySection] = useState<RegionMap>(INITIAL_REGIONS);
  const [selectedBySection, setSelectedBySection] = useState<SelectionMap>(INITIAL_SELECTIONS);
  const [authoringEnabled, setAuthoringEnabled] = useState<boolean>(false);
  const [authoringPoints, setAuthoringPoints] = useState<Point[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [nextAuthoringId, setNextAuthoringId] = useState<number>(1);

  const allSectionRegions = useMemo(
    () =>
      SORTED_SECTIONS.flatMap((sectionMeta) => {
        const sectionId = sectionMeta.id;
        const regions = regionsBySection[sectionId] ?? [];
        return regions.map((region) => ({ sectionId, region }));
      }),
    [regionsBySection]
  );

  useEffect(() => {
    const image = new Image();
    image.src = IMAGE_SRC;
    image.onload = () => {
      imageRef.current = image;
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      canvas.width = image.width;
      canvas.height = image.height;
      draw();
    };
  }, []);

  useEffect(() => {
    draw();
  }, [regionsBySection, selectedBySection, activeSection, authoringEnabled, authoringPoints, hoverPoint]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() === "a") {
        setAuthoringEnabled((prev) => {
          const next = !prev;
          if (!next) {
            setAuthoringPoints([]);
            setHoverPoint(null);
          }
          return next;
        });
        return;
      }

      if (!authoringEnabled) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setAuthoringPoints((prev) => prev.slice(0, -1));
        return;
      }

      if (event.key === "Escape") {
        setAuthoringPoints([]);
        setHoverPoint(null);
        return;
      }

      if (event.key === "Enter") {
        finalizeAuthoringPolygon();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [authoringEnabled, authoringPoints, activeSection, nextAuthoringId]);

  function getCanvasPoint(event: React.MouseEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function finalizeAuthoringPolygon(): void {
    if (authoringPoints.length < 3) {
      return;
    }

    const roundedPoints = authoringPoints.map((point) => ({
      x: Math.round(point.x),
      y: Math.round(point.y)
    }));

    const sectionTitle = SECTION_META_BY_ID[activeSection]?.title ?? activeSection;

    const newRegion: Region = {
      id: `${activeSection}-generated-${nextAuthoringId}`,
      label: `${sectionTitle} Generated ${nextAuthoringId}`,
      type: "polygon",
      points: roundedPoints,
      active: false
    };

    setRegionsBySection((prev) => ({
      ...prev,
      [activeSection]: [...(prev[activeSection] ?? []), newRegion]
    }));

    setNextAuthoringId((prev) => prev + 1);
    setAuthoringPoints([]);
    setHoverPoint(null);

    const exportObject = {
      section: activeSection,
      selectable: newRegion
    };

    console.log("Generated region object:");
    console.log(JSON.stringify(exportObject, null, 2));
  }

  function drawAuthoringOverlay(ctx: CanvasRenderingContext2D): void {
    if (!authoringEnabled) {
      return;
    }

    if (authoringPoints.length > 0) {
      const firstPoint = authoringPoints[0];
      if (!firstPoint) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < authoringPoints.length; i += 1) {
        const point = authoringPoints[i];
        if (!point) {
          continue;
        }
        ctx.lineTo(point.x, point.y);
      }

      if (hoverPoint) {
        ctx.lineTo(hoverPoint.x, hoverPoint.y);
      }

      ctx.strokeStyle = "rgba(16, 84, 188, 0.95)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const point of authoringPoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 84, 188, 1)";
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(18, 18, 510, 86);
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px sans-serif";
    ctx.fillText(`Authoring for section: ${activeSection}`, 30, 43);
    ctx.font = "13px sans-serif";
    ctx.fillText("Click add point | Enter finalize | Backspace undo", 30, 64);
    ctx.fillText("Esc cancel | A toggle authoring", 30, 83);
  }

  function draw(): void {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    for (const item of allSectionRegions) {
      const { sectionId, region } = item;
      drawRegionPath(ctx, region);
      const selectedId = selectedBySection[sectionId] ?? null;
      const isSelected = region.id === selectedId;
      const selectionColor = SECTION_META_BY_ID[sectionId]?.regionSelectionColor ?? "#188350";

      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelected ? selectionColor : "rgba(0, 0, 0, 0.34)";
      ctx.stroke();

      if (isSelected) {
        const hex = selectionColor.replace("#", "");
        const isShortHex = hex.length === 3;
        const expandedHex = isShortHex
          ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
          : hex;
        const r = Number.parseInt(expandedHex.slice(0, 2), 16);
        const g = Number.parseInt(expandedHex.slice(2, 4), 16);
        const b = Number.parseInt(expandedHex.slice(4, 6), 16);
        const validRgb = Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
          ? "rgba(24, 131, 80, 0.27)"
          : `rgba(${r}, ${g}, ${b}, 0.27)`;

        ctx.fillStyle = validRgb;
        ctx.fill();
      }
    }

    drawAuthoringOverlay(ctx);
  }

  function onCanvasMove(event: React.MouseEvent<HTMLCanvasElement>): void {
    if (!authoringEnabled) {
      return;
    }
    setHoverPoint(getCanvasPoint(event));
  }

  function onCanvasClick(event: React.MouseEvent<HTMLCanvasElement>): void {
    const point = getCanvasPoint(event);

    if (authoringEnabled) {
      setAuthoringPoints((prev) => [...prev, { x: Math.round(point.x), y: Math.round(point.y) }]);
      return;
    }

    for (let i = allSectionRegions.length - 1; i >= 0; i -= 1) {
      const item = allSectionRegions[i];
      if (!item) {
        continue;
      }

      const { sectionId, region } = item;

      if (isPointInRegion(point, region)) {
        setSelectedBySection((prev) => ({
          ...prev,
          [sectionId]: region.id
        }));
        return;
      }
    }
  }

  return (
    <main className="layout">
      <section className="toolbar">
        <h1>Bot Bash Region Mapper</h1>
        <p>One selection is tracked per section. Switch sections to edit and test independently.</p>

        <div className="section-list">
          {SORTED_SECTIONS.map((sectionMeta) => {
            const selected = selectedBySection[sectionMeta.id] ?? "None";
            const regions = regionsBySection[sectionMeta.id] ?? [];
            const selectedRegion = regions.find((r) => r.id === selected);
            const diceRollValue = regions.findIndex((r) => r.id === selected) + 1;
            return (
              <div
                key={sectionMeta.id}
                className="section-list-item"
                onClick={() => setActiveSection(sectionMeta.id)}
              >
                <strong>{sectionMeta.title}</strong>
                <span>Selected: {selected}</span>
                <br />
                <span className="region-label">{selectedRegion?.label}</span> / <span className="dice-roll">Dice Roll: {diceRollValue}</span>
              </div>
            );
          })}
        </div>

        <div className="controls">
          <button type="button" onClick={() => setAuthoringEnabled((prev) => !prev)}>
            {authoringEnabled ? "Disable Authoring" : "Enable Authoring"}
          </button>
          <button type="button" onClick={finalizeAuthoringPolygon} disabled={!authoringEnabled || authoringPoints.length < 3}>
            Finalize Polygon
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthoringPoints([]);
              setHoverPoint(null);
            }}
            disabled={!authoringEnabled || authoringPoints.length === 0}
          >
            Clear Draft
          </button>
        </div>

        <p className="hint">
          Hotkeys: A toggle authoring, Enter finalize, Backspace undo point, Esc clear draft.
        </p>
      </section>

      <section className="canvas-wrap">
        <canvas
          ref={canvasRef}
          id="myCanvas"
          onMouseMove={onCanvasMove}
          onClick={onCanvasClick}
          style={{ cursor: authoringEnabled ? "crosshair" : "pointer" }}
        />
      </section>
    </main>
  );
}
