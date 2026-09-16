import { useEffect, useState } from "react";

const STORAGE_KEY = "bscalex_seats_left";
const START_MIN = 28;
const START_MAX = 32;
const MIN_SEATS = 3;

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seats-left counter that decreases on every repeat visit (e.g. 30 → 28 → 25),
 * persisted per browser so the number never goes back up.
 */
export function useSeatsLeft() {
  const [seats, setSeats] = useState(START_MAX);

  useEffect(() => {
    let next = randomBetween(START_MIN, START_MAX);
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored) && stored > 0) {
        next = Math.max(MIN_SEATS, stored - randomBetween(2, 4));
      }
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // private mode / storage blocked — fall back to a fresh random count
    }
    setSeats(next);
  }, []);

  return seats;
}
