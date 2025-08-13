// src/lib/checklistParser.ts

import { ChecklistItem, ChecklistInfo, ResponseMap, ChecklistProgress } from '../types/checklist';

/**
 * Parse CSV checklist data
 */
export function parseChecklistCSV(csvText: string): ChecklistItem[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const item: Partial<ChecklistItem> = {};
    
    headers.forEach((header, index) => {
      (item as any)[header] = values[index] || '';
    });
    
    // Convert string numbers to actual numbers
    if (item.risk_weight) {
      item.risk_weight = parseInt(item.risk_weight as any, 10);
    }
    
    return item as ChecklistItem;
  }).filter(item => item.item_id); // Filter out invalid rows
}

/**
 * Parse a single CSV line, handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Filter checklist items by checklist ID
 */
export function getChecklistItems(items: ChecklistItem[], checklistId: string): ChecklistItem[] {
  return items.filter(item => item.checklist_id === checklistId);
}

/**
 * Group checklist items by category
 */
export function groupByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
  return items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ChecklistItem[]>);
}

/**
 * Get available checklists
 */
export function getAvailableChecklists(items: ChecklistItem[]): ChecklistInfo[] {
  const checklists = new Set<string>();
  
  items.forEach(item => {
    checklists.add(item.checklist_id);
  });
  
  return Array.from(checklists).map(id => ({
    id,
    name: getChecklistName(id),
    region: getChecklistRegion(id)
  }));
}

function getChecklistName(id: string): string {
  const names: Record<string, string> = {
    'US_NCHH': 'US Healthy Homes (NCHH)',
    'TW_HUALIEN': 'Taiwan Hualien Home Environment'
  };
  return names[id] || id;
}

function getChecklistRegion(id: string): string {
  if (id.startsWith('US_')) return 'US';
  if (id.startsWith('TW_')) return 'Taiwan';
  return 'Unknown';
}

/**
 * Calculate progress through checklist
 */
export function calculateProgress(items: ChecklistItem[], responses: ResponseMap): ChecklistProgress {
  const completedItems = items.filter(item => responses[item.item_id]);
  
  return {
    total: items.length,
    completed: completedItems.length,
    percentage: Math.round((completedItems.length / items.length) * 100) || 0,
    remaining: items.length - completedItems.length
  };
}

/**
 * Load checklist data from CSV file
 */
export async function loadChecklistData(filename: string): Promise<ChecklistItem[]> {
  try {
    const response = await fetch(`/data/checklists/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const csvText = await response.text();
    return parseChecklistCSV(csvText);
  } catch (error) {
    console.error(`Error loading checklist data from ${filename}:`, error);
    return [];
  }
}
