import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getTrialById } from './data/trials.js';
import type { ActiveTrial, ExpiredTrial } from './data/trials.js';

function isActiveTrial(
  trial: ActiveTrial | ExpiredTrial
): trial is ActiveTrial {
  return 'daysLeft' in trial && 'totalDays' in trial;
}

const checkSvg = html`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
  <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const iconModel = html`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <rect width="40" height="40" rx="8" fill="#f0f0f0"/>
  <path d="M20 10a2 2 0 0 1 2 2v1.17a6.002 6.002 0 0 1 4.83 4.83H28a2 2 0 1 1 0 4h-1.17A6.002 6.002 0 0 1 22 26.83V28a2 2 0 1 1-4 0v-1.17A6.002 6.002 0 0 1 13.17 22H12a2 2 0 1 1 0-4h1.17A6.002 6.002 0 0 1 18 13.17V12a2 2 0 0 1 2-2zm0 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#4a4a4a"/>
</svg>`;

const iconServer = html`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <rect width="40" height="40" rx="8" fill="#f0f0f0"/>
  <rect x="11" y="10" width="18" height="8" rx="2" stroke="#4a4a4a" stroke-width="1.5" fill="none"/>
  <rect x="11" y="22" width="18" height="8" rx="2" stroke="#4a4a4a" stroke-width="1.5" fill="none"/>
  <circle cx="15" cy="14" r="1.5" fill="#4a4a4a"/>
  <circle cx="15" cy="26" r="1.5" fill="#4a4a4a"/>
  <line x1="19" y1="14" x2="26" y2="14" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="19" y1="26" x2="26" y2="26" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const iconHardware = html`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <rect width="40" height="40" rx="8" fill="#f0f0f0"/>
  <rect x="13" y="13" width="14" height="14" rx="2" stroke="#4a4a4a" stroke-width="1.5" fill="none"/>
  <rect x="17" y="17" width="6" height="6" rx="1" fill="#4a4a4a"/>
  <line x1="16" y1="13" x2="16" y2="10" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="20" y1="13" x2="20" y2="10" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="24" y1="13" x2="24" y2="10" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="16" y1="27" x2="16" y2="30" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="20" y1="27" x2="20" y2="30" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="24" y1="27" x2="24" y2="30" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="13" y1="16" x2="10" y2="16" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="13" y1="20" x2="10" y2="20" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="13" y1="24" x2="10" y2="24" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="27" y1="16" x2="30" y2="16" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="27" y1="20" x2="30" y2="20" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="27" y1="24" x2="30" y2="24" stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const trialDetailStyles = `
  trial-detail {
    display: block;
    max-width: var(--max-width, 1200px);
    padding: 0 1.5rem 3rem;
  }

  /* ── Stepper ── */
  trial-detail .stepper {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 700px;
    margin: 2rem auto 2.5rem;
    padding: 0 1rem;
  }
  trial-detail .stepper-track {
    position: absolute;
    top: 16px;
    left: calc(1rem + 16px);
    right: calc(1rem + 16px);
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    z-index: 0;
  }
  trial-detail .stepper-fill {
    height: 100%;
    background: #4caf50;
    border-radius: 2px;
    transition: width 0.4s ease;
  }
  trial-detail .stepper-step {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
    width: 100px;
  }
  trial-detail .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
    font-weight: 700;
    border: 2px solid #e0e0e0;
    background: #fff;
    color: var(--color-text-muted, #4a4a4a);
    transition: all 0.3s ease;
  }
  trial-detail .stepper-step.completed .step-circle {
    background: #4caf50;
    border-color: #4caf50;
    color: #fff;
  }
  trial-detail .stepper-step.active .step-circle {
    border-color: #4caf50;
    background: #fff;
    color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  }
  trial-detail .step-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-muted, #4a4a4a);
    text-align: center;
    line-height: 1.3;
  }
  trial-detail .stepper-step.completed .step-label {
    color: #4caf50;
    font-weight: 600;
  }
  trial-detail .stepper-step.active .step-label {
    color: var(--color-text, #151515);
    font-weight: 600;
  }

  /* ── Hero ── */
  trial-detail .trial-hero {
    text-align: center;
    padding: 1.5rem 0 2.5rem;
    border-bottom: 1px solid var(--color-border, #d2d2d2);
    margin-bottom: 2.5rem;
  }
  trial-detail .trial-hero-heading {
    font-family: var(--font-heading, sans-serif);
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--color-text, #151515);
  }
  trial-detail .trial-hero-sub {
    font-size: 1rem;
    color: var(--color-text-muted, #4a4a4a);
    margin: 0 0 1rem;
  }
  trial-detail .trial-hero-disclaimer {
    font-size: 0.75rem;
    color: var(--color-text-muted, #4a4a4a);
    max-width: 60ch;
    margin: 0 auto;
    line-height: 1.5;
  }

  /* ── Section headings ── */
  trial-detail .trial-section {
    margin-bottom: 3rem;
  }
  trial-detail .section-heading {
    font-family: var(--font-heading, sans-serif);
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 0.5rem;
    color: var(--color-text, #151515);
  }
  trial-detail .section-sub {
    text-align: center;
    font-size: 0.9375rem;
    color: var(--color-text-muted, #4a4a4a);
    margin: 0 0 2rem;
  }

  /* ── Requirements ── */
  trial-detail .requirements-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  @media (max-width: 768px) {
    trial-detail .requirements-grid {
      grid-template-columns: 1fr;
    }
  }
  trial-detail .requirement-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.5rem;
  }
  trial-detail .requirement-title {
    font-family: var(--font-heading, sans-serif);
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text, #151515);
    margin: 0;
  }
  trial-detail .requirement-desc {
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
    line-height: 1.6;
    margin: 0;
  }

  /* ── Next Steps ── */
  trial-detail .next-steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  trial-detail .next-steps-grid .next-step-card:last-child {
    grid-column: 1;
  }
  @media (max-width: 900px) {
    trial-detail .next-steps-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    trial-detail .next-steps-grid {
      grid-template-columns: 1fr;
    }
  }
  trial-detail .next-step-card {
    background: var(--color-bg, #fff);
    border: 1px solid var(--color-border, #d2d2d2);
    border-radius: var(--radius-lg, 16px);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  trial-detail .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  trial-detail .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-red, #ee0000);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }
  trial-detail .step-title {
    font-family: var(--font-heading, sans-serif);
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text, #151515);
    margin: 0;
    line-height: 1.3;
  }
  trial-detail .step-content {
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
    line-height: 1.7;
  }
  trial-detail .step-content ol {
    margin: 0;
    padding-left: 1.25rem;
  }
  trial-detail .step-content li {
    margin-bottom: 0.5rem;
  }
  trial-detail .step-content a {
    color: var(--color-link, #0066cc);
  }

  /* ── Support ── */
  trial-detail .support-section {
    text-align: center;
    padding: 2.5rem 0;
    border-top: 1px solid var(--color-border, #d2d2d2);
    border-bottom: 1px solid var(--color-border, #d2d2d2);
  }
  trial-detail .support-section .section-heading {
    margin-bottom: 0.75rem;
  }
  trial-detail .support-text {
    font-size: 0.9375rem;
    color: var(--color-text-muted, #4a4a4a);
    line-height: 1.6;
    max-width: 55ch;
    margin: 0 auto;
  }
  trial-detail .support-text a {
    color: var(--color-link, #0066cc);
  }

  /* ── Helpful Resources ── */
  trial-detail .resources-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  @media (max-width: 600px) {
    trial-detail .resources-grid {
      grid-template-columns: 1fr;
    }
  }
  trial-detail .resource-card {
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-border, #d2d2d2);
    border-radius: var(--radius, 4px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  trial-detail .resource-card p {
    font-size: 0.875rem;
    color: var(--color-text-muted, #4a4a4a);
    line-height: 1.6;
    margin: 0;
  }
  trial-detail .resource-card a {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-link, #0066cc);
  }
  trial-detail .resources-bottom {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    text-align: center;
    padding-top: 1rem;
  }
  trial-detail .resources-bottom-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
  }
  trial-detail .resources-bottom-item span {
    color: var(--color-text-muted, #4a4a4a);
  }
  trial-detail .resources-bottom-item a {
    font-weight: 600;
    color: var(--color-link, #0066cc);
  }

  /* ── Not found ── */
  trial-detail .not-found-card {
    background: var(--color-bg, #fff);
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-card);
    padding: 2rem;
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
        <div class="not-found-card">
          <p class="not-found">
            No trial was found for this link.
            <a href="/">Back to trials</a>
          </p>
        </div>
      `;
    }

    const active = isActiveTrial(trial);

    const stepperFillPercent = active ? 50 : 100;
    const currentStep = active ? 2 : 3;

    const steps = [
      'Start a trial',
      'Log in',
      'Try in console',
      'Trial success',
    ];

    return html`
      <style>${trialDetailStyles}</style>

      <!-- Stepper -->
      <div class="stepper" role="group" aria-label="Trial progress">
        <div class="stepper-track">
          <div class="stepper-fill" style="width: ${stepperFillPercent}%"></div>
        </div>
        ${steps.map(
          (label, i) => html`
            <div class="stepper-step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}">
              <div class="step-circle">
                ${i < currentStep ? checkSvg : html`${i + 1}`}
              </div>
              <span class="step-label">${label}</span>
            </div>
          `
        )}
      </div>

      <!-- Hero -->
      <div class="trial-hero">
        ${active
          ? html`
            <h2 class="trial-hero-heading">Your product trial is underway</h2>
            <p class="trial-hero-sub">
              You have ${trial.daysLeft} days left to try ${trial.product}
            </p>
          `
          : html`
            <h2 class="trial-hero-heading">Your product trial has expired</h2>
            <p class="trial-hero-sub">
              Your trial of ${trial.product} ended on ${(trial as ExpiredTrial).renewalOpenBy}.
              <a href="#">Renew or purchase</a> to continue.
            </p>
          `}
        <p class="trial-hero-disclaimer">
          *By proceeding with product trial evaluation and if previously, you agree to the <a href="#">Red Hat
          Enterprise Agreement</a>, including the applicable trial terms and conditions in the appendix.
        </p>
      </div>

      <!-- Requirements -->
      <div class="trial-section">
        <h3 class="section-heading">Requirements to get started</h3>
        <div class="requirements-grid">
          <div class="requirement-card">
            ${iconModel}
            <h4 class="requirement-title">Select your AI model for optimization</h4>
            <p class="requirement-desc">
              Ensure your server is set up with an AI model that you
              intend to enhance, fine-tune, or optimize for tasks like
              inference, its throughput, or batch processing.
            </p>
          </div>
          <div class="requirement-card">
            ${iconServer}
            <h4 class="requirement-title">Prepare your server environment</h4>
            <p class="requirement-desc">
              To deploy and run configurations for models
              efficiently, ensure you have Red Hat Enterprise Linux or CentOS installed
              on your servers.
            </p>
          </div>
          <div class="requirement-card">
            ${iconHardware}
            <h4 class="requirement-title">Fulfill hardware requirements</h4>
            <p class="requirement-desc">
              Ensure your system has compatible hardware and resources.
              Refer to our requirements guide for supported NVIDIA GPUs, AMD GPUs, or Google
              TPUs.
            </p>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="trial-section">
        <h3 class="section-heading">Next steps</h3>
        <div class="next-steps-grid">
          <div class="next-step-card">
            <div class="step-header">
              <div class="step-number">1</div>
              <h4 class="step-title">Install ${trial.product}</h4>
            </div>
            <div class="step-content">
              <ol>
                <li>Follow the <a href="#">installation guide</a> to install
                  ${trial.product} on your server or as a
                  container image.</li>
                <li>Set up the environment with
                  your preferred configuration.
                  GPU drivers, then pull and
                  run the <a href="#">container image</a>.</li>
                <li>Select the appropriate
                  image for your CPU, GPU,
                  or accelerator using the
                  <a href="#">compatibility guide</a>.</li>
              </ol>
            </div>
          </div>
          <div class="next-step-card">
            <div class="step-header">
              <div class="step-number">2</div>
              <h4 class="step-title">Leverage our third-party validated and optimized model instructions</h4>
            </div>
            <div class="step-content">
              <ol>
                <li>Once you've installed the
                  Inference Server, configure
                  your models for maximum
                  throughput and scalability of
                  optimized models.</li>
                <li>We recommend the
                  validated <a href="#">Llama, Gemma,
                  or Mistral</a> models.</li>
                <li>Or, bring any open
                  source or custom-fine tuned
                  model that is <a href="#">vLLM compatible</a>.</li>
              </ol>
            </div>
          </div>
          <div class="next-step-card">
            <div class="step-header">
              <div class="step-number">3</div>
              <h4 class="step-title">Try an example agentic application</h4>
            </div>
            <div class="step-content">
              <ol>
                <li><a href="#">Access the demo app
                  on GitHub</a>.</li>
                <li>Backfire the Quick Start
                  guide to personalize the
                  inference pipeline with
                  the demo app.</li>
                <li>Observe and evaluate the
                  metrics and benchmarks
                  you get via the Red Hat AI
                  container registry.</li>
              </ol>
            </div>
          </div>
          <div class="next-step-card">
            <div class="step-header">
              <div class="step-number">4</div>
              <h4 class="step-title">Measure your model's performance</h4>
            </div>
            <div class="step-content">
              <ol>
                <li>Use <a href="#">GuideLLM</a>, an open source tool
                  by Red Hat to emulate
                  production-level workloads against
                  LLM deployments and
                  capture metrics like throughput,
                  latency, time to first
                  token, and more.</li>
                <li>Use the terminal
                  framework to fine-tune
                  your LLM quality and
                  enable <a href="#">scalable content
                  validation</a>.</li>
                <li>Deploy your LLM using
                  Red Hat AI Inference
                  Server's <a href="#">Helm chart</a>.</li>
                <li>Quantitatively <a href="#">compare
                  the evaluation
                  performance metrics</a> of
                  your current LLM
                  serving and the
                  initial baseline model.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Need Support -->
      <div class="trial-section support-section">
        <h3 class="section-heading">Need support?</h3>
        <p class="support-text">
          If you have questions about your product trial, contact the support team at <a href="tel:888-733-4281">888-733-4281</a>
          or <a href="tel:919-754-3700">919-754-3700</a>, then select the menu prompt for Customer Service.
        </p>
      </div>

      <!-- Helpful Resources -->
      <div class="trial-section">
        <h3 class="section-heading">Helpful resources</h3>
        <p class="section-sub">To make the most of your product trial, check out these resources:</p>
        <div class="resources-grid">
          <div class="resource-card">
            <p>Discover how AI/LM accelerates large
              language model (LLM) inference serving by leveraging
              advanced optimization and deployment
              techniques.</p>
            <a href="#">Read the article</a>
          </div>
          <div class="resource-card">
            <p>Build or learn how to perform offline inference with a LLM,
              multi-step prompt chaining, generating structured output, and
              manage production-scale AI with OpenShift AI and Kserve.</p>
            <a href="#">See use cases</a>
          </div>
          <div class="resource-card">
            <p>Learn how to evaluate LLM systems under real-world
              inference conditions using GuideLLM.</p>
            <a href="#">Read tutorials</a>
          </div>
          <div class="resource-card">
            <p>Have a question or need a hand getting started? Get
              installation guidance, FAQs, and troubleshooting support for
              your Red Hat product trial.</p>
            <a href="#">Open a support ticket</a>
          </div>
        </div>
        <div class="resources-bottom">
          <div class="resources-bottom-item">
            <span>Social media links</span>
            <a href="#">See product FAQs</a>
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
