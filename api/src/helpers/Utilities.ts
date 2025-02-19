import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { capitalize, isArray, isNumber, isObject, mapEntries, snake } from 'radash';

dayjs.extend(utc);
dayjs.extend(timezone);

const Utilities = {
  parseBool(val: unknown) {
    if (
      (typeof val === 'string' && (val.toLowerCase() === 'true' || val.toLowerCase() === 'yes' || val === '1')) ||
      val === 1 ||
      val === true
    ) {
      return true;
    }

    if (
      (typeof val === 'string' && (val.toLowerCase() === 'false' || val.toLowerCase() === 'no' || val === '0')) ||
      val === 0 ||
      val === false
    ) {
      return false;
    }

    return null;
  },

  variableIsValid(variable: unknown) {
    return variable !== null && variable !== undefined;
  },

  tryParseJson(string: string | null | undefined | unknown) {
    try {
      if (Array.isArray(string)) throw new Error();
      if (string === null) throw new Error();
      if (string === undefined) throw new Error();
      if (typeof string === 'object')
        return {
          value: string,
          valid: true,
        };
      if (typeof string !== 'string') throw new Error();
      return { value: JSON.parse(string), valid: true };
    } catch (e) {
      return { value: string, valid: false };
    }
  },

  splitCase(str: string): string[] {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_\-.]+/g, ' ')
      .split(' ')
      .filter(Boolean);
  },

  startCase(str: string): string {
    return this.splitCase(str).map(capitalize).join(' ');
  },

  getPageOffSet(page?: undefined | number, pageSize?: undefined | number) {
    if (page === undefined || pageSize === undefined) {
      return undefined;
    }

    return (page - 1) * pageSize;
  },

  getPaginationResponse({
    limit,
    offset,
    totalCount,
  }: {
    limit?: number | undefined;
    offset?: number | undefined;
    totalCount?: number | string;
  }) {
    const _totalCount = typeof totalCount === 'string' ? Number(totalCount) : totalCount;

    return {
      totalCount: _totalCount,
      totalPages: isNumber(_totalCount) && isNumber(limit) ? Math.ceil(_totalCount / limit) : null,
      currentPage: isNumber(offset) && isNumber(limit) ? Math.floor(offset / limit) + 1 : null,
      pageSize: limit || null,
    };
  },

  toSnakeCase(obj: unknown): unknown {
    if (isArray(obj)) {
      return obj.map(this.toSnakeCase);
    } else if (isObject(obj)) {
      return mapEntries(obj, (key, value) => [snake(key), value]);
    }
  },

  hasPagination(payload: unknown) {
    return isObject(payload) && 'pagination' in payload;
  },
};

export default Utilities;
