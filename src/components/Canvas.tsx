import { useEffect, useRef, useState, useCallback } from "react";
import bigBotBashImage from "../assets/bigbotbash2026.jpg";
import type { Point, Region, SelectionByRegion, SelectableID } from "../types";
import {
  drawSelectablePath,
  isPointInSelectableItem,
  loadImage,
} from "../util";

export function BotBashCanvas({
  regions,
  selectedItems,
  onClickSelectable,
}: {
  regions: Region[];
  selectedItems: SelectionByRegion;
  onClickSelectable: (regionTitle: string, selectableId: SelectableID) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const draw = useCallback(async () => {
    const context = contextRef.current;
    const image = imageRef.current;
    if (!context || !image) {
      return;
    }
    context.clearRect(0, 0, image.width, image.height);
    context.drawImage(image, 0, 0);

    context.lineWidth = 2;
    for (const region of regions) {
      const selectedId = selectedItems[region.title] ?? null;
      const selectionColor = region.regionSelectionColor;
      for (const selectable of region.selectable) {
        const isSelected = selectable.id === selectedId;
        // get all the points down on the canvas so that strokes and fills get applied in the right places
        drawSelectablePath(context, selectable);
        // draw the stroke for the selectable
        context.strokeStyle = isSelected
          ? selectionColor
          : "rgba(0, 0, 0, 0.20)";
        context.stroke();

        if (isSelected) {
          const hex = selectionColor.replace("#", "");
          const isShortHex = hex.length === 3;

          // expand the hex to 6 characters if it's a short hex
          const expandedHex = isShortHex
            ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
            : hex;

          // in order to give us a transparent fill, we need to convert the hex into an rgb tuple so we can use the rgba function
          const r = Number.parseInt(expandedHex.slice(0, 2), 16);
          const g = Number.parseInt(expandedHex.slice(2, 4), 16);
          const b = Number.parseInt(expandedHex.slice(4, 6), 16);
          const validRgb =
            Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
              ? "rgba(24, 131, 80, 0.27)"
              : `rgba(${r}, ${g}, ${b}, 0.27)`;

          context.fillStyle = validRgb;
          context.fill();
        }
      }
    }
  }, [regions, selectedItems]);

  const getCanvasPoint = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef],
  );

  const onCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      const point = getCanvasPoint(event);
      // run through all regions's selectable items and see if the point is in any of them.
      // if it is, we'll fire the onClickSelectable callback
      for (const region of regions) {
        for (const selectable of region.selectable) {
          if (isPointInSelectableItem(point, selectable)) {
            onClickSelectable(region.title, selectable.id);
            return;
          }
        }
      }
    },
    [regions, getCanvasPoint, onClickSelectable],
  );

  useEffect(() => {
    setLoading(true);
    loadImage(bigBotBashImage)
      .then((image) => {
        imageRef.current = image;
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas 2D context");
        }
        contextRef.current = context;
        canvas.width = image.width;
        canvas.height = image.height;
        draw();
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Unknown image loading error",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    draw();
  }, [regions, selectedItems]);

  // useEffect(() => {
  //   let isMounted = true;

  //   const drawImage = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const image = await loadImage(bigBotBashImage);
  //       await image.decode();

  //       if (!isMounted || !canvasRef.current) {
  //         return;
  //       }

  //       const width = image.naturalWidth;
  //       const height = image.naturalHeight;
  //       const canvas = canvasRef.current;
  //       const context = canvas.getContext("2d");

  //       if (!context) {
  //         throw new Error("Could not get canvas 2D context");
  //       }

  //       canvas.width = width;
  //       canvas.height = height;
  //       context.clearRect(0, 0, width, height);
  //       context.drawImage(image, 0, 0);
  //       // setImageSize({ width, height })
  //     } catch (err) {
  //       if (!isMounted) {
  //         return;
  //       }
  //       setError(
  //         err instanceof Error ? err.message : "Unknown image loading error",
  //       );
  //     } finally {
  //       if (isMounted) {
  //         setLoading(false);
  //       }
  //     }
  //   };

  //   drawImage();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  return (
    <>
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-sm text-slate-300">
          Loading image...
        </div>
      )}

      {!loading && error && <p className="text-sm text-red-300">{error}</p>}

      <canvas
        ref={canvasRef}
        className={loading || error ? "invisible" : "block" + "cursor-pointer"}
        onClick={onCanvasClick}
      />
    </>
  );
}
