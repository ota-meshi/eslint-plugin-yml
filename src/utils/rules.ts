import type { RuleModule } from "../types"
import blockMapping from "../rules/block-mapping"
import blockSequence from "../rules/block-sequence"
import indent from "../rules/indent"
import noIrregularWhitespace from "../rules/no-irregular-whitespace"
import noTabIndent from "../rules/no-tab-indent"
import spacedComment from "../rules/spaced-comment"

export const rules = [
    blockMapping,
    blockSequence,
    indent,
    noIrregularWhitespace,
    noTabIndent,
    spacedComment,
] as RuleModule[]
