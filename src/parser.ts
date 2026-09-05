export function parseValue(value: string): unknown {
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

    return parsedValue;
}