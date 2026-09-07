import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleOutput } from "../src/output.js";
import { OutputAction } from "../src/types.js";
import clipboard from "clipboardy";
import fs from "node:fs";
import { input } from "@inquirer/prompts";

vi.mock("clipboardy", () => ({
    default: { writeSync: vi.fn() }
}));
vi.mock("node:fs", () => ({
    default: { writeFileSync: vi.fn() }
}));
vi.mock("@inquirer/prompts");

describe("handleOutput()のテスト", () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(input).mockResolvedValue("test.json");
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("COPYを選択したとき、clipboard.writeSyncが呼ばれる", async () => {
        const dummyJson = '{"key":"value"}';
        await handleOutput(dummyJson, OutputAction.COPY);

        // クリップボードに書き込む関数が、指定したJSONとともに呼ばれたかチェック
        expect(clipboard.writeSync).toHaveBeenCalledWith(dummyJson);
        // fsは呼ばれていないことをチェック
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("FILEを選択したとき、fs.writeFileSyncが呼ばれる", async () => {
        const dummyJson = '{"key":"value"}';
        await handleOutput(dummyJson, OutputAction.FILE);

        // ファイル書き込み回数が１回呼ばれたかチェック
        expect(fs.writeFileSync).toHaveBeenCalledOnce();
        // クリップボードは呼ばれていないか
        expect(clipboard.writeSync).not.toHaveBeenCalled();
    });

    it("BOTHを選択したとき、両方の関数が呼ばれる", async () => {
        const dummyJson = '{"key":"value"}';
        await handleOutput(dummyJson, OutputAction.BOTH);

        expect(clipboard.writeSync).toHaveBeenCalledOnce();
        expect(fs.writeFileSync).toHaveBeenCalledOnce();
    });
});