import fs from "node:fs";
import path from "node:path";
import clipboard from "clipboardy";
import { input } from "@inquirer/prompts";
import { OutputAction } from "./types.js";

export async function handleOutput(jsonOutput: string, outputAction: OutputAction): Promise<void> {
  if (outputAction === OutputAction.COPY || outputAction === OutputAction.BOTH) {
    try {
      clipboard.writeSync(jsonOutput);
      console.log("\n[SUCCESS] Copied JSON to clipboard!");
    } catch (e) {
      console.log("\n[ERROR] Failed to Copy JSON to clipboard...");
    }
  }

  if (outputAction === OutputAction.FILE || outputAction === OutputAction.BOTH) {
    const fileName = await input({
      message: "Enter the file name to save:",
      default: "data.json",
      validate: (value: string) => value.trim().length > 0 || "File name cannot be empty.",
    });

    try {
      const filePath = path.resolve(process.cwd(), fileName);
      fs.writeFileSync(filePath, jsonOutput, "utf-8");
      console.log(`\n[SUCCESS] Saved the file: ${filePath}\n`);
    } catch (e) {
      console.error("\n[ERROR] Failed to save the file:", e);
    }
  }
}