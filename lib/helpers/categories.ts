// lib/helpers/categories.ts
import { supabase } from "@/services/supabase/client";

export interface Profession {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface Subcategory {
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
  icon?: string;
  subcategories: Subcategory[];
}

// Fetch all active categories with subcategories
export const fetchCategoriesWithSubcategories = async (): Promise<
  Category[]
> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_active_categories_with_subcategories"
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Convert professions array to Select options
export const getProfessionSelectOptions = (professions: Profession[]) => {
  return professions.map((p) => ({
    value: p.value,
    label: p.label,
  }));
};
