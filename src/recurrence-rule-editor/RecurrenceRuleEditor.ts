import { html, css, LitElement, PropertyValues } from 'lit';
import { state, property } from 'lit/decorators.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-list/mwc-list-item.js';
import { SelectedDetail } from '@material/mwc-list';
import { Select } from '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-textfield/mwc-textfield.js';
import './button-toggle/button-toggle.js';
import { RRule, Frequency } from 'rrule';
import type { Options } from 'rrule';

type RepeatFrequency = 'none' | 'yearly' | 'monthly' | 'weekly' | 'daily';
type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

function intervalSuffix(freq: RepeatFrequency) {
  if (freq === 'monthly') {
    return 'months';
  }
  if (freq === 'weekly') {
    return 'weeks';
  }
  return 'days';
}

const convertFrequency = (freq: Frequency): RepeatFrequency | undefined => {
  switch (freq) {
    case Frequency.YEARLY:
      return 'yearly';
    case Frequency.MONTHLY:
      return 'monthly';
    case Frequency.WEEKLY:
      return 'weekly';
    case Frequency.DAILY:
      return 'daily';
    default:
      return undefined;
  }
};

const convertRepeatFrequency = (
  freq: RepeatFrequency
): Frequency | undefined => {
  switch (freq) {
    case 'yearly':
      return Frequency.YEARLY;
    case 'monthly':
      return Frequency.MONTHLY;
    case 'weekly':
      return Frequency.WEEKLY;
    case 'daily':
      return Frequency.DAILY;
    default:
      return undefined;
  }
};

export class RecurrenceRuleEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--recurrence-rule-editor-text-color, #000);
    }
  `;

  @property() public rrule: string = '';

  @state() private _computedRrule = '';

  @state() private _rrule?: Partial<Options>;

  @state() private _freq?: RepeatFrequency = 'none';

  @state() private _interval: number = 1;

  @state() private _weekday: Set<Weekday> = new Set<Weekday>();

  protected willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);

    if (!changedProps.has('rrule')) {
      return;
    }
    this._computedRrule = this.rrule;
    if (this.rrule === '') {
      this._freq = 'none';
      this._interval = 1;
      return;
    }
    let rrule: Partial<Options> | undefined;
    try {
      rrule = RRule.parseString(this.rrule);
    } catch (ex) {
      // unsupported rrule string
      this._freq = undefined;
      this._interval = 1;
      return;
    }
    // this._rrule.
    this._freq = convertFrequency(rrule!.freq!);
  }

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
              @change=${this._onIntervalChange}
            ></mwc-textfield>
          `
        : html``}
      ${this._freq === 'weekly'
        ? html`
            <div>
              <button-toggle
                label="Mon"
                value="mon"
                @button-toggle-change=${this._onWeekdayToggle}
              ></button-toggle>
              <button-toggle
                label="Tue"
                @button-toggle-change=${this._onWeekdayToggle}
              ></button-toggle>
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

  private _onIntervalChange(e: Event) {
    this._interval = (e.target! as any).value;
    this._updateRule();
  }

  private _onRepeatSelected(e: CustomEvent<SelectedDetail>) {
    this._freq = (e.target as Select).value as RepeatFrequency;

    if (this._freq === undefined || this._freq === 'none') {
      this._rrule = undefined;
    } else {
      this._rrule = {
        freq: convertRepeatFrequency(this._freq!)!,
      };
    }
    this.requestUpdate();
    e.stopPropagation();
    this._updateRule();
  }

  private _onWeekdayToggle(e: CustomEvent) {
    // TODO: Update day of week in rrule
    // const { isOn, weekday } = e.detail;
    this._updateRule();
  }

  private _ruleString() {
    if (this._freq === undefined || this._freq === 'none') {
      return '';
    }
    const options = {
      freq: convertRepeatFrequency(this._freq!)!,
      interval: this._interval > 1 ? this._interval : undefined,
    };
    const contentline = RRule.optionsToString(options);
    return contentline.slice(6); // Strip "RRULE:" prefix
  }

  // Fire event with an rfc5546 recurrence rule string value
  private _updateRule() {
    const rule = this._ruleString();
    if (rule === this._computedRrule) {
      return;
    }
    this._computedRrule = rule;

    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: rule },
      })
    );
  }
}
