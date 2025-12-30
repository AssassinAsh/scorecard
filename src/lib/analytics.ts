/**
 * Google Analytics 4 utilities for tracking user behavior and traffic
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Track page views
 */
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
};

/**
 * Track tournament events
 */
export const trackTournament = {
  created: (tournamentId: string) =>
    trackEvent("tournament_created", { tournament_id: tournamentId }),
  viewed: (tournamentId: string) =>
    trackEvent("tournament_viewed", { tournament_id: tournamentId }),
};

/**
 * Track match events
 */
export const trackMatch = {
  created: (matchId: string, tournamentId: string) =>
    trackEvent("match_created", {
      match_id: matchId,
      tournament_id: tournamentId,
    }),
  viewed: (matchId: string, viewType: "scorecard" | "scoring" | "display") =>
    trackEvent("match_viewed", { match_id: matchId, view_type: viewType }),
  tossRecorded: (matchId: string) =>
    trackEvent("toss_recorded", { match_id: matchId }),
  started: (matchId: string) =>
    trackEvent("match_started", { match_id: matchId }),
  inningsStarted: (matchId: string, inningsNumber: number) =>
    trackEvent("innings_started", {
      match_id: matchId,
      innings: inningsNumber,
    }),
  completed: (matchId: string, winnerTeam: string) =>
    trackEvent("match_completed", { match_id: matchId, winner: winnerTeam }),
};

/**
 * Track scoring events
 */
export const trackScoring = {
  ballRecorded: (params: {
    matchId: string;
    runs: number;
    isWicket: boolean;
    extrasType: string;
  }) =>
    trackEvent("ball_recorded", {
      match_id: params.matchId,
      runs: params.runs,
      is_wicket: params.isWicket,
      extras_type: params.extrasType,
    }),
  wicketTaken: (matchId: string, wicketType: string) =>
    trackEvent("wicket_taken", { match_id: matchId, wicket_type: wicketType }),
  overCompleted: (matchId: string, overNumber: number) =>
    trackEvent("over_completed", {
      match_id: matchId,
      over_number: overNumber,
    }),
  ballDeleted: (matchId: string) =>
    trackEvent("ball_deleted", { match_id: matchId }),
};

/**
 * Track display page events
 */
export const trackDisplay = {
  opened: (matchId: string) =>
    trackEvent("display_opened", { match_id: matchId }),
  fullscreen: (matchId: string, enabled: boolean) =>
    trackEvent("display_fullscreen", {
      match_id: matchId,
      enabled: enabled,
    }),
};

/**
 * Track user authentication events
 */
export const trackAuth = {
  login: () => trackEvent("login"),
  logout: () => trackEvent("logout"),
};
