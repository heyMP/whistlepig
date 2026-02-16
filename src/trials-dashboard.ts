import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import {
  activeTrials,
  expiredTrials,
  learningBanner,
  learningResources,
} from './data/trials.js';

const trialsDashboardStyles = `
  trials-dashboard {
    display: block;
    max-width: var(--max-width, 1200px);
    padding: var(--spacing, 1rem) 1.5rem 2rem;
  }
  trials-dashboard .section-title {
    font-family: var(--font-heading, sans-serif);
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem;
  }

  /* Table card container */
  trials-dashboard .table-card {
    background: var(--color-bg, #fff);
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    margin-bottom: 2.5rem;
  }
  trials-dashboard .table-wrap {
    overflow-x: auto;
  }
  trials-dashboard table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  trials-dashboard th,
  trials-dashboard td {
    text-align: left;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--color-border, #d2d2d2);
    vertical-align: middle;
  }
  trials-dashboard tbody tr:last-child td {
    border-bottom: none;
  }
  trials-dashboard th {
    font-weight: 600;
    color: var(--color-text-muted, #4a4a4a);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--color-bg, #fff);
  }
  trials-dashboard .th-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  trials-dashboard .info-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: var(--color-border, #d2d2d2);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-text-muted, #4a4a4a);
    cursor: default;
  }
  trials-dashboard .days-cell {
    min-width: 140px;
  }
  trials-dashboard .progress-track {
    min-width: 80px;
  }
  trials-dashboard .actions-cell {
    white-space: nowrap;
  }
  trials-dashboard .actions-cell a {
    margin-right: 1rem;
  }

  /* Learning section */
  trials-dashboard .learning-section {
    margin-top: 2.5rem;
    padding-top: 2rem;
  }
  trials-dashboard .learning-intro {
    margin: 0 0 1.5rem;
    color: var(--color-text-muted, #4a4a4a);
    max-width: 50ch;
    line-height: 1.6;
  }
  trials-dashboard .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }
  trials-dashboard .card {
    padding: 1.5rem;
    background: var(--color-bg, #fff);
    border: none;
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-card);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  trials-dashboard .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
  }
  trials-dashboard .card-title {
    font-family: var(--font-heading, sans-serif);
    font-size: 1.0625rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }
  trials-dashboard .card-desc {
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
    margin: 0 0 1.25rem;
    line-height: 1.6;
  }
  trials-dashboard .banner {
    background: var(--color-banner-bg, #151515);
    color: white;
    padding: 2.5rem;
    border-radius: var(--radius-lg, 16px);
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    align-items: center;
  }
  @media (min-width: 640px) {
    trials-dashboard .banner {
      grid-template-columns: 1fr auto;
    }
  }
  trials-dashboard .banner-content h3 {
    font-family: var(--font-heading, sans-serif);
    margin: 0 0 0.5rem;
    font-size: 1.375rem;
    font-weight: 700;
  }
  trials-dashboard .banner-content p {
    margin: 0 0 1.25rem;
    font-size: 0.875rem;
    opacity: 0.85;
    line-height: 1.6;
  }
  trials-dashboard .banner .btn-outline {
    color: white;
    border-color: white;
  }
  trials-dashboard .banner .btn-outline:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  trials-dashboard .banner-image {
    min-height: 120px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg, 16px);
    display: none;
  }
  @media (min-width: 640px) {
    trials-dashboard .banner-image {
      display: block;
      width: 200px;
      height: 120px;
    }
  }
`;

@customElement('trials-dashboard')
export class TrialsDashboard extends LitElement {
  override createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <style>${trialsDashboardStyles}</style>
      <div class="dashboard-content">
      <h2 class="section-title">Active subscriptions</h2>
      <div class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Subscription start</th>
                <th>Days left</th>
                <th>Next steps and resources</th>
              </tr>
            </thead>
            <tbody>
              ${activeTrials.map(
                (trial) => html`
                  <tr>
                    <td data-trial-product="${trial.id}">${trial.product}</td>
                    <td>${trial.subscriptionStart}</td>
                    <td class="days-cell">
                      ${trial.daysLeft}
                      <div class="progress-track">
                        <div
                          class="progress-fill"
                          style="width: ${(trial.daysLeft / trial.totalDays) * 100}%"
                        ></div>
                      </div>
                    </td>
                    <td class="actions-cell">
                      <a href="/trial/${trial.id}">View more</a>
                      <button class="btn btn-primary" type="button">
                        Ready to buy
                      </button>
                    </td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 class="section-title">Expired subscriptions</h2>
      <div class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Subscription start</th>
                <th>
                  <span class="th-with-icon">
                    Renewal open by
                    <span class="info-icon" title="Renewal window">i</span>
                  </span>
                </th>
                <th>Next steps and resources</th>
              </tr>
            </thead>
            <tbody>
              ${expiredTrials.map(
                (trial) => html`
                  <tr>
                    <td data-trial-product="${trial.id}">${trial.product}</td>
                    <td>${trial.subscriptionStart}</td>
                    <td><a href="#">${trial.renewalOpenBy}</a></td>
                    <td class="actions-cell">
                      <a href="/trial/${trial.id}">View more</a>
                      <button class="btn btn-primary" type="button">
                        Ready to buy
                      </button>
                    </td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section class="learning-section">
        <h2 class="section-title">Learning support</h2>
        <p class="learning-intro">
          Make the most of your Red Hat products and learn new skills to help
          you grow your business.
        </p>
        <div class="cards-grid">
          ${learningResources.map(
            (resource) => html`
              <div class="card">
                <h3 class="card-title">${resource.title}</h3>
                <p class="card-desc">${resource.description}</p>
                <a href="#" class="btn btn-outline">${resource.buttonLabel}</a>
              </div>
            `
          )}
        </div>
        <div class="banner">
          <div class="banner-content">
            <h3>${learningBanner.title}</h3>
            <p>${learningBanner.description}</p>
            <a href="#" class="btn btn-outline">${learningBanner.buttonLabel}</a>
          </div>
          <div class="banner-image" aria-hidden="true"></div>
        </div>
      </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trials-dashboard': TrialsDashboard;
  }
}
