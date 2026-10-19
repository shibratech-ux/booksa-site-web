import { useEffect, useState } from 'react';
import { readPublishReadiness, type PublishReadiness } from '@/domain/publish-readiness';
import { completeSimulatedIdentityReview } from '@/services/identity-verification.service';
import { getLoggedInUserProfile } from '@/services/user.service';

export type PublishReadinessState = { status: 'loading' | 'error' } | ({ status: 'loaded' } & PublishReadiness);

/**
 * Loads the host's phone and identity verification from `users/{uid}`. A pending simulated identity
 * review is completed when its review time passes. Bump `refreshKey` after a verification flow closes.
 */
export function usePublishReadiness(userId: string | undefined, refreshKey: number): PublishReadinessState {
  const [state, setState] = useState<PublishReadinessState>({ status: 'loading' });
  const pendingReviewAt = state.status === 'loaded' && state.identity.status === 'pending' ? state.identity.reviewAt : null;

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    const load = async () => {
      try {
        if (!userId) throw new Error('No current account.');
        const profile = await getLoggedInUserProfile(userId);
        if (active) setState({ status: 'loaded', ...readPublishReadiness(profile, userId) });
      } catch {
        if (active) setState({ status: 'error' });
      }
    };
    void load();
    return () => { active = false; };
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!userId || pendingReviewAt === null) return;
    let active = true;
    const timer = window.setTimeout(() => {
      completeSimulatedIdentityReview(userId)
        .then(identity => {
          if (!active) return;
          setState(current => current.status === 'loaded'
            ? { ...current, identity, ready: current.phoneVerified && identity.status === 'verified' }
            : current);
        })
        .catch(() => { if (active) setState({ status: 'error' }); });
    }, Math.max(0, pendingReviewAt - Date.now()));
    return () => { active = false; window.clearTimeout(timer); };
  }, [userId, pendingReviewAt]);

  return state;
}
