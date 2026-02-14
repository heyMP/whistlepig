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
  trials-dashboard .intro {
    margin: 0 0 2rem;
    color: var(--color-text-muted, #4a4a4a);
    max-width: 60ch;
  }
  trials-dashboard .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }
  trials-dashboard .table-wrap {
    overflow-x: auto;
    margin-bottom: 2.5rem;
  }
  trials-dashboard table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  trials-dashboard th,
  trials-dashboard td {
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border, #d2d2d2);
    vertical-align: middle;
  }
  trials-dashboard th {
    font-weight: 600;
    color: var(--color-text, #151515);
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
    height: 8px;
    background: var(--color-progress-track, #e8e8e8);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.25rem;
    min-width: 80px;
  }
  @keyframes progressFillIn {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  trials-dashboard .progress-fill {
    height: 100%;
    background: var(--color-primary-bg, #0066cc);
    border-radius: 4px;
    transition: width 0.2s ease;
    transform-origin: left;
    animation: progressFillIn 0.4s ease-out;
  }
  trials-dashboard .actions-cell {
    white-space: nowrap;
  }
  trials-dashboard .actions-cell a {
    margin-right: 1rem;
  }
  trials-dashboard .btn {
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
  trials-dashboard .btn-primary {
    background: var(--color-primary-bg, #0066cc);
    color: white;
  }
  trials-dashboard .btn-primary:hover {
    background: var(--color-primary-bg-hover, #004080);
    color: white;
  }
  trials-dashboard .btn-outline {
    background: transparent;
    color: var(--color-primary-bg, #0066cc);
    border: 1px solid var(--color-primary-bg, #0066cc);
  }
  trials-dashboard .btn-outline:hover {
    background: rgba(0, 102, 204, 0.08);
  }
  trials-dashboard .learning-section {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border, #d2d2d2);
  }
  trials-dashboard .learning-intro {
    margin: 0 0 1.5rem;
    color: var(--color-text-muted, #4a4a4a);
    max-width: 50ch;
  }
  trials-dashboard .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }
  trials-dashboard .card {
    padding: 1.25rem;
    background: var(--color-bg, #fff);
    border: 1px solid var(--color-border, #d2d2d2);
    border-radius: var(--radius, 4px);
  }
  trials-dashboard .card-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }
  trials-dashboard .card-desc {
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
    margin: 0 0 1rem;
    line-height: 1.5;
  }
  trials-dashboard .banner {
    background: var(--color-banner-bg, #1a1a2e);
    color: white;
    padding: 2rem;
    border-radius: var(--radius, 4px);
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
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }
  trials-dashboard .banner-content p {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    opacity: 0.9;
    line-height: 1.5;
  }
  trials-dashboard .banner .btn-outline {
    color: white;
    border-color: white;
  }
  trials-dashboard .banner .btn-outline:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  trials-dashboard .banner-image {
    min-height: 120px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: var(--radius, 4px);
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
      <div class="dashboard-content" style="view-transition-name: dashboard-content">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#">Home</a>
        <span> &gt; </span>
        <a href="#">Red Hat</a>
        <span> &gt; </span>
        <span>Trials</span>
      </nav>

      <h1 class="page-title">My trials</h1>
      <p class="intro">
        Access your Red Hat subscriptions, manage your subscription renewals, and
        enhance your use of the products you purchased. For any questions
        related to your Red Hat products, subscription services, please join the
        discussion in our
        <a href="#">Red Hat support team</a>
        forum.
      </p>

      <h2 class="section-title">Active subscriptions</h2>
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
                      Manage subscription
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>

      <h2 class="section-title">Expired subscriptions</h2>
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
                      Renew subscription
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
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
