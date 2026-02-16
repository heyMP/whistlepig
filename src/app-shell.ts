import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ScrollRestorationController } from './controllers/scroll-restoration-controller.js';
import { getTrialById } from './data/trials.js';
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

  /* ── Banner ── */
  app-shell .app-banner {
    background: var(--color-header-bg, #151515);
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  /* Decorative red arc */
  app-shell .app-banner::before {
    content: '';
    position: absolute;
    top: -160px;
    right: -60px;
    width: 480px;
    height: 480px;
    border: 2px solid var(--color-red, #ee0000);
    border-radius: 50%;
    opacity: 0.35;
    pointer-events: none;
  }

  /* Decorative dot grid */
  app-shell .app-banner::after {
    content: '';
    position: absolute;
    top: 10px;
    right: 20px;
    width: 160px;
    height: 120px;
    background-image: radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px);
    background-size: 12px 12px;
    pointer-events: none;
  }

  app-shell .banner-inner {
    position: relative;
    z-index: 1;
    max-width: var(--max-width, 1200px);
    margin-inline: auto;
    padding: 2rem 1.5rem 2.25rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
  }

  /* Banner breadcrumbs */
  app-shell .banner-breadcrumbs {
    margin-bottom: 0.75rem;
    font-size: 0.8125rem;
  }
  app-shell .banner-breadcrumbs a {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-weight: 400;
  }
  app-shell .banner-breadcrumbs a:hover {
    color: #fff;
    text-decoration: underline;
  }
  app-shell .banner-breadcrumbs span {
    color: rgba(255,255,255,0.4);
  }
  app-shell .banner-breadcrumbs span:last-child {
    color: rgba(255,255,255,0.85);
  }

  /* Banner text (left side) */
  app-shell .banner-text {
    flex: 1;
    min-width: 0;
  }
  app-shell .banner-heading {
    font-family: var(--font-heading, sans-serif);
    font-size: 1.75rem;
    font-weight: 500;
    font-style: italic;
    margin: 0 0 0.5rem;
    color: #fff;
    line-height: 1.3;
  }
  app-shell .banner-desc {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    max-width: 48ch;
  }

  /* Banner profile (right side) */
  app-shell .banner-profile {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  app-shell .profile-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 0.75rem 1rem;
  }
  app-shell .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6b5ce7, #8b7cf7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    color: #fff;
    flex-shrink: 0;
  }
  app-shell .profile-info {
    font-size: 0.8125rem;
    line-height: 1.5;
  }
  app-shell .profile-email {
    font-weight: 600;
    color: #fff;
  }
  app-shell .profile-account {
    color: rgba(255,255,255,0.6);
    font-size: 0.75rem;
  }
  app-shell .profile-manage {
    color: var(--color-link, #0066cc) !important;
    font-size: 0.75rem;
    font-weight: 500;
    text-decoration: none;
  }
  app-shell .profile-manage:hover {
    text-decoration: underline !important;
  }

  /* Banner action buttons */
  app-shell .banner-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  app-shell .btn-banner-outline {
    display: inline-block;
    padding: 0.375rem 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 100px;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.5);
    background: transparent;
    color: #fff;
    transition: background-color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  app-shell .btn-banner-outline:hover {
    background: rgba(255,255,255,0.1);
    border-color: #fff;
  }
  app-shell .banner-link {
    color: var(--color-link, #0066cc) !important;
    font-size: 0.8125rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  app-shell .banner-link:hover {
    text-decoration: underline !important;
  }

  /* Responsive: stack on narrow screens */
  @media (max-width: 768px) {
    app-shell .banner-inner {
      flex-direction: column;
    }
    app-shell .banner-profile {
      flex-direction: column;
      align-items: flex-start;
    }
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

  private _renderBreadcrumbs() {
    if (this._route.view === 'dashboard') {
      return html`
        <nav class="banner-breadcrumbs" aria-label="Breadcrumb">
          <a href="#">Home</a>
          <span> &gt; </span>
          <a href="#">Red Hat</a>
          <span> &gt; </span>
          <span>Trials</span>
        </nav>
      `;
    }
    const trial = getTrialById(this._route.id);
    return html`
      <nav class="banner-breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span> &gt; </span>
        <a href="/">Red Hat</a>
        <span> &gt; </span>
        <a href="/">Trials</a>
        ${trial
        ? html`<span> &gt; </span><span>${trial.product}</span>`
        : html``}
      </nav>
    `;
  }

  private _renderBannerText() {
    if (this._route.view === 'dashboard') {
      return html`
        <div class="banner-text">
          ${this._renderBreadcrumbs()}
          <h1 class="banner-heading">My Trials</h1>
          <p class="banner-desc">
Welcome to your trials page. Here, you can easily keep track of your activity, understand how to get the most out of your trials, and convert any of your work to new or existing production instances. If you have questions, check out our FAQs page. If you still require assistance, please don’t hesitate to contact our support team.
          </p>
        </div>
      `;
    }
    const trial = getTrialById(this._route.id);
    const title = trial ? trial.product : 'Trial not found';
    return html`
      <div class="banner-text">
        ${this._renderBreadcrumbs()}
        <h1 class="banner-heading" style="view-transition-name: product-name">${title}</h1>
      </div>
    `;
  }

  render() {
    return html`
      <style>${appShellStyles}</style>
      <header class="app-header">
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
      <section class="app-banner">
        <div class="banner-inner">
          ${this._renderBannerText()}
          <div class="banner-profile">
            <div class="profile-card">
              <div class="profile-avatar">MP</div>
              <div class="profile-info">
                <div class="profile-email">mpotter@redhat.com</div>
                <div class="profile-account">Account number: 5910538</div>
                <a href="#" class="profile-manage">Manage account</a>
              </div>
            </div>
            <div class="banner-actions">
              <button class="btn-banner-outline" type="button">Share feedback</button>
              <a href="#" class="banner-link">Popular resources &#8595;</a>
            </div>
          </div>
        </div>
      </section>
      <main class="app-body">
        ${this._route.view === 'dashboard'
        ? html`<trials-dashboard class="app-body-inner"></trials-dashboard>`
        : html`<trial-detail trialId="${this._route.id}" class="app-body-inner"></trial-detail>`}
      </main>
      <footer class="app-footer">
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
