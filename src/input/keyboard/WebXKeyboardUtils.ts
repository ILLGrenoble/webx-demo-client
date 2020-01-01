export class WebXKeyboardUtils {
  public static keysymFromCharCode(codepoint: number) {
    const isControlCharacter = (char: number) => {
      return char <= 0x1f || (char >= 0x7f && char <= 0x9f);
    };

    // Keysyms for control characters
    if (isControlCharacter(codepoint)) {
      return 0xff00 | codepoint;
    }

    // Keysyms for ASCII chars
    if (codepoint >= 0x0000 && codepoint <= 0x00ff) {
      return codepoint;
    }

    // Keysyms for Unicode
    if (codepoint >= 0x0100 && codepoint <= 0x10ffff) {
      return 0x01000000 | codepoint;
    }

    return null;
  }


}

