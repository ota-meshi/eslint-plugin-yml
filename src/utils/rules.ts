// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.ts";
import blockMappingColonIndicatorNewline from "../rules/block-mapping-colon-indicator-newline.ts";
import blockMappingQuestionIndicatorNewline from "../rules/block-mapping-question-indicator-newline.ts";
import blockMapping from "../rules/block-mapping.ts";
import blockSequenceHyphenIndicatorNewline from "../rules/block-sequence-hyphen-indicator-newline.ts";
import blockSequence from "../rules/block-sequence.ts";
import fileExtension from "../rules/file-extension.ts";
import flowMappingCurlyNewline from "../rules/flow-mapping-curly-newline.ts";
import flowMappingCurlySpacing from "../rules/flow-mapping-curly-spacing.ts";
import flowSequenceBracketNewline from "../rules/flow-sequence-bracket-newline.ts";
import flowSequenceBracketSpacing from "../rules/flow-sequence-bracket-spacing.ts";
import indent from "../rules/indent.ts";
import keyNameCasing from "../rules/key-name-casing.ts";
import keySpacing from "../rules/key-spacing.ts";
import noEmptyDocument from "../rules/no-empty-document.ts";
import noEmptyKey from "../rules/no-empty-key.ts";
import noEmptyMappingValue from "../rules/no-empty-mapping-value.ts";
import noEmptySequenceEntry from "../rules/no-empty-sequence-entry.ts";
import noIrregularWhitespace from "../rules/no-irregular-whitespace.ts";
import noMultipleEmptyLines from "../rules/no-multiple-empty-lines.ts";
import noTabIndent from "../rules/no-tab-indent.ts";
import noTrailingZeros from "../rules/no-trailing-zeros.ts";
import plainScalar from "../rules/plain-scalar.ts";
import quotes from "../rules/quotes.ts";
import requireStringKey from "../rules/require-string-key.ts";
import sortKeys from "../rules/sort-keys.ts";
import sortSequenceValues from "../rules/sort-sequence-values.ts";
import spacedComment from "../rules/spaced-comment.ts";
import vueCustomBlockNoParsingError from "../rules/vue-custom-block/no-parsing-error.ts";

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
