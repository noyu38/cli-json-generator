import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { parseCliArgs } from "../src/args.js";

describe("parseCliArgs() のテスト", () => {
    let originalArgv: string[];

    beforeEach(() => {
        originalArgv = process.argv;
        vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        process.argv = originalArgv;
        vi.restoreAllMocks();
    });

    it("引数がない場合には、すべてfalseになる", () => {
        process.argv = ["node", "script.js"];
        const args = parseCliArgs();
        expect(args).toEqual({ array: false, minify: false, help: false });
    });

    it("-a や --array フラグが正しく解析される", () => {
    process.argv = ["node", "script.js", "--array"];
    expect(parseCliArgs().array).toBe(true);

    process.argv = ["node", "script.js", "-a"];
    expect(parseCliArgs().array).toBe(true);
  });

  it("複数のフラグ (-am) が同時に解析される", () => {
    process.argv = ["node", "script.js", "-am"];
    const args = parseCliArgs();
    expect(args.array).toBe(true);
    expect(args.minify).toBe(true);
  });
})