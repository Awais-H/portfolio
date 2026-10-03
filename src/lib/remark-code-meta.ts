// Just the bits of the mdast tree this plugin touches.
type MdastNode = {
    type: string;
    meta?: string | null;
    data?: { hProperties?: Record<string, unknown> };
    children?: MdastNode[];
};

/**
 * Copies a code fence's meta string (```ts title="foo.ts") onto the rendered
 * <code> element as data-meta, plus data-title when a title is given.
 */
export function remarkCodeMeta() {
    return (tree: MdastNode) => {
        const walk = (node: MdastNode) => {
            if (node.type === "code" && node.meta) {
                const hProperties = ((node.data ??= {}).hProperties ??= {});
                hProperties["data-meta"] = node.meta;

                const titleMatch = node.meta.match(/title="([^"]+)"/);
                if (titleMatch?.[1]) {
                    hProperties["data-title"] = titleMatch[1];
                }
            }

            node.children?.forEach(walk);
        };

        walk(tree);
    };
}
