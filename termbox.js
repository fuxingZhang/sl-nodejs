"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("node:readline");
const ESC = "\x1B[";
const SAVE = "\x1B7"; // "\x1B[s"
const RESTORE = "\x1B8"; // "\x1B[u"
const HIDE = "?25l";
const SHOW = "?25h";
const CLEAR_SCREEN = "2J";
class TermBox {
    stream = process.stdout;
    cells;
    columns;
    rows;
    constructor(size) {
        const { columns, rows } = size ?? this.size();
        this.columns = columns;
        this.rows = rows;
        this.cells = new Array(rows)
            .fill(null)
            .map(() => new Array(columns).fill(null).map(() => " "));
    }
    cursor(action) {
        this.stream.write(ESC + action);
    }
    flush() {
        this.stream.cursorTo(0, 0);
        this.stream.write(this.cells.map((v) => v.join("")).join("\n"));
    }
    setCell(x, y, char) {
        if (x >= this.columns || x < 0)
            return;
        if (y >= this.rows || y < 0)
            return;
        if (stripAnsiCode(char).length > 1) {
            throw new Error("char length cannot be greater than 1");
        }
        this.cells[y][x] = char;
    }
    cursorHide() {
        this.cursor(HIDE);
    }
    cursorShow() {
        this.cursor(SHOW);
    }
    cursorSave() {
        this.stream.write(SAVE);
    }
    cursorRestore() {
        this.stream.write(RESTORE);
    }
    cursorTo(x, y) {
        this.stream.cursorTo(x, y);
    }
    cursorPostion() {
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            process.stdout.write("\x1b[6n");
            process.stdin.once("data", (data) => {
                const match = data.toString().match(/\[(\d+);(\d+)R/);
                if (match) {
                    const rows = parseInt(match[1]);
                    const columns = parseInt(match[2]);
                    resolve({ rows, columns });
                }
                else {
                    reject("cannot get cursor position");
                }
                rl.close();
            });
        });
    }
    screenClear() {
        this.cursor(CLEAR_SCREEN);
    }
    screenClearDown() {
        this.stream.clearScreenDown();
    }
    screenReset() {
        this.stream.write(ESC + (this.rows - 1) + "A\r\x1b[?0J");
    }
    size() {
        if (!this.stream.isTTY)
            return { columns: 100, rows: 50 };
        return {
            columns: this.stream.columns,
            rows: this.stream.rows,
        };
    }
}
exports.default = TermBox;
// https://github.com/chalk/ansi-regex/blob/02fa893d619d3da85411acc8fd4e2eea0e95a9d9/index.js
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
].join("|"), "g");
function stripAnsiCode(string) {
    return string.replace(ANSI_PATTERN, "");
}
