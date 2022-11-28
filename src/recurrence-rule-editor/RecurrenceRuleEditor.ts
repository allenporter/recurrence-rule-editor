import { html, css, LitElement, PropertyValues } from 'lit';
import { state, property } from 'lit/decorators.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-list/mwc-list-item.js';
import { SelectedDetail } from '@material/mwc-list';
import { Select } from '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-select/mwc-select.js'; // eslint-disable-line import/no-duplicates
import '@material/mwc-textfield/mwc-textfield.js';
import './button-toggle/button-toggle.js';
import { RRule, Frequency, Weekday, ByWeekday } from 'rrule';
import type { Options, WeekdayStr } from 'rrule';

type RepeatFrequency = 'none' | 'yearly' | 'monthly' | 'weekly' | 'daily';

type RepeatEnd = 'never' | 'on' | 'after';

const DEFAULT_COUNT = {
  none: 1,
  yearly: 5,
  monthly: 12,
  weekly: 13,
  daily: 30,
};

function intervalSuffix(freq: RepeatFrequency) {
  if (freq === 'monthly') {
    return 'months';
  }
  if (freq === 'weekly') {
    return 'weeks';
  }
  return 'days';
}

function untilValue(freq: RepeatFrequency): Date {
  const today = new Date();
  const increment = DEFAULT_COUNT[freq];
  switch (freq) {
    case 'yearly':
      return new Date(new Date().setFullYear(today.getFullYear() + increment));
    case 'monthly':
      return new Date(new Date().setMonth(today.getMonth() + increment));
    case 'weekly':
      return new Date(new Date().setDate(today.getDate() + 7 * increment));
    case 'daily':
    default:
      return new Date(new Date().setDate(today.getDate() + increment));
  }
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

const WEEKDAY_NAME = {
  "SU": "Sun",
  "MO": "Mon",
  "TU": "Tue",
  "WE": "Wed",
  "TH": "Thu",
  "FR": "Fri",
  "SA": "Sat",
}
const WEEKDAYS = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

export class RecurrenceRuleEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--recurrence-rule-editor-text-color, #000);
    }
  `;

  @property() public value: string = '';

  @state() private _computedRrule = '';

  @state() private _freq?: RepeatFrequency = 'none';

  @state() private _interval: number = 1;

  @state() private _weekday: Set<WeekdayStr> = new Set<WeekdayStr>();

  @state() private _end: RepeatEnd = 'never';

  @state() private _count?: number;

  @state() private _until?: Date;

  private _allWeekdays: WeekdayStr[] = WEEKDAYS.map((day: Weekday) => day.toString() as WeekdayStr);

  protected willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);

    if (!changedProps.has('value')) {
      return;
    }
    this._interval = 1;
    this._weekday.clear();
    this._end = 'never';
    this._count = undefined;
    this._until = undefined;

    this._computedRrule = this.value;
    if (this.value === '') {
      this._freq = 'none';
      return;
    }
    let rrule: Partial<Options> | undefined;
    try {
      rrule = RRule.parseString(this.value);
    } catch (ex) {
      // unsupported rrule string
      this._freq = undefined;
      return;
    }
    this._freq = convertFrequency(rrule!.freq!);
    if (rrule.interval) {
      this._interval = rrule.interval;
    }
    if (this._freq === "weekly" && rrule.byweekday && Array.isArray(rrule.byweekday)) {
      this._weekday = new Set<WeekdayStr>(rrule.byweekday.map((value: ByWeekday) => value.toString() as WeekdayStr));
    }
    if (rrule.until) {
      this._end = 'on'
      this._until = rrule.until;
    } else if (rrule.count) {
      this._end = 'after';
      this._count = rrule.count;
    }
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
            <div>
              <mwc-textfield
                id="interval"
                label="Repeat interval"
                type="number"
                min="1"
                value=${this._interval}
                suffix=${intervalSuffix(this._freq!)}
                @change=${this._onIntervalChange}
              ></mwc-textfield>
            </div>
          `
        : html``}
      ${this._freq === 'weekly'
        ? html`
            <div>
              ${this._allWeekdays.map(item => html`
                <button-toggle
                  label="${WEEKDAY_NAME[item]}"
                  value="${item}"
                  .on=${this._weekday.has(item)}
                  @button-toggle-change=${this._onWeekdayToggle}
                ></button-toggle>
              `)}
            </div>
          `
        : html``}
      ${this._freq !== 'none'
        ? html` <div>
            <mwc-select id="end" label="Ends" @selected=${this._onEndSelected}>
              <mwc-list-item value="never" .selected=${this._end === 'never'}
                >Never</mwc-list-item
              >
              <mwc-list-item value="after" .selected=${this._end === 'after'}
                >After</mwc-list-item
              >
              <mwc-list-item value="on" .selected=${this._end === 'on'}
                >On</mwc-list-item
              >
            </mwc-select>

            ${this._end === 'after'
              ? html`
                  <mwc-textfield
                    id="after"
                    label="End after"
                    type="number"
                    min="1"
                    value=${this._count!}
                    suffix="ocurrences"
                    @change=${this._onCountChange}
                  ></mwc-textfield>
                `
              : html``}
            ${this._end === 'on'
              ? html`
                  <mwc-textfield
                    id="on"
                    label="Ends on"
                    type="date"
                    value=${this._until!.toISOString().slice(0, 10)}
                    @change=${this._onUntilChange}
                  ></mwc-textfield>
                `
              : html``}
          </div>`
        : html``}
    `;
  }

  private _onIntervalChange(e: Event) {
    this._interval = (e.target! as any).value;
    this._updateRule();
  }

  private _onRepeatSelected(e: CustomEvent<SelectedDetail<number>>) {
    this._freq = (e.target as Select).items[e.detail.index].value as RepeatFrequency;

    if (this._freq === 'yearly') {
      this._interval = 1;
    }
    if (this._freq !== 'weekly') {
      this._weekday.clear();
    }
    e.stopPropagation();
    this._updateRule();
  }

  private _onWeekdayToggle(e: CustomEvent) {
    const { isOn, value } = e.detail;
    if (isOn) {
      this._weekday.add(value);
    } else {
      this._weekday.delete(value);
    }
    this._updateRule();
  }

  private _onEndSelected(e: CustomEvent<SelectedDetail<number>>) {
    const end = (e.target as Select).items[e.detail.index].value as RepeatEnd;
    if (end === this._end) {
      return;
    }
    this._end = end

    switch (this._end) {
      case 'after':
        this._count = DEFAULT_COUNT[this._freq!];
        this._until = undefined;
        break;
      case 'on':
        this._count = undefined;
        this._until = untilValue(this._freq!);
        break;
      default:
        this._count = undefined;
        this._until = undefined;
    }
    e.stopPropagation();
    this._updateRule();
  }

  private _onCountChange(e: Event) {
    this._count = (e.target! as any).value;
    this._updateRule();
  }

  private _onUntilChange(e: Event) {
    this._until = (e.target! as any).value;
    this._updateRule();
  }

  private _ruleString() {
    if (this._freq === undefined || this._freq === 'none') {
      return '';
    }
    const options = {
      freq: convertRepeatFrequency(this._freq!)!,
      interval: this._interval > 1 ? this._interval : undefined,
      byweekday: this._ruleByWeekDay(),
      count: this._count,
      until: this._until,
    };
    const contentline = RRule.optionsToString(options);
    return contentline.slice(6); // Strip "RRULE:" prefix
  }

  private _ruleByWeekDay(): Weekday[] | undefined {
    return Array.from(this._weekday).map((value: string) => {
      switch (value) {
        case 'MO':
          return RRule.MO;
        case 'TU':
          return RRule.TU;
        case 'WE':
          return RRule.WE;
        case 'TH':
          return RRule.TH;
        case 'FR':
          return RRule.FR;
        case 'SA':
          return RRule.SA;
        case 'SU':
          return RRule.SU;
        default:
          return RRule.MO;
      }
    });
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
