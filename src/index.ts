#!/usr/bin/env node

import { input, confirm } from "@inquirer/prompts";
import clipboard from "clipboardy";

async function main(): Promise<void> {
    const resultObj: Record<string, unknown> = {};
    console.log("Hello! This is an interactive JSON generator.");

    while (true) {
        // keyの値の入力を受け付ける
        const key = await input({
            message: "1. input key: ",
            validate: (value: string) => value.trim().length > 0 || 'Key cannot be empty.'
        });

        // valueの値の入力を受け付ける
        const value = await input({
            message: `2. input value of ${key}: `
        });

        let parsedValue: unknown;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            parsedValue = value;
        }

        resultObj[key] = parsedValue;

        // さらに追加するか聞く
        const answer = await confirm({
            message: "3. Add more?",
            default: true
        });

        if (!answer) {
            break;
        }
    }

    // JSON形式で出力
    const jsonOutput = JSON.stringify(resultObj, null, 2);

    // クリップボードにコピー
    try {
        clipboard.writeSync(jsonOutput);
        console.log("\n[SUCCESS] Copied JSON to clipboard!")
    } catch (e) {
        console.log("\n[ERROR] Failed to Copy JSON to clipboard...");
    }
}

main().catch((e) => {
    if (e.name === "ExitPromptError") {
        console.log("\nProcessing has been interrupted.")
    } else {
        console.error("[ERROR]", e);
    }
});