import { useEffect, useState } from "react";

const STORAGE_KEY = "bscalex_seats_left";
const START_MIN = 28;
const START_MAX = 32;
const MIN_SEATS = 3;

let seatsForThisVisit: number | null = null;

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveSeats() {
  if (seatsForThisVisit !== null) return seatsForThisVisit;
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
  seatsForThisVisit = next;
  return next;
}

/**
 * Seats-left counter that decreases on each repeat visit (e.g. 30 → 28 → 25),
 * persisted per browser so the number never goes back up. All badges on one
 * page load share the same value.
 */
export function useSeatsLeft() {
  const [seats, setSeats] = useState(START_MAX);
  useEffect(() => setSeats(resolveSeats()), []);
  return seats;
}
