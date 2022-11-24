import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class RecurrenceRuleEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--recurrence-rule-editor-text-color, #000);
    }
  `;

  @property({ type: String }) title = 'Hey there';

  @property({ type: Number }) counter = 5;

  __increment() {
    this.counter += 1;
  }

  render() {
    return html`
      <h2>${this.title} Mr. ${this.counter}!</h2>
      <button @click=${this.__increment}>increment</button>
    `;
  }
}

if (!customElements.get('recurrence-rule-editor')) {
  customElements.define('recurrence-rule-editor', RecurrenceRuleEditor);
}
