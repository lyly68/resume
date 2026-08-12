/**
 * dayjs 类型补充声明
 * 解决 dayjs.Dayjs 类型在某些版本中不可用的问题
 */
declare module 'dayjs' {
  export interface Dayjs {
    format(format?: string): string;
    add(value: number, unit: string): Dayjs;
    subtract(value: number, unit: string): Dayjs;
    startOf(unit: string): Dayjs;
    endOf(unit: string): Dayjs;
    isBefore(date: any, unit?: string): boolean;
    isAfter(date: any, unit?: string): boolean;
    isSame(date: any, unit?: string): boolean;
    year(): number;
    month(): number;
    date(): number;
    hour(): number;
    minute(): number;
    second(): number;
    valueOf(): number;
    unix(): number;
    toDate(): Date;
    toISOString(): string;
    locale(): string;
    locale(locale: string): Dayjs;
    utc(): Dayjs;
    tz(timezone?: string, keepLocalTime?: boolean): Dayjs;
    clone(): Dayjs;
    diff(date: any, unit?: string, float?: boolean): number;
    daysInMonth(): number;
  }
}

declare module 'file-saver' {
  export function saveAs(data: Blob | File | string, filename?: string, options?: { autoBom?: boolean }): void;
}
