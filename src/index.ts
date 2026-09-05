#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";
import { highlight } from "cli-highlight";
import { set, unset } from "lodash-es";

// --- 分割したモジュールのインポート ---
import { InputAction, OutputAction } from "./types.js";
import { parseCliArgs } from "./args.js";
import { parseValue } from "./parser.js";
import { handleOutput } from "./output.js";

async function main(): Promise<void> {
  // 引数の処理
  const options = parseCliArgs();

  const resultObj: object = options.array ? [] : {};
  const keysHistory: string[] = [];
  
  console.log("Hello! This is an interactive JSON generator.");
  if (options.array) {
    console.log("💡 Array mode: Enter index (0, 1...) as key. (e.g., 0.name)");
  } else {
    console.log("💡 Object mode: You can use dot notation for nested objects. (e.g., user.name)");
  }

  // 入力受け付け
  while (true) {
    const key = await input({
      message: options.array ? "1. Enter index or key:" : "1. Enter key:",
      validate: (value: string) => value.trim().length > 0 || "Key cannot be empty.",
    });

    const value = await input({
      message: `2. Enter value of ${key}:`,
    });

    // パース処理は別ファイルに委譲
    const parsedValue = parseValue(value);

    set(resultObj, key, parsedValue);
    keysHistory.push(key);

    let isFinish = false;

    // 次のアクションの選択
    while (true) {
      const choices = [
        { name: "add more", value: InputAction.ADD },
        { name: "finish", value: InputAction.FINISH },
      ];

      if (keysHistory.length > 0) {
        const lastKey = keysHistory[keysHistory.length - 1];
        choices.push({
          name: `undo (delete last input of [${lastKey}])`,
          value: InputAction.UNDO,
        });
      }

      const inputAction = await select({
        message: "3. Select next action:",
        choices: choices,
      });

      if (inputAction === InputAction.ADD) {
        break;
      } else if (inputAction === InputAction.FINISH) {
        isFinish = true;
        break;
      } else if (inputAction === InputAction.UNDO) {
        const removeKey = keysHistory.pop();
        if (removeKey) {
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

  // 出力フォーマットの生成
  const indent = options.minify ? undefined : 2;
  const jsonOutput = JSON.stringify(resultObj, null, indent);

  const colorJson = highlight(jsonOutput, {
    language: "json",
    ignoreIllegals: true,
  });

  console.log(`\n--- Generated JSON ---\n${colorJson}\n`);

  // 保存アクションの選択と実行
  const outputAction = await select({
    message: "Select a storage method:",
    choices: [
      { name: "as a json file", value: OutputAction.FILE },
      { name: "copy to clipboard", value: OutputAction.COPY },
      { name: "both (copy and file)", value: OutputAction.BOTH },
    ],
  });

  // 保存処理は別ファイルに委譲
  await handleOutput(jsonOutput, outputAction as OutputAction);
}

main().catch((e) => {
  if (e.name === "ExitPromptError") {
    console.log("\nProcessing has been interrupted.");
  } else {
    console.error("\n[ERROR]", e);
  }
});