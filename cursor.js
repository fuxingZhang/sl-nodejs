const _readline = require("readline");

// low-level terminal interactions
class Cursor {
  constructor(outputStream) {
    this.stream = outputStream;
  }

  // save cursor position + settings
  save() {
    if (!this.stream.isTTY) {
      return;
    }

    // save position
    this.stream.write("\x1B7");
  }

  // restore last cursor position + settings
  restore() {
    if (!this.stream.isTTY) {
      return;
    }

    // restore cursor
    this.stream.write("\x1B8");
  }

  hide() {
    this.stream.write("\x1b[?25l");
  }

  show() {
    this.stream.write("\x1b[?25h");
  }

  // change cursor positionn
  to(x = null, y = null) {
    if (!this.stream.isTTY) {
      return;
    }

    _readline.cursorTo(this.stream, x, y);
  }

  move(dx = null, dy = null) {
    if (!this.stream.isTTY) {
      return;
    }

    _readline.moveCursor(this.stream, dx, dy);
  }

  // clear to the right from cursor
  clearRight() {
    if (!this.stream.isTTY) {
      return;
    }

    _readline.clearLine(this.stream, 1);
  }

  // clear the full line
  clearLine() {
    if (!this.stream.isTTY) {
      return;
    }

    _readline.clearLine(this.stream, 0);
  }

  // clear everyting beyond the current line
  clearScreenDown() {
    if (!this.stream.isTTY) {
      return;
    }

    _readline.clearScreenDown(this.stream);
  }

  // add new line; increment counter
  newline() {
    this.stream.write("\n");
    this.dy++;
  }

  // write content to output stream
  write(s) {
    this.stream.write(s);
  }

  // tty environment ?
  isTTY() {
    return this.stream.isTTY === true;
  }

  // get terminal columns
  columns() {
    return this.stream.columns || (this.stream.isTTY ? 100 : 0);
  }

  // get terminal rows
  rows() {
    return this.stream.rows || (this.stream.isTTY ? 50 : 0);
  }
}

module.exports = Cursor;
