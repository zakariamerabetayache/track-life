import { useRef, useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until the user stops typing.
 *
 * This prevents hammering the API on every keystroke. The debounced value
 * only updates after `delay` ms of inactivity.
 *
 * @param {*} value   The raw value to debounce (typically from an input)
 * @param {number} delay  Milliseconds to wait (default 300ms — sweet spot for search)
 * @returns {*}       The debounced value
 *
 * @example
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 300);
 *   // Use debouncedSearch in your query key, not search
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // If the value changes again before delay expires, clear the old timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
