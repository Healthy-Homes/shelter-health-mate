import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface ChecklistRow {
  id: string;
  sectionKey: string;
  itemKey: string;
  descriptionKey: string;
  type: 'yesno' | 'single' | 'multi' | 'text' | 'number';
  optionsKey?: string;
  required?: boolean;
}

export const useChecklistData = (csvPath: string) => {
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(csvPath);
        if (!response.ok) throw new Error('Failed to fetch checklist data');
        const text = await response.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        setRows((parsed.data as any[]).map((r) => ({
          id: String(r.id),
          sectionKey: r.sectionKey,
          itemKey: r.itemKey,
          descriptionKey: r.descriptionKey,
          type: r.type,
          optionsKey: r.optionsKey || undefined,
          required: r.required === 'true'
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    if (csvPath) load();
  }, [csvPath]);

  return { checklist: rows, loading, error };
};

export const useSDOHData = () => {
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/data/sdoh.csv');
        if (!response.ok) throw new Error('Failed to fetch SDOH data');
        const text = await response.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        setRows((parsed.data as any[]).map((r) => ({
          id: String(r.id),
          sectionKey: r.sectionKey,
          itemKey: r.itemKey,
          descriptionKey: r.descriptionKey,
          type: r.type,
          optionsKey: r.optionsKey || undefined,
          required: r.required === 'true'
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { sdohQuestions: rows, loading, error };
};