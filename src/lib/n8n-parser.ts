export interface N8nNode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    credentials?: Record<string, any>;
    parameters?: Record<string, any>;
}

export interface ParsedWorkflow {
    nodes: string[];
    credentials: string[];
    complexity: number; // Count of nodes
}

export function parseN8nWorkflow(json: any): ParsedWorkflow {
    const rawNodes: N8nNode[] = json.nodes || [];
    const credentialsSet = new Set<string>();
    const nodeTypesSet = new Set<string>();

    rawNodes.forEach(node => {
        // 1. Extract Node Type (clean up 'n8n-nodes-base.' prefix)
        const cleanType = node.type.replace('n8n-nodes-base.', '');
        nodeTypesSet.add(cleanType);

        // 2. Extract Credentials
        if (node.credentials) {
            Object.keys(node.credentials).forEach(credKey => {
                // n8n credential keys are internal IDs, but sometimes descriptive.
                // Depending on the n8n version, it might be { "stripeApi": { "id": "..." } } 
                // or just { "stripeApi": ... }
                // We want the KEY name usually, e.g. "stripeApi", "postgres", "openaiApi"
                credentialsSet.add(credKey);
            });
        }
    });

    return {
        nodes: Array.from(nodeTypesSet),
        credentials: Array.from(credentialsSet),
        complexity: rawNodes.length
    };
}
