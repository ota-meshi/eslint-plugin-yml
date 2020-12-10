import type { RuleModule } from "../types"
import blockMapping from "../rules/block-mapping"
import blockSequence from "../rules/block-sequence"
import flowMappingCurlyNewline from "../rules/flow-mapping-curly-newline"
import flowMappingCurlySpacing from "../rules/flow-mapping-curly-spacing"
import flowSequenceBracketNewline from "../rules/flow-sequence-bracket-newline"
import flowSequenceBracketSpacing from "../rules/flow-sequence-bracket-spacing"
import indent from "../rules/indent"
import keyNameCasing from "../rules/key-name-casing"
import noIrregularWhitespace from "../rules/no-irregular-whitespace"
import noTabIndent from "../rules/no-tab-indent"
import spacedComment from "../rules/spaced-comment"
import vueCustomBlockNoParsingError from "../rules/vue-custom-block/no-parsing-error"

export const rules = [
    blockMapping,
    blockSequence,
    flowMappingCurlyNewline,
    flowMappingCurlySpacing,
    flowSequenceBracketNewline,
    flowSequenceBracketSpacing,
    indent,
    keyNameCasing,
    noIrregularWhitespace,
    noTabIndent,
    spacedComment,
    vueCustomBlockNoParsingError,
] as RuleModule[]
