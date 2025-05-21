"use client";

// Custom hooks for Character feature API calls
import { useState, useEffect, useCallback } from 'react';
import { Character, CharacterResponse, Stat, JobClass, LevelRequirement } from '../types';
import { fetchCharacter, allocateStatPoints, fetchJobClasses, fetchXPTable } from '../service/client';

/**
 * Hook to fetch character data
 */
export function useCharacter(id?: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [portrait, setPortrait] = useState<string>('');
  const [jobClass, setJobClass] = useState<JobClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCharacter = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCharacter(id);
      setCharacter(data.character);
      setPortrait(data.portrait);
      setJobClass(data.jobClass);
    } catch (err) {
      console.error("Error loading character:", err);
      setError(err instanceof Error ? err : new Error('ไม่สามารถโหลดข้อมูลตัวละครได้'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Initial data load
  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  // Function to manually refresh the character data
  const refetchCharacter = () => {
    setIsLoading(true);
    loadCharacter();
  };

  return {
    character,
    portrait,
    jobClass,
    isLoading,
    error,
    refetchCharacter
  };
}

/**
 * Hook to fetch all job classes
 */
export function useJobClasses() {
  const [jobClasses, setJobClasses] = useState<JobClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadJobClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchJobClasses();
      setJobClasses(data);
    } catch (err) {
      console.error("Error loading job classes:", err);
      setError(err instanceof Error ? err : new Error('ไม่สามารถโหลดข้อมูลอาชีพได้'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadJobClasses();
  }, [loadJobClasses]);

  return {
    jobClasses,
    isLoading,
    error,
    refetchJobClasses: loadJobClasses
  };
}

/**
 * Hook to fetch XP table
 */
export function useXPTable() {
  const [xpTable, setXPTable] = useState<LevelRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadXPTable = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchXPTable();
      setXPTable(data);
    } catch (err) {
      console.error("Error loading XP table:", err);
      setError(err instanceof Error ? err : new Error('ไม่สามารถโหลดข้อมูลตาราง XP ได้'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadXPTable();
  }, [loadXPTable]);

  return {
    xpTable,
    isLoading,
    error,
    refetchXPTable: loadXPTable
  };
}

/**
 * Hook to handle stat allocation
 */
export function useStatAllocation() {
  const [isAllocating, setIsAllocating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const allocateStats = async (characterId: string, stats: Stat) => {
    try {
      setIsAllocating(true);
      setError(null);
      const updatedCharacter = await allocateStatPoints(characterId, stats);
      return updatedCharacter;
    } catch (err) {
      console.error("Error allocating stats:", err);
      setError(err instanceof Error ? err : new Error('ไม่สามารถจัดสรรสถิติได้'));
      throw err;
    } finally {
      setIsAllocating(false);
    }
  };

  return {
    allocateStats,
    isAllocating,
    error
  };
}
