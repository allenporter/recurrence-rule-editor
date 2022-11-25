import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@material/mwc-button/mwc-button.js';

@customElement('button-toggle')
export class ButtonToggle extends LitElement {
  static styles = css``;

  @property() public label?: string;

  @property() public on: boolean = false;

  render() {
    return html`
      <mwc-button
        label=${this.label !== undefined ? this.label : ''}
        .unelevated=${this.on}
        .outlined=${!this.on}
        @click=${this._toggle}
      >
      </mwc-button>
    `;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  _toggle(e: CustomEvent) {
    this.on = !this.on;
    this.dispatchEvent(
      new CustomEvent('button-toggle-change', {
        detail: { isOn: this.on },
        bubbles: true,
      })
    );
  }
}
