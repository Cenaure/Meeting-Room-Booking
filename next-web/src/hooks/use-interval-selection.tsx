import {DateTime} from "luxon";
import {useEffect, useRef, useState} from "react";

export interface Draft {
  startIndex: number, // index of 30-minutes slot
  endIndex: number,
  day: DateTime
}

interface IntervalSelectionProps {
  hoursCount: number,
  hourHeight: number,
  headerHeight: number,
  hourStart: number,
  isIntervalBlocked: (index: number, day: DateTime) => boolean,
  onFinish: (start: DateTime, end: DateTime) => void,
}

const MAX_INTERVAL_LENGTH = 8;
const MIN_INTERVAL_LENGTH = 1;

// Hook for managing selection on week grid
export default function useIntervalSelection({
                                               hoursCount,
                                               hourHeight,
                                               headerHeight,
                                               hourStart,
                                               isIntervalBlocked,
                                               onFinish
                                             }: IntervalSelectionProps) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const anchorRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const totalIndexes = hoursCount * 2;
  const minIntervalHeight = hourHeight / 2;

  const createDraft = (anchor: number, cursor: number, day: DateTime) => {
    const isExpandingDown = cursor - anchor >= 0;

    let start = isExpandingDown ? anchor : cursor;
    let end = isExpandingDown ? cursor : anchor;

    // Prevents selecting more than 4 hours
    if (end - start + 1 > MAX_INTERVAL_LENGTH) {
      if (isExpandingDown) end = start + MAX_INTERVAL_LENGTH - 1;
      else start = end - MAX_INTERVAL_LENGTH + 1;
    }

    // TODO: check whether it works correct
    if (isExpandingDown) {
      if (isIntervalBlocked(end, day)) { end -= 1; }
    } else {
      if (isIntervalBlocked(start, day)) { start += 1; }
    }

    if (end < start) return null;
    return { startIndex: start, endIndex: end, day };
  }

  const getIntervalIndexFromY = (y: number) => {
    const index = Math.floor((y - headerHeight) / minIntervalHeight);
    return Math.max(0, Math.min(totalIndexes - 1, index));
  }

  const startSelection = (y: number, day: DateTime) => {
    const startIndex = getIntervalIndexFromY(y);
    if (isIntervalBlocked(startIndex, day)) return;
    anchorRef.current = startIndex;
    draggingRef.current = true;
    setDraft({startIndex, endIndex: startIndex, day});
  }

  const expandSelection = (y: number, day: DateTime) => {
    if (!draggingRef.current || anchorRef.current === null) return;
    const next = createDraft(anchorRef.current, getIntervalIndexFromY(y), day);
    if (next) setDraft(next);
  }

  const finishSelection = () => {
    draggingRef.current = false;
    anchorRef.current = null;
    if (!draft) return;

    const length = draft.endIndex - draft.startIndex + 1;
    if (length < MIN_INTERVAL_LENGTH) { setDraft(null); return; }

    const start = draft.day.startOf("day").plus({
      minutes: hourStart * 60 + draft.startIndex * 30,
    });
    const end = start.plus({ minutes: length * 30 });

    onFinish(start, end);
  }

  // Break selection
  useEffect(() => {
    if (!draft) return;

    const onUp = () => finishSelection();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        draggingRef.current = false;
        anchorRef.current = null;
        setDraft(null);
      }
    };

    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [draft]);

  return { draft, startSelection, expandSelection, clearSelection: () => setDraft(null) };
}