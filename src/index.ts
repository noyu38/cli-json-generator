#!/usr/bin/env node

// import { input, confirm } from "@inquirer/prompts";
import { input, select } from "@inquirer/prompts";
import clipboard from "clipboardy";
import { highlight } from "cli-highlight";
import { set, unset } from "lodash-es";

async function main(): Promise<void> {
    const resultObj: Record<string, unknown> = {};
    // keyの順番を記憶させる
    const keysHistory: string[] = [];
    console.log("Hello! This is an interactive JSON generator.");

    while (true) {
        // keyの値の入力を受け付ける
        const key = await input({
            message: "1. input key:",
            validate: (value: string) => value.trim().length > 0 || 'Key cannot be empty.'
        });

        // valueの値の入力を受け付ける
        const value = await input({
            message: `2. input value of ${key}:`
        });

        let parsedValue: unknown;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            parsedValue = value;
        }

        // resultObj[key] = parsedValue;
        set(resultObj, key, parsedValue);
        keysHistory.push(key);

        let isFinish = false;

        // 追加後の行動を選択させる
        while (true) {
            const choices = [
                { name: "add more", value: "add"},
                { name: "finish", value: "finish"},
            ];

            // keyの履歴が１つ以上ある場合のみ、Undoの選択肢を表示する
            if (keysHistory.length > 0) {
                const lastKey = keysHistory[keysHistory.length - 1];
                choices.push({
                    name: `undo (delete last input of [${lastKey}])`,
                    value: "undo"
                });
            }

            const action = await select({
                message: "3. select next action:",
                choices: choices
            });

            if (action === "add") {
                break;
            } else if (action === "finish") {
                isFinish = true;
                break;
            } else if (action === "undo") {
                const removeKey = keysHistory.pop();
                if (removeKey) {
                    // delete resultObj[removeKey];
                    unset(resultObj, removeKey);
                    console.log(`\nInput (${removeKey}) canceled.\n`);
                }

                if (keysHistory.length === 0) {
                    console.log("Input data is empty. Please enter a new key.\n");
                    break;
                }
            }
        }
        if (isFinish) {
            break;
        }
    }

    // JSON形式で出力
    const jsonOutput = JSON.stringify(resultObj, null, 2);

    const colorJson = highlight(jsonOutput, {
        language: "json",
        ignoreIllegals: true
    });

    console.log(colorJson);

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