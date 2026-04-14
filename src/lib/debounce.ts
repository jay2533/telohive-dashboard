/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * Each new call resets the timer.  The debounced function carries no return
 * value — it is only intended for side-effect callbacks (state updates, URL
 * writes, API calls, etc.).
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs): void => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
}
