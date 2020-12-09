/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type {
    RuleListener,
    RuleModule,
    PartialRuleModule,
    RuleContext,
} from "../types"
import type { Rule } from "eslint"
import type { AST } from "yaml-eslint-parser"
import * as yamlESLintParser from "yaml-eslint-parser"
import debug from "debug"
const log = debug("eslint-plugin-yml:utils/index")

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
    ruleName: string,
    rule: PartialRuleModule,
): RuleModule {
    return {
        meta: {
            ...rule.meta,
            docs: {
                ...rule.meta.docs,
                url: `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
                ruleId: `yml/${ruleName}`,
                ruleName,
            },
        },
        create(context: Rule.RuleContext): any {
            if (
                typeof context.parserServices.defineCustomBlocksVisitor ===
                "function"
            ) {
                return context.parserServices.defineCustomBlocksVisitor(
                    context,
                    yamlESLintParser,
                    {
                        target(lang: string | null) {
                            if (lang) {
                                return /^ya?ml$/i.test(lang)
                            }
                            return false
                        },
                        create(blockContext: Rule.RuleContext) {
                            return rule.create(blockContext as any, {
                                customBlock: true,
                            })
                        },
                    },
                )
            }
            return rule.create(context as any, {
                customBlock: false,
            })
        },
    }
}

type CoreRuleListener = {
    [key: string]: (node: any) => void
}
/**
 * Define the wrapped core rule.
 */
export function defineWrapperListener(
    coreRule: Rule.RuleModule,
    context: RuleContext,
    proxyOptions: {
        options: any[]
        createListenerProxy?: (listener: CoreRuleListener) => RuleListener
    },
): RuleListener {
    if (!context.parserServices.isYAML) {
        return {}
    }
    const listener = coreRule.create({
        // @ts-expect-error -- proto
        // eslint-disable-next-line @typescript-eslint/naming-convention -- proto
        __proto__: context,
        options: proxyOptions.options,
    }) as RuleListener

    const yamlListener =
        proxyOptions.createListenerProxy?.(listener as CoreRuleListener) ??
        listener

    return yamlListener
}

/**
 * Get the proxy node
 */
export function getProxyNode(node: AST.YAMLNode, properties: any): any {
    const safeKeys = new Set<string | number | symbol>([
        "range",
        "typeAnnotation",
    ])
    const cache: any = {}
    return new Proxy(node, {
        get(_t, key) {
            if (key in cache) {
                return cache[key]
            }
            if (key in properties) {
                return (cache[key] = properties[key])
            }
            if (!safeKeys.has(key)) {
                log(`fallback: ${String(key)}`)
            }
            return (node as any)[key]
        },
    })
}

/**
 *  Check whether a given value is a node.
 */
export function isNode(data: any): boolean {
    return (
        data &&
        typeof data.type === "string" &&
        Array.isArray(data.range) &&
        data.range.length === 2 &&
        typeof data.range[0] === "number" &&
        typeof data.range[1] === "number"
    )
}

let ruleMap: Map<string, Rule.RuleModule> | null = null

/**
 * Get the core rule implementation from the rule name
 */
export function getCoreRule(ruleName: string): Rule.RuleModule {
    let map: Map<string, Rule.RuleModule>
    if (ruleMap) {
        map = ruleMap
    } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- load eslint
        ruleMap = map = new (require("eslint").Linter)().getRules()
    }
    return map.get(ruleName)!
}
