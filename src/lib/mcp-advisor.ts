import { MCPServer, StackItem } from "@/data/mock";

interface MCPSuggestion extends MCPServer {
    reason: string;
}

const KNOWN_MCPS: Record<string, Partial<MCPServer> & { keywords: string[] }> = {
    "postgres": {
        name: "PostgreSQL MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@localhost:5432/db"],
        description: "Read-only access to your database schema and data.",
        keywords: ["postgres", "postgresql", "sql", "supabase", "database"],
        status: "suggested"
    },
    "github": {
        name: "GitHub MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "your_token_here" },
        description: "Search issues, view PRs, and read file history.",
        keywords: ["github", "git", "version control"],
        status: "suggested"
    },
    "filesystem": {
        name: "Filesystem MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
        description: "Read/write access to local files.",
        keywords: ["fs", "file", "local", "system"],
        status: "suggested"
    },
    "sentry": {
        name: "Sentry MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sentry"],
        env: { SENTRY_AUTH_TOKEN: "your_token" },
        description: "Query error logs and issues.",
        keywords: ["sentry", "error", "monitoring", "logging"],
        status: "suggested"
    },
    "slack": {
        name: "Slack MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "mcp-server-slack"],
        description: "Read channel history and messages.",
        keywords: ["slack", "messaging", "chat"],
        status: "suggested"
    },
    "puppeteer": {
        name: "Puppeteer MCP",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-puppeteer"],
        description: "Browser automation and scraping.",
        keywords: ["puppeteer", "scraping", "browser", "testing"],
        status: "suggested"
    }
};

export function getMCPSuggestions(stack: StackItem[], existingMCPs: MCPServer[] = []): MCPServer[] {
    const suggestions: MCPServer[] = [];
    const usedKeys = new Set(existingMCPs.map(m => m.name.toLowerCase())); // Simple dedup by name for now

    // 1. Analyze Stack
    stack.forEach(item => {
        const lowerName = item.name.toLowerCase();

        // Check against known MCPs
        Object.entries(KNOWN_MCPS).forEach(([key, config]) => {
            if (config.keywords?.some(k => lowerName.includes(k))) {
                // Check if already installed
                if (!usedKeys.has(config.name!.toLowerCase())) {
                    suggestions.push({
                        id: `suggestion-${key}-${crypto.randomUUID()}`,
                        name: config.name!,
                        type: config.type || 'stdio',
                        command: config.command,
                        args: config.args,
                        env: config.env,
                        description: config.description,
                        status: 'suggested'
                    } as MCPServer);
                    usedKeys.add(config.name!.toLowerCase());
                }
            }
        });
    });

    // 2. Always suggest basic tools if not present? (Optional)
    // For now, strict stack matching.

    return suggestions;
}
