import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Tracks scroll position per path and restores it on navigation.
 *
 * Usage:
 * ```ts
 * private _scroll = new ScrollRestorationController(this);
 *
 * // Before navigating away:
 * this._scroll.save();
 *
 * // When determining where to scroll after navigation:
 * const y = this._scroll.getScrollForPath('/some/path');
 * ```
 */
export class ScrollRestorationController implements ReactiveController {
  private _scrollMap = new Map<string, number>();
  private _scrollTimer: ReturnType<typeof setTimeout> | undefined;
  private _boundScroll = () => this._handleScroll();

  constructor(host: ReactiveControllerHost) {
    host.addController(this);
  }

  /** Call before navigating away — snapshots scrollY for the current path. */
  save(): void {
    const y = window.scrollY;
    this._scrollMap.set(location.pathname, y);
    history.replaceState({ ...history.state, scrollY: y }, '');
  }

  /** Returns the saved scrollY for the given path (0 if none). */
  getScrollForPath(path: string): number {
    return this._scrollMap.get(path) ?? 0;
  }

  hostConnected(): void {
    history.scrollRestoration = 'manual';
    window.addEventListener('scroll', this._boundScroll, { passive: true });
  }

  hostDisconnected(): void {
    window.removeEventListener('scroll', this._boundScroll);
    clearTimeout(this._scrollTimer);
  }

  private _handleScroll(): void {
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(() => this.save(), 100);
  }
}
