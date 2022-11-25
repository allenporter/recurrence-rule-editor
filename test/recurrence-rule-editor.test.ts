import { html } from 'lit';
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
    sel.select(1);
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
    sel.select(2);
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
    sel.select(3);
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
      sel.select(2);
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
      sel.select(3);
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
      sel.select(3);
    });

    {
      const { detail } = await oneEvent(el, 'value-changed');
      expect(detail.value).to.equal('FREQ=WEEKLY');
    }

    // XXXeslint-disable-next-line no-undef
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
      sel.select(3);
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
});
