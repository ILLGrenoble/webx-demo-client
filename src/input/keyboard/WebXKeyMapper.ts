import { WebXKey } from "./WebXKey";

export class WebXKeyMapper {

    /**
    * Map of known JavaScript keycodes which do not map to typable characters
    * to their X11 keysym equivalents.
    */
    private static keycodeKeySymbols: Map<number, Array<number>> = new Map(
        [
            [8, [0xFF08]], // backspace
            [9, [0xFF09]], // tab
            [12, [0xFF0B, 0xFF0B, 0xFF0B, 0xFFB5]], // clear       / KP 5
            [13, [0xFF0D]], // enter
            [16, [0xFFE1, 0xFFE1, 0xFFE2]], // shift
            [17, [0xFFE3, 0xFFE3, 0xFFE4]], // ctrl
            [18, [0xFFE9, 0xFFE9, 0xFE03]], // alt
            [19, [0xFF13]], // pause/break
            [20, [0xFFE5]], // caps lock
            [27, [0xFF1B]], // escape
            [32, [0x0020]], // space
            [33, [0xFF55, 0xFF55, 0xFF55, 0xFFB9]], // page up      / KP 9
            [34, [0xFF56, 0xFF56, 0xFF56, 0xFFB3]], // page down    / KP 3
            [35, [0xFF57, 0xFF57, 0xFF57, 0xFFB1]], // end          / KP1
            [36, [0xFF50, 0xFF50, 0xFF50, 0xFFB7]], // home         / KP7
            [37, [0xFF51, 0xFF51, 0xFF51, 0xFFB4]], // left arrow   / KP 4
            [38, [0xFF52, 0xFF52, 0xFF52, 0xFFB8]], // up arrow     / KP 8
            [39, [0xFF53, 0xFF53, 0xFF53, 0xFFB6]], // right arrow  / KP 6
            [40, [0xFF54, 0xFF54, 0xFF54, 0xFFB2]], // down arrow   / KP 2
            [45, [0xFF63, 0xFF63, 0xFF63, 0xFFB0]], // insert       / KP 0
            [46, [0xFFFF, 0xFFFF, 0xFFFF, 0xFFAE]], // delete       / KP decimal
            [91, [0xFFEB]], // left window key (hyper_l)
            [92, [0xFF67]], // right window key (menu key?)
            [93, null],     // select key
            [96, [0xFFB0]], // KP 0
            [97, [0xFFB1]], // KP 1
            [98, [0xFFB2]], // KP 2
            [99, [0xFFB3]], // KP 3
            [100, [0xFFB4]], // KP 4
            [101, [0xFFB5]], // KP 5
            [102, [0xFFB6]], // KP 6
            [103, [0xFFB7]], // KP 7
            [104, [0xFFB8]], // KP 8
            [105, [0xFFB9]], // KP 9
            [106, [0xFFAA]], // KP multiply
            [107, [0xFFAB]], // KP add
            [109, [0xFFAD]], // KP subtract
            [110, [0xFFAE]], // KP decimal
            [111, [0xFFAF]], // KP divide
            [112, [0xFFBE]], // f1
            [113, [0xFFBF]], // f2
            [114, [0xFFC0]], // f3
            [115, [0xFFC1]], // f4
            [116, [0xFFC2]], // f5
            [117, [0xFFC3]], // f6
            [118, [0xFFC4]], // f7
            [119, [0xFFC5]], // f8
            [120, [0xFFC6]], // f9
            [121, [0xFFC7]], // f10
            [122, [0xFFC8]], // f11
            [123, [0xFFC9]], // f12
            [144, [0xFF7F]], // num lock
            [145, [0xFF14]], // scroll lock
            [225, [0xFE03]]  // altgraph (iso_level3_shift)

        ]
    );


    private static nonRepeatableKeys: Array<number> = [
        0xFE03, // ISO Level 3 Shift (AltGr)
        0xFFE1, // Left shift
        0xFFE2, // Right shift
        0xFFE3, // Left ctrl 
        0xFFE4, // Right ctrl 
        0xFFE5, // Caps Lock
        0xFFE7, // Left meta 
        0xFFE8, // Right meta 
        0xFFE9, // Left alt
        0xFFEA, // Right alt
        0xFFEB, // Left hyper
        0xFFEC  // Right hyper
    ];

    /**
     * Check if a given key symbol is repeatable
     * @param keySymbol the key to check
     */
    public isKeyRepeatable(keySymbol: number): boolean {
        const nonRepeatableKeys = WebXKeyMapper.nonRepeatableKeys;
        return nonRepeatableKeys[keySymbol] ? false : true;
    }

    /**
     * Map of known JavaScript keyidentifiers which do not map to typable
     * characters to their unshifted X11 keysym equivalents.
     */
    private static keyidentifierKeySymbols: Map<string, Array<number>> = new Map(
        [
            ['Again', [0xFF66]],
            ['AllCandidates', [0xFF3D]],
            ['Alphanumeric', [0xFF30]],
            ['Alt', [0xFFE9, 0xFFE9, 0xFE03]],
            ['Attn', [0xFD0E]],
            ['AltGraph', [0xFE03]],
            ['ArrowDown', [0xFF54]],
            ['ArrowLeft', [0xFF51]],
            ['ArrowRight', [0xFF53]],
            ['ArrowUp', [0xFF52]],
            ['Backspace', [0xFF08]],
            ['CapsLock', [0xFFE5]],
            ['Cancel', [0xFF69]],
            ['Clear', [0xFF0B]],
            ['Convert', [0xFF21]],
            ['Copy', [0xFD15]],
            ['Crsel', [0xFD1C]],
            ['CrSel', [0xFD1C]],
            ['CodeInput', [0xFF37]],
            ['Compose', [0xFF20]],
            ['Control', [0xFFE3, 0xFFE3, 0xFFE4]],
            ['ContextMenu', [0xFF67]],
            ['Delete', [0xFFFF]],
            ['Down', [0xFF54]],
            ['End', [0xFF57]],
            ['Enter', [0xFF0D]],
            ['EraseEof', [0xFD06]],
            ['Escape', [0xFF1B]],
            ['Execute', [0xFF62]],
            ['Exsel', [0xFD1D]],
            ['ExSel', [0xFD1D]],
            ['F1', [0xFFBE]],
            ['F2', [0xFFBF]],
            ['F3', [0xFFC0]],
            ['F4', [0xFFC1]],
            ['F5', [0xFFC2]],
            ['F6', [0xFFC3]],
            ['F7', [0xFFC4]],
            ['F8', [0xFFC5]],
            ['F9', [0xFFC6]],
            ['F10', [0xFFC7]],
            ['F11', [0xFFC8]],
            ['F12', [0xFFC9]],
            ['F13', [0xFFCA]],
            ['F14', [0xFFCB]],
            ['F15', [0xFFCC]],
            ['F16', [0xFFCD]],
            ['F17', [0xFFCE]],
            ['F18', [0xFFCF]],
            ['F19', [0xFFD0]],
            ['F20', [0xFFD1]],
            ['F21', [0xFFD2]],
            ['F22', [0xFFD3]],
            ['F23', [0xFFD4]],
            ['F24', [0xFFD5]],
            ['Find', [0xFF68]],
            ['GroupFirst', [0xFE0C]],
            ['GroupLast', [0xFE0E]],
            ['GroupNext', [0xFE08]],
            ['GroupPrevious', [0xFE0A]],
            ['FullWidth', null],
            ['HalfWidth', null],
            ['HangulMode', [0xFF31]],
            ['Hankaku', [0xFF29]],
            ['HanjaMode', [0xFF34]],
            ['Help', [0xFF6A]],
            ['Hiragana', [0xFF25]],
            ['HiraganaKatakana', [0xFF27]],
            ['Home', [0xFF50]],
            ['Hyper', [0xFFED, 0xFFED, 0xFFEE]],
            ['Insert', [0xFF63]],
            ['JapaneseHiragana', [0xFF25]],
            ['JapaneseKatakana', [0xFF26]],
            ['JapaneseRomaji', [0xFF24]],
            ['JunjaMode', [0xFF38]],
            ['KanaMode', [0xFF2D]],
            ['KanjiMode', [0xFF21]],
            ['Katakana', [0xFF26]],
            ['Left', [0xFF51]],
            ['Meta', [0xFFE7, 0xFFE7, 0xFFE8]],
            ['ModeChange', [0xFF7E]],
            ['NumLock', [0xFF7F]],
            ['PageDown', [0xFF56]],
            ['PageUp', [0xFF55]],
            ['Pause', [0xFF13]],
            ['Play', [0xFD16]],
            ['PreviousCandidate', [0xFF3E]],
            ['PrintScreen', [0xFF61]],
            ['Redo', [0xFF66]],
            ['Right', [0xFF53]],
            ['RomanCharacters', null],
            ['Scroll', [0xFF14]],
            ['Select', [0xFF60]],
            ['Separator', [0xFFAC]],
            ['Shift', [0xFFE1, 0xFFE1, 0xFFE2]],
            ['SingleCandidate', [0xFF3C]],
            ['Super', [0xFFEB, 0xFFEB, 0xFFEC]],
            ['Tab', [0xFF09]],
            ['UIKeyInputDownArrow', [0xFF54]],
            ['UIKeyInputEscape', [0xFF1B]],
            ['UIKeyInputLeftArrow', [0xFF51]],
            ['UIKeyInputRightArrow', [0xFF53]],
            ['UIKeyInputUpArrow', [0xFF52]],
            ['Up', [0xFF52]],
            ['Undo', [0xFF65]],
            ['Win', [0xFFEB]],
            ['Zenkaku', [0xFF28]],
            ['ZenkakuHankaku', [0xFF2A]]
        ]
    );

    /**
     * Look up an X11 key symbol for a given JavaScript key code
     * @param keyCode the key code to lookup
     */
    public lookupX11KeySymbolByJavaScriptKeyCode(keyCode: number): number[] {
        const keycodeKeySymbols = WebXKeyMapper.keycodeKeySymbols;
        return keycodeKeySymbols.get(keyCode);
    }

    /**
     * Look up an X11 symbol for a given JavaScript identifier;
     * @param identifier the identifier to lookup
     */
    public lookupX11KeySymbolByJavascriptKeyIdentifier(identifier: string): number[] {
        const keyidentifierKeySymbols = WebXKeyMapper.keyidentifierKeySymbols;
        return keyidentifierKeySymbols.get(identifier);
    }
}