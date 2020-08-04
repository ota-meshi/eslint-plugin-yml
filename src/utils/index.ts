import type {
    RuleListener,
    RuleModule,
    PartialRuleModule,
    RuleContext,
} from "../types"
import type { Rule } from "eslint"
import type { AST } from "yaml-eslint-parser"
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
        create: rule.create as any,
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
        // @ts-expect-error
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
    const safeKeys = new Set<string | number | symbol>(["range"])
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
