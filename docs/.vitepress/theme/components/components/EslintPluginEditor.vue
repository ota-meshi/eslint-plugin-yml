<template>
  <eslint-editor
    ref="editor"
    :linter="linter"
    :config="config"
    :code="code"
    class="eslint-code-block"
    :language="language"
    :filename="fileName"
    :dark="dark"
    :format="format"
    :fix="fix"
    @update:code="$emit('update:code', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import EslintEditor from "@ota-meshi/site-kit-eslint-editor-vue";
import { loadMonacoEditor } from "@ota-meshi/site-kit-monaco-editor";
import { Linter } from "eslint";
import { rules } from "../../../../../src/utils/rules";

export default {
  name: "EslintPluginEditor",
  components: { EslintEditor },
  model: {
    prop: "code",
  },
  props: {
    code: {
      type: String,
      default: "",
    },
    fix: {
      type: Boolean,
    },
    rules: {
      type: Object,
      default() {
        return {};
      },
    },
    dark: {
      type: Boolean,
    },
    language: {
      type: String,
      default: "yaml",
    },
    fileName: {
      type: String,
      default: "a.yaml",
    },
    parser: {
      type: String,
      default: "yaml-eslint-parser",
    },
  },
  emits: ["update:code", "change"],

  data() {
    return {
      espree: null,
      yamlESLintParser: null,
      vueESLintParser: null,
      format: {
        insertSpaces: true,
        tabSize: 2,
      },
    };
  },

  computed: {
    config() {
      return [
        {
          files: ["*.*"],
          plugins: {
            yml: {
              rules: Object.fromEntries(
                rules.map((rule) => [rule.meta.docs.ruleName, rule]),
              ),
            },
          },
          rules: this.rules,
        },
        {
          files: ["*.yaml", "*.yml", "**/*.yml", "**/*.yaml"],
          languageOptions: {
            parser: this.yamlESLintParser,
          },
        },
        {
          files: ["*.vue", "**/*.vue"],
          languageOptions: {
            parser: this.vueESLintParser,
          },
        },
      ];
    },
    linter() {
      if (!this.yamlESLintParser || !this.vueESLintParser) {
        return null;
      }
      const linter = new Linter();
      return linter;
    },
  },

  async mounted() {
    // Load parser asynchronously.
    const [espree, yamlESLintParser, vueESLintParser] = await Promise.all([
      import("espree"),
      import("yaml-eslint-parser"),
      import("vue-eslint-parser"),
    ]);
    this.espree = espree;
    this.yamlESLintParser = yamlESLintParser;
    this.vueESLintParser = vueESLintParser;

    const monaco = await loadMonacoEditor();
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      validate: false,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      validate: false,
    });
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
    });

    const editorVue = this.$refs.editor.$refs.monacoEditorRef;
    for (const editor of [
      editorVue.getLeftEditor(),
      editorVue.getRightEditor(),
    ]) {
      editor?.onDidChangeModelDecorations(() =>
        this.onDidChangeModelDecorations(editor),
      );
    }
  },

  methods: {
    async onDidChangeModelDecorations(editor) {
      const monaco = await loadMonacoEditor();
      const model = editor.getModel();
      monaco.editor.setModelMarkers(model, "yaml", []);
    },
  },
};
</script>

<style scoped>
.eslint-code-block {
  width: 100%;
  margin: 1em 0;
}
</style>
