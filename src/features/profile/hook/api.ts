import { useState, useEffect, useCallback } from 'react';
import { GetProfileParams, GetProfileResponse, UserProfile } from '../types';
import * as ProfileService from '../service/client';

export function useProfile(userId: string) {
  const [data, setData] = useState<GetProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: GetProfileParams = {
        userId,
      };

      const result = await ProfileService.getProfile(params);
      setData(result);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Calculate XP percentage
  const xpPercentage = data?.profile ?
    Math.round((data.profile.currentXP / data.profile.nextLevelXP) * 100) : 0;

  return {
    profile: data?.profile,
    isLoading,
    error,
    xpPercentage,
    refresh: fetchProfile
  };
}

export function useStatConfig() {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ProfileService.getStatConfig();
      setConfig(result);
    } catch (err) {
      console.error('Error fetching stat config:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stat config'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatConfig();
  }, [fetchStatConfig]);

  return {
    config,
    isLoading,
    error,
    refresh: fetchStatConfig
  };
}
