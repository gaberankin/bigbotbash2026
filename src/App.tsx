import { useMemo, useState, useCallback } from "react";
import { BotBashCanvas } from "./components/Canvas";
import type { Region, SelectionByRegion, SelectableID } from "./types";
import armRegion from "./regions/arms.json";
import bodyRegion from "./regions/body.json";
import flavorRegion from "./regions/flavor.json";
import headRegion from "./regions/head.json";
import legsRegion from "./regions/legs.json";

const regionData = [
  armRegion,
  bodyRegion,
  headRegion,
  legsRegion,
  flavorRegion,
] as Region[];

function App() {
  const [selectedItems, setSelectedItems] = useState<SelectionByRegion>(() => {
    return regionData.reduce((acc, region) => {
      acc[region.title] = null;
      return acc;
    }, {} as SelectionByRegion);
  });
  const regions = useMemo<Region[]>(
    () => [...regionData].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );
  const onClickSelectable = useCallback(
    (regionTitle: string, selectableId: SelectableID) => {
      setSelectedItems((prev) => {
        const newSelectedItems = { ...prev };
        if (newSelectedItems[regionTitle] === selectableId) {
          newSelectedItems[regionTitle] = null;
        } else {
          newSelectedItems[regionTitle] = selectableId;
        }
        return newSelectedItems;
      });
    },
    [],
  );
  const randomizeAll = useCallback(() => {
    // create a new object to avoid mutating the state directly
    const newSelectedItems = { ...selectedItems };
    for (const region of regions) {
      if (region.selectable.length === 0) {
        continue;
      }
      let randomItemId: SelectableID | null = null;
      // loop to prevent selecting the same item twice
      do {
        const randomIndex = Math.floor(
          Math.random() * region.selectable.length,
        );
        randomItemId = region.selectable[randomIndex].id;
      } while (randomItemId === selectedItems[region.title]);
      newSelectedItems[region.title] = randomItemId;
    }
    setSelectedItems(newSelectedItems);
  }, [regions, selectedItems]);
  return (
    <main className="min-h-screen flex bg-slate-950 text-slate-100">
      <div className="w-[150px] md:w-[150px] lg:w-[20%] flex-none relative">
        <div className="sticky top-0">
          <div className="space-y-2 p-2">
            {regions.map((region) => {
              return (
                <div
                  key={region.title}
                  className="text-sm border border-slate-700 rounded-md p-2"
                >
                  <h3 className="text-sm font-bold">{region.title}</h3>
                  <div className="flex gap-1">
                    <div className="text-xs grow">
                      {selectedItems[region.title] ? (
                        <>
                          <span className="text-slate-400">Selected:</span>{" "}
                          <span className="font-bold">
                            {region.selectable.find(
                              (selectable) =>
                                selectable.id === selectedItems[region.title],
                            )?.label ?? "Unknown"}
                          </span>
                        </>
                      ) : region.selectable.length > 0 ? (
                        <span className="text-slate-400">None Selected</span>
                      ) : (
                        <span className="text-slate-400">
                          Hang tight. I ain't done this one yet.
                        </span>
                      )}
                    </div>
                    <div className="flex-none">
                      <button
                        disabled={region.selectable.length === 0}
                        className="text-xs text-slate-400 disabled:text-slate-600"
                        onClick={() => {
                          if (region.selectable.length === 0) {
                            return;
                          }
                          // note that reselecting the same item will toggle it off, so we need to
                          // make sure we don't select the same item twice.  If we do, we need to
                          // select a new item.
                          let randomItemId: SelectableID | null = null;
                          do {
                            // randomly select a new item from the region's selectable items
                            const randomIndex = Math.floor(
                              Math.random() * region.selectable.length,
                            );
                            randomItemId = region.selectable[randomIndex].id;
                          } while (
                            randomItemId === selectedItems[region.title]
                          );
                          onClickSelectable(region.title, randomItemId);
                        }}
                      >
                        Randomize
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="mt-2 text-right">
              <button
                className="text-xs text-slate-400 border border-slate-700 rounded-md p-2"
                onClick={randomizeAll}
              >
                Randomize All
              </button>
            </div>
          </div>
          <div className="app-description">
            <p>
              The big bot bash is a thing that{" "}
              <a
                href="https://www.youtube.com/c/BillMakingStuff"
                target="_blank"
                rel="noopener noreferrer"
              >
                BillMakingStuff
              </a>{" "}
              has organized for the past few years. This year, I want to do a
              thing, but because I'm a modern-day programmer who is struggling
              to be excited about programming I thought I'd try to make
              something that is (1) completely unnecessary and (2) does a thing
              related to something that I am already interested in.
            </p>
            <p>
              To the right is the robot generator that Bill originally posted on{" "}
              <a href="https://www.instagram.com/billmakingstuff/p/DUnPyzxiE3v/">
                his instagram
              </a>
              , and I'm going to add a few features to it.
            </p>
            <p>
              First off, i'm going to make it clickable by identifying the
              different selectable options on each bot "part" (I've gotten all
              but 2 sections done).
            </p>
            <p>
              Anyone have a good favicon i can use?
            </p>
          </div>
        </div>
      </div>
      <div className="grow">
        <BotBashCanvas
          regions={regions}
          selectedItems={selectedItems}
          onClickSelectable={onClickSelectable}
        />
      </div>
    </main>
  );
}

export default App;
