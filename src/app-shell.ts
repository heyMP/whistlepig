import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ScrollRestorationController } from './controllers/scroll-restoration-controller.js';
import './trials-dashboard.js';
import './trial-detail.js';

function parsePathname(pathname: string): { view: 'dashboard' } | { view: 'trial'; id: string } {
  const path = pathname || '/';
  if (path === '/') return { view: 'dashboard' };
  const trialMatch = path.match(/^\/trial\/([^/]+)$/);
  if (trialMatch) return { view: 'trial', id: trialMatch[1] };
  return { view: 'dashboard' };
}

const appShellStyles = `
  app-shell {
    display: block;
    min-height: 100vh;
    max-width: 1200px;
    margin-inline: auto;
  }
  app-shell .app-view {
    min-height: 100vh;
  }
`;

@customElement('app-shell')
export class AppShell extends LitElement {
  override createRenderRoot() {
    return this;
  }

  @state() private _route = parsePathname(
    typeof location !== 'undefined' ? location.pathname : '/'
  );

  private _scroll = new ScrollRestorationController(this);
  private _boundPopstate = () => this._handlePopstate();
  private _boundClick = (e: Event) => this._handleClick(e);

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('popstate', this._boundPopstate);
    window.addEventListener('click', this._boundClick, true);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._boundPopstate);
    window.removeEventListener('click', this._boundClick, true);
  }

  navigate(path: string): void {
    const normalized = path || '/';
    history.pushState({ path: normalized }, '', normalized);
    this._route = parsePathname(normalized);
    this.requestUpdate();
  }

  private _viewTransition(
    oldRoute: ReturnType<typeof parsePathname>,
    newRoute: ReturnType<typeof parsePathname>,
    domUpdate: () => void,
    restoreScrollY?: number
  ): void {
    const trialId =
      oldRoute.view === 'trial'
        ? oldRoute.id
        : newRoute.view === 'trial'
          ? newRoute.id
          : undefined;

    if (typeof document.startViewTransition !== 'function') {
      domUpdate();
      if (restoreScrollY !== undefined) window.scrollTo(0, restoreScrollY);
      return;
    }

    // Forward (dashboard -> detail): tag the product <td> before capturing old state
    if (trialId && oldRoute.view === 'dashboard') {
      const td = this.querySelector(
        `[data-trial-product="${trialId}"]`
      ) as HTMLElement | null;
      if (td) td.style.viewTransitionName = 'product-name';
    }

    const transition = document.startViewTransition(async () => {
      domUpdate();
      await this.updateComplete;

      // Backward (detail -> dashboard): tag the product <td> after new DOM renders
      if (trialId && newRoute.view === 'dashboard') {
        const td = this.querySelector(
          `[data-trial-product="${trialId}"]`
        ) as HTMLElement | null;
        if (td) td.style.viewTransitionName = 'product-name';
      }

      // Scroll before the browser captures the new-state snapshot so the
      // view transition animates directly to the correct scroll position.
      if (restoreScrollY !== undefined) window.scrollTo(0, restoreScrollY);
    });

    // Clean up after transition finishes
    transition.finished.then(() => {
      if (trialId) {
        const td = this.querySelector(
          `[data-trial-product="${trialId}"]`
        ) as HTMLElement | null;
        if (td) td.style.viewTransitionName = '';
      }
    });
  }

  private _handlePopstate(): void {
    const scrollY = history.state?.scrollY ?? this._scroll.getScrollForPath(location.pathname);
    const oldRoute = this._route;
    const newRoute = parsePathname(location.pathname);
    this._viewTransition(oldRoute, newRoute, () => {
      this._route = newRoute;
      this.requestUpdate();
    }, scrollY);
  }

  private _handleClick(e: Event): void {
    const target = e.target as Node;
    const anchor = target instanceof Element ? target.closest('a') : null;
    if (!anchor || anchor.getAttribute('target') === '_blank') return;
    try {
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return;
      const path = url.pathname;
      if (path !== '/' && path !== '' && !/^\/trial\/[^/]+$/.test(path)) return;
      e.preventDefault();
      const newPath = path || '/';
      this._scroll.save();
      const savedScroll = this._scroll.getScrollForPath(newPath);
      this._viewTransition(this._route, parsePathname(newPath), () => {
        this.navigate(newPath);
      }, savedScroll);
    } catch {
      // ignore invalid URLs
    }
  }

  render() {
    return html`
      <style>${appShellStyles}</style>
      <div class="app-view">
        ${this._route.view === 'dashboard'
          ? html`<trials-dashboard></trials-dashboard>`
          : html`<trial-detail trialId="${this._route.id}"></trial-detail>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
