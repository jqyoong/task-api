import { describe, test, expect } from 'vitest';

import Utilities from '@helpers/Utilities';

describe('Helpers: Utilities', () => {
  describe('parseBool:', () => {
    test('Positive flow: should return true', async () => {
      const bool = true;
      const string = 'true';
      const number = 1;

      const boolResult = Utilities.parseBool(bool);
      expect(boolResult).eq(true);

      const stringResult = Utilities.parseBool(string);
      expect(stringResult).eq(true);

      const numberResult = Utilities.parseBool(number);
      expect(numberResult).eq(true);
    });
    test('Negative flow: should return false', async () => {
      const bool = false;
      const string = 'false';
      const number = 0;

      const boolResult = Utilities.parseBool(bool);
      expect(boolResult).eq(false);

      const stringResult = Utilities.parseBool(string);
      expect(stringResult).eq(false);

      const numberResult = Utilities.parseBool(number);
      expect(numberResult).eq(false);
    });

    test('Negative flow: should return null', async () => {
      const bool = null;
      const string = 'nono';
      const number = 1234;

      const boolResult = Utilities.parseBool(bool);
      expect(boolResult).eq(null);

      const stringResult = Utilities.parseBool(string);
      expect(stringResult).eq(null);

      const numberResult = Utilities.parseBool(number);
      expect(numberResult).eq(null);
    });
  });

  describe('variableIsValid:', () => {
    test('Positive flow: should return true if there is value', async () => {
      const bool = true;
      const string = 'true';
      const number = 1;
      const object = {};
      const array = [1];

      const boolResult = Utilities.variableIsValid(bool);
      expect(boolResult).eq(true);

      const stringResult = Utilities.variableIsValid(string);
      expect(stringResult).eq(true);

      const numberResult = Utilities.variableIsValid(number);
      expect(numberResult).eq(true);

      const objectResult = Utilities.variableIsValid(object);
      expect(objectResult).eq(true);

      const arrayResult = Utilities.variableIsValid(array);
      expect(arrayResult).eq(true);

      const response = Utilities.variableIsValid(1);
      expect(response).eq(true);
    });
    test('Positive flow: should return false if value is undefined or null', async () => {
      const object = null;
      const words = undefined;

      const objectResult = Utilities.variableIsValid(object);
      expect(objectResult).eq(false);

      const wordsResult = Utilities.variableIsValid(words);
      expect(wordsResult).eq(false);
    });
  });

  describe('tryParseJson:', () => {
    test('Positive flow: should return true if there is value', async () => {
      const string = '[1]';

      const stringResult = Utilities.tryParseJson(string);
      expect(stringResult.valid).eq(true);
      expect(typeof stringResult.value).eq('object');
    });

    test('Negative flow: should return false if there is value', async () => {
      const string = {};
      const nullObject = null;

      const stringResult = Utilities.tryParseJson(string);
      expect(typeof stringResult.value).eq('object');
      expect(stringResult.valid).eq(true);
      expect(stringResult.value).eq(string);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const nullObjectResult = Utilities.tryParseJson(nullObject);
      expect(typeof nullObjectResult.value).eq('object');
      expect(nullObjectResult.valid).eq(false);
      expect(nullObjectResult.value).eq(nullObject);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const undefinedResult = Utilities.tryParseJson(undefined);
      expect(typeof undefinedResult.value).eq('undefined');
      expect(undefinedResult.valid).eq(false);
      expect(undefinedResult.value).eq(undefined);
    });
  });
});
