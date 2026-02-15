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
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ── Header ── */
  app-shell .app-header {
    background: var(--color-header-bg, #151515);
  }
  app-shell .app-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: var(--max-width, 1200px);
    margin-inline: auto;
    padding: 0 1.5rem;
    height: 56px;
  }
  app-shell .app-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-heading, sans-serif);
    font-size: 1.125rem;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
  }
  app-shell .app-logo:hover {
    color: #fff;
    text-decoration: none;
  }
  app-shell .app-logo .logo-hat {
    color: var(--color-red, #ee0000);
    font-size: 1.5rem;
    line-height: 1;
  }
  app-shell .app-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 0.875rem;
  }
  app-shell .app-nav a {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s;
  }
  app-shell .app-nav a:hover {
    color: #fff;
    text-decoration: none;
  }

  /* ── Body ── */
  app-shell .app-body {
    flex: 1;
    max-width: var(--max-width, 1200px);
    margin-inline: auto;
    width: 100%;
  }

  /* ── Footer ── */
  app-shell .app-footer {
    background: var(--color-footer-bg, #151515);
    margin-top: 3rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    line-height: 1.6;
  }
  app-shell .footer-columns {
    max-width: var(--max-width, 1200px);
    margin-inline: auto;
    padding: 2.5rem 1.5rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 2rem;
  }
  app-shell .footer-col-title {
    font-family: var(--font-heading, sans-serif);
    font-weight: 700;
    font-size: 0.8125rem;
    color: #fff;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  app-shell .footer-col-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  app-shell .footer-col-links a {
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    font-weight: 400;
    transition: color 0.15s;
  }
  app-shell .footer-col-links a:hover {
    color: #fff;
    text-decoration: none;
  }
  app-shell .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
  app-shell .footer-bottom-inner {
    max-width: var(--max-width, 1200px);
    margin-inline: auto;
    padding: 1rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  app-shell .footer-copy {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
  }
  app-shell .footer-legal {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }
  app-shell .footer-legal a {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    font-weight: 400;
  }
  app-shell .footer-legal a:hover {
    color: #fff;
    text-decoration: none;
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
      <header class="app-header" style="view-transition-name: app-header">
        <div class="app-header-inner">
          <a href="/" class="app-logo">
            <span class="logo-hat" aria-hidden="true">&#9650;</span>
            Red Hat
          </a>
          <nav class="app-nav">
            <a href="/">My trials</a>
            <a href="#">Products</a>
            <a href="#">Support</a>
          </nav>
        </div>
      </header>
      <main class="app-body">
        ${this._route.view === 'dashboard'
          ? html`<trials-dashboard></trials-dashboard>`
          : html`<trial-detail trialId="${this._route.id}"></trial-detail>`}
      </main>
      <footer class="app-footer" style="view-transition-name: app-footer">
        <div class="footer-columns">
          <div>
            <h4 class="footer-col-title">Platforms</h4>
            <ul class="footer-col-links">
              <li><a href="#">Red Hat Enterprise Linux</a></li>
              <li><a href="#">Red Hat OpenShift</a></li>
              <li><a href="#">Red Hat Ansible Automation</a></li>
              <li><a href="#">See all products</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-col-title">Tools</h4>
            <ul class="footer-col-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Developer resources</a></li>
              <li><a href="#">Customer support</a></li>
              <li><a href="#">Training &amp; certification</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-col-title">Try &amp; buy</h4>
            <ul class="footer-col-links">
              <li><a href="#">Hybrid Cloud Console</a></li>
              <li><a href="#">Red Hat Store</a></li>
              <li><a href="/">Product trial center</a></li>
              <li><a href="#">Contact sales</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-col-title">About</h4>
            <ul class="footer-col-links">
              <li><a href="#">Our company</a></li>
              <li><a href="#">Jobs</a></li>
              <li><a href="#">Newsroom</a></li>
              <li><a href="#">Events</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-bottom-inner">
            <p class="footer-copy">&copy; 2026 Red Hat, Inc.</p>
            <nav class="footer-legal">
              <a href="#">Privacy statement</a>
              <a href="#">Terms of use</a>
              <a href="#">Digital accessibility</a>
              <a href="#">All policies</a>
            </nav>
          </div>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
