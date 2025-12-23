"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";

type Tier = 'free' | 'pro' | 'founder';

interface SubscriptionContextType {
    tier: Tier;
    isLoading: boolean;
    isPro: boolean;
    checkAccess: (feature: 'projects' | 'services' | 'search') => boolean;
    remainingProjects: number | 'unlimited';
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
                    .select('tier, custom_project_limit, pro_trial_ends_at')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setTier(profile.tier as Tier);
                    setCustomLimit(profile.custom_project_limit);
                    setTrialEndsAt(profile.pro_trial_ends_at);
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

    const checkAccess = (feature: 'projects' | 'services' | 'search') => {
        if (isAdmin) return true;
        switch (feature) {
            case 'projects':
                if (customLimit !== null) return projectCount < customLimit;
                if (tier === 'founder') return projectCount < 100;
                if (tier === 'pro' || isTrialActive) return projectCount < 50;
                return projectCount < 5; // Free limit increased to 5
            case 'services':
                return true;
            case 'search':
                return isPro; // Only Pro/Founder has global/semantic search
            default:
                return false;
        }
    };

    const getMaxProjects = () => {
        if (isAdmin) return 9999;
        if (customLimit !== null) return customLimit;
        if (tier === 'founder') return 100;
        if (tier === 'pro') return 50;
        return 5;
    };

    const remainingProjects = isAdmin ? 'unlimited' : Math.max(0, getMaxProjects() - projectCount);

    return (
        <SubscriptionContext.Provider value={{
            tier,
            isLoading,
            isPro,
            checkAccess,
            remainingProjects,
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
