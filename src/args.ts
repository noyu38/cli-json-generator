import { parseArgs } from "node:util";
import { CliOptions } from "./types.js";

export function parseCliArgs(): CliOptions {
    // コマンドライン引数の解析
    const { values } = parseArgs({
        options: {
            array: { type: "boolean", short: "a", default: false },
            minify: { type: "boolean", short: "m", default: false },
            help: { type: "boolean", short: "h", default: false },
        },
        strict: false, // 未知のフラグが使用されてもエラーで落ちないようにする
    });

    if (values.help) {
        console.log(`
usage:
    json-gen [option]

options:
    -a, --array    Create the route as an array [] instead of an object {}
    -m, --minify   Compress the output JSON into one line
    -h, --help     show help message
            `);
        process.exit(0);
    }

    return {
        array: Boolean(values.array),
        minify: Boolean(values.minify),
        help: Boolean(values.help),
    };
}