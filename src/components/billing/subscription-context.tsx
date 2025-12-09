"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";

type Tier = 'free' | 'pro';

interface SubscriptionContextType {
    tier: Tier;
    isLoading: boolean;
    isPro: boolean;
    checkAccess: (feature: 'projects' | 'services' | 'search') => boolean;
    remainingProjects: number | 'unlimited';
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [tier, setTier] = useState<Tier>('free');
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
                    .select('tier')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setTier(profile.tier as Tier);
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

    const isPro = tier === 'pro';

    const checkAccess = (feature: 'projects' | 'services' | 'search') => {
        if (isPro) return true;

        switch (feature) {
            case 'projects':
                return projectCount < 3;
            case 'services':
                // We'll need to fetch service count if we want strict enforcement, 
                // for now we assume UI handles it or we'll add it later.
                return true;
            case 'search':
                return false; // Free tier has no global search
            default:
                return false;
        }
    };

    const remainingProjects = isPro ? 'unlimited' : Math.max(0, 3 - projectCount);

    return (
        <SubscriptionContext.Provider value={{
            tier,
            isLoading,
            isPro,
            checkAccess,
            remainingProjects
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
