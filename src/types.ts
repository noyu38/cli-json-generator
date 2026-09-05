export enum InputAction {
    ADD = "add",
    FINISH = "finish",
    UNDO = "undo"
};

export enum OutputAction {
    FILE = "file",
    COPY = "copy",
    BOTH = "both"
};

export interface CliOptions {
    array: boolean;
    minify: boolean;
    help: boolean;
}