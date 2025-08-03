import { useState, useEffect } from 'react';
import { ChecklistItem, SDOHQuestion } from '@/types';

export const useChecklistData = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const response = await fetch('/src/data/checklist.csv');
        if (!response.ok) throw new Error('Failed to fetch checklist data');
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            item_key: values[0],
            label_key: values[1],
            description_key: values[2],
            code: values[3],
            code_system: values[4]
          };
        });
        
        setChecklist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, []);

  return { checklist, loading, error };
};

export const useSDOHData = () => {
  const [sdohQuestions, setSDOHQuestions] = useState<SDOHQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSDOH = async () => {
      try {
        const response = await fetch('/src/data/sdoh.csv');
        if (!response.ok) throw new Error('Failed to fetch SDOH data');
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: values[0],
            label_key: values[1],
            opt1_key: values[2],
            opt2_key: values[3],
            opt3_key: values[4],
            code: values[5],
            code_system: values[6]
          };
        });
        
        setSDOHQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadSDOH();
  }, []);

  return { sdohQuestions, loading, error };
};