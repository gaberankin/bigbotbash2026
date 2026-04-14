export type ImageSize = { width: number; height: number };

export type Region = {
  title: string;
  sortOrder: number;
  regionSelectionColor: string;
  selectable: Selectable[];
};
export type SelectionByRegion = { [key: string]: SelectableID | null };

export type SelectableID = string;
export type Selectable = {
  id: SelectableID;
  label: string;
//   type: string;
//   points: Point[];
} & SelectableInfo;

export type Point = {
  x: number;
  y: number;
};

type SelectableInfo = {
    type: "polygon";
    points: Point[];
} | {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    x: number;
    y: number;
    radius: number;
}