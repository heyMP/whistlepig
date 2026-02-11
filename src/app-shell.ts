import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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

  private _handlePopstate(): void {
    const path = location.pathname;
    const next = parsePathname(path);
    const update = (): void => {
      this._route = next;
      this.requestUpdate();
    };
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(async () => {
        update();
        await this.updateComplete;
        await new Promise(res => setTimeout(res, 1000));
      });
    } else {
      update();
    }
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
      const doNavigate = async (): Promise<void> => {
        this.navigate(newPath);
        await this.updateComplete;
      };
      if (typeof document.startViewTransition === 'function') {
        document.startViewTransition(async () => {
          doNavigate();
        });
      } else {
        doNavigate();
      }
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
