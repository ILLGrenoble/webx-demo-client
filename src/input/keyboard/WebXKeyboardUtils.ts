export class WebXKeyboardUtils {
    public static keysymFromCharCode(codepoint: number) {

        const isControlCharacter = (codepoint: number) => {
            return codepoint <= 0x1F || (codepoint >= 0x7F && codepoint <= 0x9F);
        }

        // Keysyms for control characters
        if (isControlCharacter(codepoint)) {
            return 0xFF00 | codepoint;
        }

        // Keysyms for ASCII chars
        if (codepoint >= 0x0000 && codepoint <= 0x00FF) {
            return codepoint;
        }

        // Keysyms for Unicode
        if (codepoint >= 0x0100 && codepoint <= 0x10FFFF) {
            return 0x01000000 | codepoint;
        }

        return null;
    }

}