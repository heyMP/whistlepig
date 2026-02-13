import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getTrialById } from './data/trials.js';
import type { ActiveTrial, ExpiredTrial } from './data/trials.js';

function isActiveTrial(
  trial: ActiveTrial | ExpiredTrial
): trial is ActiveTrial {
  return 'daysLeft' in trial && 'totalDays' in trial;
}

const trialDetailStyles = `
  trial-detail {
    display: block;
    max-width: var(--max-width, 1200px);
    margin: 0 auto;
    padding: var(--spacing, 1rem) 1.5rem 2rem;
  }
  trial-detail .breadcrumbs {
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
  }
  trial-detail .breadcrumbs a {
    color: var(--color-link, #0066cc);
  }
  trial-detail .breadcrumbs span:last-child {
    color: var(--color-text, #151515);
  }
  trial-detail .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 1.5rem;
  }
  trial-detail .detail-block {
    margin-bottom: 1.5rem;
  }
  trial-detail .detail-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted, #4a4a4a);
    margin: 0 0 0.25rem;
  }
  trial-detail .detail-value {
    font-size: 1rem;
    color: var(--color-text, #151515);
  }
  trial-detail .progress-track {
    height: 8px;
    background: var(--color-progress-track, #e8e8e8);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.25rem;
    max-width: 200px;
  }
  trial-detail .progress-fill {
    height: 100%;
    background: var(--color-primary-bg, #0066cc);
    border-radius: 4px;
    transition: width 0.2s ease;
  }
  trial-detail .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
    align-items: center;
  }
  trial-detail .actions a {
    margin-right: 0;
  }
  trial-detail .btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    border-radius: var(--radius, 4px);
    cursor: pointer;
    text-decoration: none;
    border: none;
    transition: background-color 0.2s, color 0.2s;
  }
  trial-detail .btn-primary {
    background: var(--color-primary-bg, #0066cc);
    color: white;
  }
  trial-detail .btn-primary:hover {
    background: var(--color-primary-bg-hover, #004080);
    color: white;
  }
  trial-detail .not-found {
    color: var(--color-text-muted, #4a4a4a);
    margin: 1rem 0;
  }
`;

@customElement('trial-detail')
export class TrialDetail extends LitElement {
  override createRenderRoot() {
    return this;
  }

  @property() trialId = '';

  render() {
    const trial = this.trialId ? getTrialById(this.trialId) : undefined;

    if (!trial) {
      return html`
        <style>${trialDetailStyles}</style>
        <div class="trial-detail-content" style="view-transition-name: trial-detail-content">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span> &gt; </span>
          <a href="/">Red Hat</a>
          <span> &gt; </span>
          <a href="/">Trials</a>
        </nav>
        <h1 class="page-title">Trial not found</h1>
        <p class="not-found">
          No trial was found for this link.
          <a href="/">Back to trials</a>
        </p>
        </div>
      `;
    }

    const active = isActiveTrial(trial);

    return html`
      <style>${trialDetailStyles}</style>
      <div class="trial-detail-content" style="view-transition-name: trial-detail-content">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span> &gt; </span>
        <a href="/">Red Hat</a>
        <span> &gt; </span>
        <a href="/">Trials</a>
        <span> &gt; </span>
        <span>${trial.product}</span>
      </nav>

      <h1 class="page-title" style="view-transition-name: product-name">${trial.product}</h1>

      <div class="detail-block">
        <div class="detail-label">Subscription start</div>
        <div class="detail-value">${trial.subscriptionStart}</div>
      </div>

      ${active
        ? html`
            <div class="detail-block">
              <div class="detail-label">Days left</div>
              <div class="detail-value">${trial.daysLeft}</div>
              <div
                class="progress-track"
                role="progressbar"
                aria-valuenow="${trial.daysLeft}"
                aria-valuemin="0"
                aria-valuemax="${trial.totalDays}"
              >
                <div
                  class="progress-fill"
                  style="width: ${(trial.daysLeft / trial.totalDays) * 100}%"
                ></div>
              </div>
            </div>
          `
        : html`
            <div class="detail-block">
              <div class="detail-label">Renewal open by</div>
              <div class="detail-value">
                <a href="#">${(trial as ExpiredTrial).renewalOpenBy}</a>
              </div>
            </div>
          `}

      <div class="actions">
        <a href="/">Back to trials</a>
        <button class="btn btn-primary" type="button">
          ${active ? 'Manage subscription' : 'Renew subscription'}
        </button>
      </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trial-detail': TrialDetail;
  }
}
