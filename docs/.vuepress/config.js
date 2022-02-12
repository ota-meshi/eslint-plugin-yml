const path = require("path")
// eslint-disable-next-line node/no-missing-require -- no build
const { rules } = require("../../lib/utils/rules")

function ruleToLink({
    meta: {
        docs: { ruleId, ruleName },
    },
}) {
    return [`/rules/${ruleName}`, ruleId]
}

module.exports = {
    base: "/eslint-plugin-yml/",
    title: "eslint-plugin-yml",
    description: "ESLint plugin provides linting rules for YAML",
    serviceWorker: true,
    evergreen: true,
    configureWebpack(_config, _isServer) {
        return {
            resolve: {
                alias: {
                    module: require.resolve("./shim/module"),
                    eslint$: path.resolve(__dirname, "./shim/eslint"),
                    esquery: path.resolve(
                        __dirname,
                        "../../node_modules/esquery/dist/esquery.min.js",
                    ),
                    "@eslint/eslintrc/universal": path.resolve(
                        __dirname,
                        "../../node_modules/@eslint/eslintrc/dist/eslintrc-universal.cjs",
                    ),
                },
            },
        }
    },

    head: [["link", { rel: "icon", type: "image/svg", href: "/logo.svg" }]],
    themeConfig: {
        logo: "/logo.svg",
        repo: "ota-meshi/eslint-plugin-yml",
        docsRepo: "ota-meshi/eslint-plugin-yml",
        docsDir: "docs",
        docsBranch: "master",
        editLinks: true,
        lastUpdated: true,
        serviceWorker: {
            updatePopup: true,
        },

        nav: [
            { text: "Introduction", link: "/" },
            { text: "User Guide", link: "/user-guide/" },
            { text: "Rules", link: "/rules/" },
            { text: "Playground", link: "/playground/" },
        ],

        sidebar: {
            "/rules/": [
                "/rules/",
                {
                    title: "YAML Rules",
                    collapsable: false,
                    children: rules
                        .filter(
                            (rule) =>
                                !rule.meta.docs.extensionRule &&
                                !rule.meta.deprecated,
                        )
                        .map(ruleToLink),
                },
                ...(rules.some(
                    (rule) =>
                        rule.meta.docs.extensionRule && !rule.meta.deprecated,
                )
                    ? [
                          {
                              title: "Extension Rules",
                              collapsable: false,
                              children: rules
                                  .filter(
                                      (rule) =>
                                          rule.meta.docs.extensionRule &&
                                          !rule.meta.deprecated,
                                  )
                                  .map(ruleToLink),
                          },
                      ]
                    : []),
                // Rules in no category.
                ...(rules.some((rule) => rule.meta.deprecated)
                    ? [
                          {
                              title: "Deprecated",
                              collapsable: false,
                              children: rules
                                  .filter((rule) => rule.meta.deprecated)
                                  .map(ruleToLink),
                          },
                      ]
                    : []),
            ],
            "/": ["/", "/user-guide/", "/rules/", "/playground/"],
        },
    },
}
