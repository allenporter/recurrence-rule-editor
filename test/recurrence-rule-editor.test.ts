import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { RecurrenceRuleEditor } from '../src/recurrence-rule-editor/RecurrenceRuleEditor.js'
import '../src/recurrence-rule-editor/recurrence-rule-editor.js';

describe('RecurrenceRuleEditor', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor></recurrence-rule-editor>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<RecurrenceRuleEditor>(
      html`<recurrence-rule-editor
        title="attribute title"
      ></recurrence-rule-editor>`
    );

    expect(el.title).to.equal('attribute title');
  });
});
