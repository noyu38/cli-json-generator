import { describe, it, expect } from "vitest";
import { parseValue } from '../src/parser.js';

describe("parseValue()のテスト", () => {
    it("数値に変換できる文字列は、数値としてパースされる", () => {
        expect(parseValue("123")).toBe(123);
        expect(parseValue("0.5")).toBe(0.5);
    });

    it("true/false はbooleanとしてパースされる", () => {
        expect(parseValue("true")).toBe(true);
        expect(parseValue("false")).toBe(false);
    });

    it("JSONの配列やオブジェクトとしてパースできる", () => {
        expect(parseValue("[1, 2, 3]")).toEqual([1, 2, 3]);
        expect(parseValue('{"name": "taro"}')).toEqual({ name: 'taro' });
    });

    it("クォーテーションで囲まれた値は、強制的に文字列としてパースされる", () => {
        expect(parseValue("'123'")).toBe('123');
        expect(parseValue('"true"')).toBe('true');
        expect(parseValue("'0012'")).toBe('0012');
    });

    it("変換できない文字列は、そのまま文字列として返される", () => {
        expect(parseValue('hello')).toBe('hello');
    });
});