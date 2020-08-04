import type { RuleModule } from "../types"
import blockMapping from "../rules/block-mapping"
import blockSequence from "../rules/block-sequence"
import flowMappingCurlyNewline from "../rules/flow-mapping-curly-newline"
import flowMappingCurlySpacing from "../rules/flow-mapping-curly-spacing"
import indent from "../rules/indent"
import noIrregularWhitespace from "../rules/no-irregular-whitespace"
import noTabIndent from "../rules/no-tab-indent"
import spacedComment from "../rules/spaced-comment"

export const rules = [
    blockMapping,
    blockSequence,
    flowMappingCurlyNewline,
    flowMappingCurlySpacing,
    indent,
    noIrregularWhitespace,
    noTabIndent,
    spacedComment,
] as RuleModule[]
