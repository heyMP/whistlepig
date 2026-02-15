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
    padding: var(--spacing, 1rem) 1.5rem 2rem;
  }
  trial-detail .detail-card {
    background: var(--color-bg, #fff);
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-card);
    padding: 2rem;
  }
  trial-detail .detail-block {
    margin-bottom: 1.5rem;
  }
  trial-detail .detail-label {
    font-family: var(--font-heading, sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted, #4a4a4a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 0.25rem;
  }
  trial-detail .detail-value {
    font-size: 1rem;
    color: var(--color-text, #151515);
  }
  trial-detail .progress-track {
    max-width: 200px;
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
        <div class="detail-card">
          <p class="not-found">
            No trial was found for this link.
            <a href="/">Back to trials</a>
          </p>
        </div>
        </div>
      `;
    }

    const active = isActiveTrial(trial);

    return html`
      <style>${trialDetailStyles}</style>
      <div class="trial-detail-content" style="view-transition-name: trial-detail-content">
      <div class="detail-card">

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
            ${active ? 'Manage subscription' : 'Ready to buy'}
          </button>
        </div>
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
