#!/usr/bin/env node

// import { input, confirm } from "@inquirer/prompts";
import { input, select } from "@inquirer/prompts";
import clipboard from "clipboardy";
import { highlight } from "cli-highlight";
import { set, unset, values } from "lodash-es";
import fs from 'node:fs';
import path from 'node:path';

enum InputAction {
    ADD = "add",
    FINISH = "finish",
    UNDO = "undo"
};

enum OutputAction {
    FILE = "file",
    COPY = "copy",
    BOTH = "both"
};

async function main(): Promise<void> {
    const resultObj: Record<string, unknown> = {};
    // keyの順番を記憶させる
    const keysHistory: string[] = [];
    console.log("Hello! This is an interactive JSON generator.");

    while (true) {
        // keyの値の入力を受け付ける
        const key = await input({
            message: "1. Enter key:",
            validate: (value: string) => value.trim().length > 0 || 'Key cannot be empty.'
        });

        // valueの値の入力を受け付ける
        const value = await input({
            message: `2. Enter value of ${key}:`
        });

        // シングルクォーテーションやダブルクォーテーションで囲まれている場合、強制的に文字列としてパースする
        let isQuoted = false;
        if ((value.startsWith("'") && value.endsWith("'") && value.length >= 2) || (value.startsWith('"') && value.endsWith('"') && value.length >= 2)) {
            isQuoted = true;
        }

        let parsedValue: unknown;

        if (isQuoted) {
            parsedValue = value.slice(1, -1);
        } else {
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                parsedValue = value;
            }
        }

        // resultObj[key] = parsedValue;
        set(resultObj, key, parsedValue);
        keysHistory.push(key);

        let isFinish = false;

        // 追加後の行動を選択させる
        while (true) {
            const choices = [
                { name: "add more", value: InputAction.ADD },
                { name: "finish", value: InputAction.FINISH },
            ];

            // keyの履歴が１つ以上ある場合のみ、Undoの選択肢を表示する
            if (keysHistory.length > 0) {
                const lastKey = keysHistory[keysHistory.length - 1];
                choices.push({
                    name: `undo (delete last input of [${lastKey}])`,
                    value: InputAction.UNDO
                });
            }

            const inputAction = await select({
                message: "3. Select next inputAction:",
                choices: choices
            });

            if (inputAction === InputAction.ADD) {
                break;
            } else if (inputAction === InputAction.FINISH) {
                isFinish = true;
                break;
            } else if (inputAction === InputAction.UNDO) {
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

    const outputAction = await select({
        message: "Select a storage method:",
        choices: [
            { name: "as a json file", value: OutputAction.FILE },
            { name: "copy to clipboard", value: OutputAction.COPY },
            { name: "both (copy and file)", value: OutputAction.BOTH}
        ]
    })
    // クリップボードにコピー
    if (outputAction === OutputAction.COPY || outputAction === OutputAction.BOTH) {
        try {
            clipboard.writeSync(jsonOutput);
            console.log("\n[SUCCESS] Copied JSON to clipboard!")
        } catch (e) {
            console.log("\n[ERROR] Failed to Copy JSON to clipboard...");
        }
    }

    if (outputAction === OutputAction.FILE || outputAction === OutputAction.BOTH) {
        const fileName = await input({
            message: "Enter the file name to save:",
            default: "data.json",
            validate: (value: string) => value.trim().length > 0 || "File name cannot be empty."
        });

        try {
            const filePath = path.resolve(process.cwd(), fileName);

            fs.writeFileSync(filePath, jsonOutput, "utf-8");

            console.log(`\n [SUCCESS] Save the file: ${filePath}\n`);
        } catch (e) {
            console.error("\n [ERROR] Failed to save the file:", e);
        }
    }
}

main().catch((e) => {
    if (e.name === "ExitPromptError") {
        console.log("\nProcessing has been interrupted.")
    } else {
        console.error("[ERROR]", e);
    }
});