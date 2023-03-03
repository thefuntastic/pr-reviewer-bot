import { determineIntent } from '../src/determineIntent';
import { Review } from '../src/reviews';
import { Intent } from '../src/types/intent';

//APPROVE, REQUEST_CHANGES, COMMENT, PENDING

test('Approve when labelled and no review exists', () => {
  const input: Review = {
    id: 1234,
    user: null,
    state: 'APPROVE'
  };

  expect(determineIntent(true, undefined)).toEqual(Intent.Approve);
});

test('Do nothing when labelled an approval review exists', () => {
  const input: Review = {
    id: 1234,
    user: null,
    state: 'APPROVE'
  };

  expect(determineIntent(true, input)).toEqual(Intent.DoNothing);
});

test(`Dismiss approval when label is removed`, () => {
  const input: Review = {
    id: 1234,
    user: null,
    state: 'APPROVE'
  };

  expect(determineIntent(false, input)).toEqual(Intent.Dismiss);
});

test(`Do nothing when labell is added, an review is in between state`, () => {
  let input: Review = {
    id: 1234,
    user: null,
    state: 'REQUEST_CHANGES'
  };

  expect(determineIntent(true, input)).toEqual(Intent.DoNothing);

  input.state = 'PENDING';
  expect(determineIntent(true, input)).toEqual(Intent.DoNothing);

  input.state = 'COMMENT';
  expect(determineIntent(true, input)).toEqual(Intent.DoNothing);
});

test(`Do nothing when labell is removed, an review is in between state`, () => {
  let input: Review = {
    id: 1234,
    user: null,
    state: 'REQUEST_CHANGES'
  };

  expect(determineIntent(false, input)).toEqual(Intent.DoNothing);

  input.state = 'PENDING';
  expect(determineIntent(false, input)).toEqual(Intent.DoNothing);

  input.state = 'COMMENT';
  expect(determineIntent(false, input)).toEqual(Intent.DoNothing);
});

test(`Do nothing if label removed and no PR`, () => {
  expect(determineIntent(false, undefined)).toEqual(Intent.DoNothing);
});


