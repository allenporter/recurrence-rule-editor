import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@material/mwc-icon-button-toggle/mwc-icon-button-toggle.js';

@customElement('svg-button-toggle')
export class SvgButtonToggle extends LitElement {
  static styles = css``;

  @property() public onIcon?: string;

  @property() public offIcon?: string;

  @property() public on: boolean = false;

  render() {
    return html`
        <mwc-icon-button-toggle .on=${this.on} @icon-button-toggle-change=${this._toggle}>
            <svg slot="onIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d=${this.onIcon}>
            </svg>
            <svg slot="offIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d=${this.offIcon}>
            </svg>
        </mwc-icon-button-toggle>
    `;
  }

  _toggle(e: CustomEvent) {
    this.on = e.detail.isOn;
    this.dispatchEvent(
      new CustomEvent('icon-button-toggle-change', {
        detail: { isOn: this.on },
        bubbles: true,
      })
    );
  }
}
