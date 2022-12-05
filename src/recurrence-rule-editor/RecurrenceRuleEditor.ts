import { getDate, startOfToday } from 'date-fns';
import { html, css, LitElement, PropertyValues } from 'lit';
import { state, property } from 'lit/decorators.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-list/mwc-list-item.js';
import { SelectedDetail } from '@material/mwc-list';
import '@material/mwc-select/mwc-select.js';
import type { Select } from '@material/mwc-select/mwc-select.js';
import '@material/mwc-textfield/mwc-textfield.js';
import './button-toggle/button-toggle.js';
import { RRule, Weekday, ByWeekday } from 'rrule';
import type { Options, WeekdayStr } from 'rrule';
import type { LocaleData } from './locale-data.js';
import {
  RepeatFrequency,
  RepeatEnd,
  convertFrequency,
  getWeekday,
  getWeekdays,
  WEEKDAY_NAME,
  intervalSuffix,
  DEFAULT_COUNT,
  untilValue,
  convertRepeatFrequency,
  ruleByWeekDay,
  getWeekydaysForMonth,
} from './recurrence.js';

export class RecurrenceRuleEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--recurrence-rule-editor-text-color, #000);
    }

    mwc-select {
      width: 400px;
    }
  `;

  @property() public disabled: boolean = false;

  @property() public start: boolean = false;

  @property() public end: boolean = true;

  @property() public value: string = '';

  @property() public dtstart?: Date;

  @property() public localeData: LocaleData = {};

  @state() private _computedRRule = '';

  @state() private _freq?: RepeatFrequency = 'none';

  @state() private _interval: number = 1;

  @state() private _weekday: Set<WeekdayStr> = new Set<WeekdayStr>();

  @state() private _monthWeekday?: Weekday;

  @state() private _end: RepeatEnd = 'never';

  @state() private _count?: number;

  @state() private _until?: Date;

  private _allWeekdays?: WeekdayStr[];

  private _allMonthWeekdays?: Weekday[];

  protected willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);

    if (changedProps.has('localeData')) {
      this._allWeekdays = getWeekdays(this.localeData.firstDay).map(
        (day: Weekday) => day.toString() as WeekdayStr
      );
    }

    if (changedProps.has('dtstart')) {
      this._allMonthWeekdays = getWeekydaysForMonth(
        this.dtstart ? this.dtstart : startOfToday()
      );
      this._monthWeekday = undefined;
      this._computeWeekday();
    }

    if (!changedProps.has('value') || this._computedRRule === this.value) {
      return;
    }

    this._interval = 1;
    this._weekday.clear();
    this._end = 'never';
    this._count = undefined;
    this._until = undefined;

    this._computedRRule = this.value;
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
    if (
      this._freq === 'monthly' &&
      rrule.byweekday &&
      Array.isArray(rrule.byweekday) &&
      rrule.byweekday.length === 1 &&
      rrule.byweekday[0] instanceof Weekday
    ) {
      [this._monthWeekday] = rrule.byweekday;
    } else {
      this._monthWeekday = undefined;
    }
    if (
      this._freq === 'weekly' &&
      rrule.byweekday &&
      Array.isArray(rrule.byweekday)
    ) {
      this._weekday = new Set<WeekdayStr>(
        rrule.byweekday.map(
          (value: ByWeekday) => value.toString() as WeekdayStr
        )
      );
    }
    if (rrule.until) {
      this._end = 'on';
      this._until = rrule.until;
    } else if (rrule.count) {
      this._end = 'after';
      this._count = rrule.count;
    }
  }

  renderAsText() {
    // TODO: Make sure this handles translations
    const readableText =
      this.value === '' || this._freq === undefined
        ? ''
        : RRule.fromString(`RRULE:${this.value}`).toText();
    return html`<div id="text">${readableText}</div>`;
  }

  renderStart() {
    return html`
      <mwc-textfield
        id="start"
        label="Event start"
        type="date"
        value=${this.dtstart ? this.dtstart.toISOString().split('T')[0] : ''}
        @change=${this._onStartChange}
      ></mwc-textfield>
    `;
  }

  renderRepeat() {
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
    `;
  }

  renderMonthly() {
    return html`
      ${this.renderInterval()}
      ${this.dtstart !== undefined
        ? html` <mwc-select
            id="monthly"
            label="Repeat Monthly"
            @selected=${this._onMonthlyDetailSelected}
          >
            <mwc-list-item
              value="BYMONTHDAY"
              .selected=${this._monthWeekday === undefined}
            >
              ${this.renderRRuleByMonthDay()}
            </mwc-list-item>
            ${this._allMonthWeekdays!.map(
              item => html`
                <mwc-list-item
                  value="${item.toString()}"
                  .selected="${this._monthWeekday !== undefined &&
                  this._monthWeekday.equals(item)}"
                >
                  ${this.renderRRuleByDay(item)}
                </mwc-list-item>
              `
            )}
          </mwc-select>`
        : html``}
    `;
  }

  renderRRuleByMonthDay() {
    return RRule.fromString(
      `RRULE:FREQ=MONTHLY;INTERVAL=${this._interval};BYMONTHDAY=${getDate(
        this.dtstart!
      )}`
    ).toText();
  }

  renderRRuleByDay(byday: Weekday) {
    return RRule.fromString(
      `RRULE:FREQ=MONTHLY;INTERVAL=${this._interval};BYDAY=${byday.toString()}`
    ).toText();
  }

  renderWeekly() {
    return html`
      ${this.renderInterval()}
      <div>
        ${this._allWeekdays!.map(
          item => html`
            <button-toggle
              label="${WEEKDAY_NAME[item]}"
              value="${item}"
              .on=${this._weekday.has(item)}
              @button-toggle-change=${this._onWeekdayToggle}
            ></button-toggle>
          `
        )}
      </div>
    `;
  }

  renderDaily() {
    return this.renderInterval();
  }

  renderInterval() {
    return html`
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
    `;
  }

  renderEnd() {
    return html`
      <div>
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
                label="End on"
                type="date"
                value=${this._until!.toISOString().slice(0, 10)}
                @change=${this._onUntilChange}
              ></mwc-textfield>
            `
          : html``}
      </div>
    `;
  }

  render() {
    if (this.disabled) {
      return this.renderAsText();
    }
    return html`
      ${this.start ? this.renderStart() : html``} ${this.renderRepeat()}
      ${this._freq === 'monthly' ? this.renderMonthly() : html``}
      ${this._freq === 'weekly' ? this.renderWeekly() : html``}
      ${this._freq === 'daily' ? this.renderDaily() : html``}
      ${this._freq !== 'none' && this.end ? this.renderEnd() : html``}
    `;
  }

  private _onStartChange(e: Event) {
    e.stopPropagation();
    const dtstart = new Date((e.target! as any).value);
    this.dispatchEvent(
      new CustomEvent('dtstart-changed', {
        detail: { value: dtstart },
      })
    );
  }

  private _onIntervalChange(e: Event) {
    this._interval = (e.target! as any).value;
    this._updateRule();
  }

  private _onRepeatSelected(e: CustomEvent<SelectedDetail<number>>) {
    this._freq = (e.target as Select).items[e.detail.index]
      .value as RepeatFrequency;

    if (this._freq === 'yearly') {
      this._interval = 1;
    }
    if (this._freq !== 'weekly') {
      this._weekday.clear();
      this._computeWeekday();
    }
    e.stopPropagation();
    this._updateRule();
  }

  private _onMonthlyDetailSelected(e: CustomEvent<SelectedDetail<number>>) {
    const { value } = (e.target as Select).items[e.detail.index];
    if (value === 'BYMONTHDAY') {
      // Default is already by day of month
      this._monthWeekday = undefined;
    } else {
      this._monthWeekday = Weekday.fromStr(value as WeekdayStr);
    }
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
    this._end = end;

    switch (this._end) {
      case 'after':
        this._count = DEFAULT_COUNT[this._freq!];
        this._until = undefined;
        break;
      case 'on':
        this._count = undefined;
        this._until = untilValue(new Date(), this._freq!);
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
    e.stopPropagation();
    this._until = new Date((e.target! as any).value);
    this._updateRule();
  }

  // Reset the weekday selected when there is only a single value
  private _computeWeekday() {
    if (this.dtstart && this._weekday.size <= 1) {
      const weekdayNum = getWeekday(this.dtstart);
      this._weekday.clear();
      this._weekday.add(new Weekday(weekdayNum).toString() as WeekdayStr);
    }
  }

  private _computeRRule() {
    if (this._freq === undefined || this._freq === 'none') {
      return '';
    }
    const options = {
      freq: convertRepeatFrequency(this._freq!)!,
      interval: this._interval > 1 ? this._interval : undefined,
      byweekday: ruleByWeekDay(this._weekday),
      count: this._count,
      until: this._until,
    };
    const contentline = RRule.optionsToString(options);
    return contentline.slice(6); // Strip "RRULE:" prefix
  }

  // Fire event with an rfc5546 recurrence rule string value
  private _updateRule() {
    const rule = this._computeRRule();
    if (rule === this._computedRRule) {
      return;
    }
    this._computedRRule = rule;

    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: rule },
      })
    );
  }
}
