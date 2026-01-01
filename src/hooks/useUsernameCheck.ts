import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const generateSuggestions = (username: string): string[] => {
  const suggestions: string[] = [];
  const baseUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Add random numbers
  suggestions.push(`${baseUsername}${Math.floor(Math.random() * 99) + 1}`);
  
  // Add prefixes
  const prefixes = ['br', 'real', 'a', 'o', 'minha', 'eu'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  suggestions.push(`${randomPrefix}_${baseUsername}`);
  
  // Add suffix with year or random
  const suffixes = ['_br', '_oficial', `_${new Date().getFullYear()}`];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  suggestions.push(`${baseUsername}${randomSuffix}`);
  
  return suggestions;
};

export const useUsernameCheck = (username: string) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const checkSingleUsername = useCallback(async (name: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('check_username_available', { username_to_check: name });
    
    if (error) throw error;
    return data as boolean;
  }, []);

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setSuggestions([]);
      
      try {
        const available = await checkSingleUsername(username);
        setIsAvailable(available);
        
        // If not available, generate and validate suggestions
        if (!available) {
          const potentialSuggestions = generateSuggestions(username);
          const validSuggestions: string[] = [];
          
          // Check each suggestion in parallel
          const results = await Promise.all(
            potentialSuggestions.map(async (suggestion) => {
              const isValid = await checkSingleUsername(suggestion);
              return { suggestion, isValid };
            })
          );
          
          results.forEach(({ suggestion, isValid }) => {
            if (isValid && validSuggestions.length < 3) {
              validSuggestions.push(suggestion);
            }
          });
          
          setSuggestions(validSuggestions);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setIsAvailable(null);
        setSuggestions([]);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [username, checkSingleUsername]);

  return { isAvailable, isChecking, suggestions };
};