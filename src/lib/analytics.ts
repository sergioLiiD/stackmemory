import posthog from 'posthog-js';

type EventName =
    | 'project_created'
    | 'project_deleted'
    | 'vibe_coder_message_sent'
    | 'mcp_server_added'
    | 'mcp_server_edited'
    | 'journal_entry_created'
    | 'service_added';

export const Analytics = {
    track: (event: EventName, properties?: Record<string, any>) => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            try {
                posthog.capture(event, properties);
            } catch (e) {
                console.error("Failed to track event", event, e);
            }
        }
    },
    identify: (userId: string, traits?: Record<string, any>) => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.identify(userId, traits);
        }
    },
    reset: () => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.reset();
        }
    }
};
