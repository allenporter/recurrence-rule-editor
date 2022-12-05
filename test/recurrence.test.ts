import { expect } from '@open-wc/testing';
import { getWeekydaysForMonth } from '../src/recurrence-rule-editor/recurrence.js';

describe('recurrence', () => {
  it('can return last tuesday 2022-10-25', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 9, 25));
    expect(result.map(x => x.toString())).to.deep.equal(['+4TU', '-1TU']);
  });

  it('can return fourth monday 2022-10-24', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 9, 24));
    expect(result.map(x => x.toString())).to.deep.equal(['+4MO']);
  });

  it('can return last monday 2022-10-31', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 9, 31));
    expect(result.map(x => x.toString())).to.deep.equal(['-1MO']);
  });

  it('can return first Tuesday 2022-11-1', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 10, 1));
    expect(result.map(x => x.toString())).to.deep.equal(['+1TU']);
  });

  it('can return last Wednesday 2022-11-30', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 10, 30));
    expect(result.map(x => x.toString())).to.deep.equal(['-1WE']);
  });

  it('can return second Wednesday 2022-12-14', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 11, 14));
    expect(result.map(x => x.toString())).to.deep.equal(['+2WE']);
  });

  it('can return third Sunday', async () => {
    const result = getWeekydaysForMonth(new Date(2022, 11, 18));
    expect(result.map(x => x.toString())).to.deep.equal(['+3SU']);
  });
});
