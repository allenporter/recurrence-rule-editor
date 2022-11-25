import { html, css, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-list/mwc-list-item.js';
import { SelectedDetail } from '@material/mwc-list';
import { Select } from '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-textfield/mwc-textfield.js';
import './button-toggle/button-toggle.js';

type RepeatFrequency = 'none' | 'yearly' | 'monthly' | 'weekly' | 'daily';

function intervalSuffix(freq: RepeatFrequency) {
  if (freq === 'monthly') {
    return 'months';
  }
  if (freq === 'weekly') {
    return 'weeks';
  }
  return 'days';
}

export class RecurrenceRuleEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--recurrence-rule-editor-text-color, #000);
    }
  `;

  @state() private _freq?: RepeatFrequency = 'none';

  @state() private _interval: number = 1;

  render() {
    return html`
      <div>
        <mwc-select
          id="freq"
          label="Repeat"
          @selected=${this._onRepeatSelected}
        >
          <mwc-list-item value="none" .selected=${this._freq === 'none'}
            >None</mwc-list-item
          >
          <mwc-list-item value="yearly" .selected=${this._freq === 'yearly'}
            >Yearly</mwc-list-item
          >
          <mwc-list-item value="monthly" .selected=${this._freq === 'monthly'}
            >Monthly</mwc-list-item
          >
          <mwc-list-item value="weekly" .selected=${this._freq === 'weekly'}
            >Weekly</mwc-list-item
          >
          <mwc-list-item value="daily" .selected=${this._freq === 'daily'}
            >Daily</mwc-list-item
          >
        </mwc-select>
      </div>

      ${this._freq !== 'none' && this._freq !== 'yearly'
        ? html`
            <mwc-textfield
              label="Repeat interval"
              type="number"
              min="1"
              value=${this._interval}
              suffix=${intervalSuffix(this._freq!)}
            ></mwc-textfield>
          `
        : html``}
      ${this._freq === 'weekly'
        ? html`
            <div>
              <button-toggle label="Man"></button-toggle>
              <button-toggle label="Tue"></button-toggle>
              <button-toggle label="Wed"></button-toggle>
              <button-toggle label="Thu"></button-toggle>
              <button-toggle label="Fri"></button-toggle>
              <button-toggle label="Sat"></button-toggle>
              <button-toggle label="Sun"></button-toggle>
            </div>
          `
        : html``}
    `;
  }

  _onRepeatSelected(e: CustomEvent<SelectedDetail>) {
    this._freq = (e.target as Select).value as RepeatFrequency;
  }
}
