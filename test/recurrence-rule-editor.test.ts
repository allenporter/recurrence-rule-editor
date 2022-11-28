import { html } from 'lit';
import { Select } from '@material/mwc-select/mwc-select.js';
import { TextField } from '@material/mwc-textfield';
import { fixture, expect, elementUpdated, oneEvent } from '@open-wc/testing';
import { RecurrenceRuleEditor } from '../src/recurrence-rule-editor/RecurrenceRuleEditor.js';
import '../src/recurrence-rule-editor/recurrence-rule-editor.js';
import { ButtonToggle } from '../src/recurrence-rule-editor/button-toggle/button-toggle.js';

describe('RecurrenceRuleEditor', () => {
  it('has a default frequency of "none"', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    expect(sel.label).to.equal('Repeat');
    expect(sel.checkValidity()).to.equal(true);
    expect(sel.selected!.value).to.equal('none');
  });

  it('can select a "yearly" frequency', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    sel.select(1); // Yearly
    await elementUpdated(el);
    expect(sel.selected!.value).to.equal('yearly');

    const repeat = el.shadowRoot!.querySelector('mwc-textfield');
    expect(repeat).to.equal(null);
  });

  it('can select a "monthly" frequency', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    sel.select(2); // Monthly
    await elementUpdated(el);
    expect(sel.selected!.value).to.equal('monthly');

    const repeat = el.shadowRoot!.querySelector('mwc-textfield')!;
    expect(repeat.label).to.equal('Repeat interval');
    expect(repeat.value).to.equal('1');
    expect(repeat.suffix).to.equal('months');
  });

  it('can select a "weekly" frequency', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    sel.select(3); // Weekly
    await elementUpdated(el);
    expect(sel.selected!.value).equal('weekly');

    const repeat = el.shadowRoot!.querySelector('mwc-textfield')!;
    expect(repeat.label).to.equal('Repeat interval');
    expect(repeat.value).to.equal('1');
    expect(repeat.suffix).to.equal('weeks');

    // Verify day of week toggles are shown
    const toggles = el.shadowRoot!.querySelectorAll('button-toggle');
    expect(toggles.length).to.equal(7);
  });

  it('can select a "daily" frequency', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    sel.select(4);
    await elementUpdated(el);
    expect(sel.selected!.value).to.equal('daily');

    const repeat = el.shadowRoot!.querySelector('mwc-textfield')!;
    expect(repeat.label).to.equal('Repeat interval');
    expect(repeat.value).to.equal('1');
    expect(repeat.suffix).to.equal('days');
  });

  it('can send "rrule" event for "monthly"', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(2); // Monthly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=MONTHLY');
    }
  });

  it('can send "rrule" event for "weekly"', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(3); // Weekly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY');
    }
  });

  it('can set "weekly" recurrence by day of week', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(3); // Weekly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY');
    }

    // eslint-disable-next-line no-undef
    const toggles: NodeListOf<ButtonToggle> =
      el.shadowRoot!.querySelectorAll('button-toggle');
    expect(toggles.length).to.equal(7);

    setTimeout(async () => {
      toggles[1].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=MO');
    }
  });

  it('can multi-select day of week', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(3); // Weekly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY');
    }

    // eslint-disable-next-line no-undef
    const toggles: NodeListOf<ButtonToggle> =
      el.shadowRoot!.querySelectorAll('button-toggle');
    expect(toggles.length).to.equal(7);

    // Select Monday
    setTimeout(async () => {
      toggles[1].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=MO');
    }

    // Select Tuesday
    setTimeout(async () => {
      toggles[2].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=MO,TU');
    }

    // De-select Monday
    setTimeout(async () => {
      toggles[1].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=TU');
    }

    // Select Thursday
    setTimeout(async () => {
      toggles[4].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=TU,TH');
    }
  });

  it('can set number of ocurrences to end', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(1); // Yearly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=YEARLY');
    }
    // Select ending after a number of ocurrences
    const endSel: Select = el.shadowRoot!.querySelector('#end')!;
    expect(endSel).not.equal(null);
    setTimeout(async () => {
      endSel.select(1); // Ends On
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=YEARLY;COUNT=5');
    }
  });

  it('can set recurrence to end after a date', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(1); // Yearly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=YEARLY');
    }
    // Select ending on a specific date
    const endSel: Select = el.shadowRoot!.querySelector('#end')!;
    expect(endSel).not.equal(null);
    setTimeout(async () => {
      endSel.select(2); // Ends After
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      // Don't match date string since it is not stable
      expect(detail.value.slice(0, 18)).to.equal('FREQ=YEARLY;UNTIL=');
    }
  });

  it('can reset unnecessary fields when changing frequency types', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    setTimeout(async () => {
      sel.select(3); // Weekly
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY');
    }

    // eslint-disable-next-line no-undef
    const toggles: NodeListOf<ButtonToggle> =
      el.shadowRoot!.querySelectorAll('button-toggle');
    expect(toggles.length).to.equal(7);

    setTimeout(async () => {
      toggles[1].shadowRoot!.querySelector('mwc-button')!.click();
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY;BYDAY=MO');
    }

    // Change frequency type which should reset the weekday options
    setTimeout(async () => {
      sel.select(4); // Daily
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=DAILY');
    }
  });

  it('can parse a yearly "rrule" as input', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor
        value="FREQ=YEARLY"
      ></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    await elementUpdated(sel);
    expect(sel.selected).not.equal(null);
    expect(sel.selected!.value).to.equal('yearly');
  });

  it('can parse a weekly "rrule" as input', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor
        value="FREQ=WEEKLY"
      ></recurrence-rule-editor>`
    );
    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    await elementUpdated(sel);
    expect(sel.selected).not.equal(null);
    expect(sel.selected!.value).to.equal('weekly');
  });

  it('can parse a more complex "rrule" as input', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor
        value="FREQ=WEEKLY;INTERVAL=2;COUNT=3"
      ></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    expect(sel.selected).not.equal(null);
    expect(sel.selected!.value).to.equal('weekly');

    // Verify INTERVAL=2
    const interval: TextField = el.shadowRoot!.querySelector(
      'mwc-textfield#interval'
    )!;
    expect(interval.label).to.equal('Repeat interval');
    expect(interval.value).to.equal('2');
    expect(interval.suffix).to.equal('weeks');

    // Verify COUNT=3
    const endSel: Select = el.shadowRoot!.querySelector('mwc-select#end')!;
    expect(endSel).not.equal(null);
    expect(endSel.selected).not.equal(null);
    expect(endSel.selected!.value).to.equal('after');

    const after: TextField = el.shadowRoot!.querySelector(
      'mwc-textfield#after'
    )!;
    expect(after.label).to.equal('End after');
    expect(after.value).to.equal('3');
    expect(after.suffix).to.equal('ocurrences');

    // Change frequency type which should preserve some options
    setTimeout(async () => {
      sel.select(4); // Daily
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=DAILY;INTERVAL=2;COUNT=3');
    }
  });

  it('can parse an "rrule" with day of week as input', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor
        value="FREQ=WEEKLY;BYDAY=TU,TH"
      ></recurrence-rule-editor>`
    );
    await elementUpdated(el);

    const sel = el.shadowRoot!.querySelector('mwc-select')!;
    expect(sel.selected).not.equal(null);
    expect(sel.selected!.value).to.equal('weekly');

    // Verify default value for interval
    const interval: TextField = el.shadowRoot!.querySelector(
      'mwc-textfield#interval'
    )!;
    expect(interval.label).to.equal('Repeat interval');
    expect(interval.value).to.equal('1');
    expect(interval.suffix).to.equal('weeks');

    // Verify default value for end
    const endSel: Select = el.shadowRoot!.querySelector('mwc-select#end')!;
    expect(endSel).not.equal(null);
    expect(endSel.selected).not.equal(null);
    expect(endSel.selected!.value).to.equal('never');

    // Verify button toggles
    // eslint-disable-next-line no-undef
    const toggles: NodeListOf<ButtonToggle> =
      el.shadowRoot!.querySelectorAll('button-toggle');
    expect(toggles.length).to.equal(7);
    expect(toggles[0].on).to.equal(false);
    expect(toggles[1].on).to.equal(false);
    expect(toggles[2].on).to.equal(true); // TU
    expect(toggles[3].on).to.equal(false);
    expect(toggles[4].on).to.equal(true); // TH
    expect(toggles[5].on).to.equal(false);
    expect(toggles[6].on).to.equal(false);

    // Change frequency type which should clear weekdays
    setTimeout(async () => {
      sel.select(4); // Daily
    });
    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=DAILY');
    }
  });
});
