/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * Uses useEffect + setTimeout pattern — no external library.
 */
export function debounce(fn, delay = 300) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
