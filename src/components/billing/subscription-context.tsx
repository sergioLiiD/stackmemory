"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";

type Tier = 'free' | 'pro' | 'founder';

interface SubscriptionContextType {
    tier: Tier;
    isLoading: boolean;
    isPro: boolean;
    checkAccess: (feature: 'projects' | 'services' | 'search' | 'chat' | 'insight') => boolean;
    remainingProjects: number | 'unlimited';
    usage: {
        chat: { current: number, limit: number },
        insight: { current: number, limit: number }
    };
    trialEndsAt: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [tier, setTier] = useState<Tier>('free');
    const [customLimit, setCustomLimit] = useState<number | null>(null);
    const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [projectCount, setProjectCount] = useState(0);
    const [usage, setUsage] = useState({
        chat: { current: 0, limit: 20 },
        insight: { current: 0, limit: 1 }
    });

    useEffect(() => {
        async function fetchSubscription() {
            if (!user || !supabase) {
                setTier('free');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier, custom_project_limit, pro_trial_ends_at, usage_count_chat, usage_limit_chat, usage_count_insight, usage_limit_insight')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setTier(profile.tier as Tier);
                    setCustomLimit(profile.custom_project_limit);
                    setTrialEndsAt(profile.pro_trial_ends_at);

                    const isPaid = profile.tier === 'pro' || profile.tier === 'founder';
                    setUsage({
                        chat: {
                            current: profile.usage_count_chat || 0,
                            limit: profile.usage_limit_chat || (isPaid ? 500 : 20)
                        },
                        insight: {
                            current: profile.usage_count_insight || 0,
                            limit: profile.usage_limit_insight || (isPaid ? 50 : 1)
                        }
                    });
                }

                // Fetch Usage (e.g., project count)
                const { count } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setProjectCount(count || 0);

            } catch (error) {
                console.error("Error fetching subscription:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSubscription();
    }, [user]);

    const isAdmin = user?.email && ['sergio@ideapunkt.de', 'sergio@liid.mx'].includes(user.email);
    const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date();

    const isPro = isAdmin || isTrialActive || tier === 'pro' || tier === 'founder';

    const checkAccess = (feature: 'projects' | 'services' | 'search' | 'chat' | 'insight') => {
        if (isAdmin) return true;
        switch (feature) {
            case 'projects':
                if (customLimit !== null) return projectCount < customLimit;
                if (tier === 'founder' || tier === 'pro' || isTrialActive) return true; // Unlimited for paid plans
                return projectCount < 1; // Free limit set to 1
            case 'services':
                return true;
            case 'search':
                return isPro; // Only Pro/Founder has global/semantic search
            case 'chat':
                return usage.chat.current < usage.chat.limit;
            case 'insight':
                return usage.insight.current < usage.insight.limit;
            default:
                return false;
        }
    };

    const getMaxProjects = () => {
        if (isAdmin) return 9999;
        if (customLimit !== null) return customLimit;
        if (tier === 'founder' || tier === 'pro') return 9999;
        return 1;
    };

    const remainingProjects = isAdmin ? 'unlimited' : Math.max(0, getMaxProjects() - projectCount);

    return (
        <SubscriptionContext.Provider value={{
            tier,
            isLoading,
            isPro,
            checkAccess,
            remainingProjects,
            usage,
            trialEndsAt
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}
