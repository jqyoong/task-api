import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

class CustomError extends Error {
  replaceKeyWords: string[];
  replaceWords: string[];
  details: unknown;
  statusCode?: number;
  date: Dayjs;
  frontendEnum: string;

  constructor({
    message = '',
    details,
    statusCode,
    replaceKeyWords = [],
    replaceWords = [], // ...params
  }: {
    message: string;
    statusCode?: number;
    details?: unknown;
    replaceKeyWords?: string[];
    replaceWords?: string[];
  }) {
    // super({...params});
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    // Custom debugging information
    this.message = message;
    this.details = details;
    this.replaceKeyWords = [];
    this.replaceWords = [];
    this.frontendEnum = '';

    if (statusCode) {
      this.statusCode = statusCode;
    }

    if (Array.isArray(replaceKeyWords) && replaceKeyWords.length > 0) {
      this.replaceKeyWords = replaceKeyWords;
    }

    if (Array.isArray(replaceWords) && replaceWords.length > 0) {
      this.replaceWords = replaceWords;
    }

    this.date = dayjs();
  }
}

export default CustomError;
