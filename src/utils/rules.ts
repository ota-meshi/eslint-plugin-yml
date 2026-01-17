// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.js";
import blockMappingColonIndicatorNewline from "../rules/block-mapping-colon-indicator-newline.js";
import blockMappingQuestionIndicatorNewline from "../rules/block-mapping-question-indicator-newline.js";
import blockMapping from "../rules/block-mapping.js";
import blockSequenceHyphenIndicatorNewline from "../rules/block-sequence-hyphen-indicator-newline.js";
import blockSequence from "../rules/block-sequence.js";
import fileExtension from "../rules/file-extension.js";
import flowMappingCurlyNewline from "../rules/flow-mapping-curly-newline.js";
import flowMappingCurlySpacing from "../rules/flow-mapping-curly-spacing.js";
import flowSequenceBracketNewline from "../rules/flow-sequence-bracket-newline.js";
import flowSequenceBracketSpacing from "../rules/flow-sequence-bracket-spacing.js";
import indent from "../rules/indent.js";
import keyNameCasing from "../rules/key-name-casing.js";
import keySpacing from "../rules/key-spacing.js";
import noEmptyDocument from "../rules/no-empty-document.js";
import noEmptyKey from "../rules/no-empty-key.js";
import noEmptyMappingValue from "../rules/no-empty-mapping-value.js";
import noEmptySequenceEntry from "../rules/no-empty-sequence-entry.js";
import noIrregularWhitespace from "../rules/no-irregular-whitespace.js";
import noMultipleEmptyLines from "../rules/no-multiple-empty-lines.js";
import noTabIndent from "../rules/no-tab-indent.js";
import noTrailingZeros from "../rules/no-trailing-zeros.js";
import plainScalar from "../rules/plain-scalar.js";
import quotes from "../rules/quotes.js";
import requireStringKey from "../rules/require-string-key.js";
import sortKeys from "../rules/sort-keys.js";
import sortSequenceValues from "../rules/sort-sequence-values.js";
import spacedComment from "../rules/spaced-comment.js";
import vueCustomBlockNoParsingError from "../rules/vue-custom-block/no-parsing-error.js";

export const rules = [
  blockMappingColonIndicatorNewline,
  blockMappingQuestionIndicatorNewline,
  blockMapping,
  blockSequenceHyphenIndicatorNewline,
  blockSequence,
  fileExtension,
  flowMappingCurlyNewline,
  flowMappingCurlySpacing,
  flowSequenceBracketNewline,
  flowSequenceBracketSpacing,
  indent,
  keyNameCasing,
  keySpacing,
  noEmptyDocument,
  noEmptyKey,
  noEmptyMappingValue,
  noEmptySequenceEntry,
  noIrregularWhitespace,
  noMultipleEmptyLines,
  noTabIndent,
  noTrailingZeros,
  plainScalar,
  quotes,
  requireStringKey,
  sortKeys,
  sortSequenceValues,
  spacedComment,
  vueCustomBlockNoParsingError,
] as RuleModule[];
