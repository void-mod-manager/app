import type { ModTag, ModType } from "@/lib/types/mods";

interface DiscoverFilter {
  page?: number;
  pageSize?: number;
  tags?: ModTag[];
  sort?: string;
}

interface DiscoveryMeta {
  game_id: string;
  pagination: PaginationMeta;
  applied_tags: string[];
  available_tags?: string[];
}

interface PaginationMeta {
  current: number;
  page_size: number;
  total_pages: number;
  total_items: number;
}

interface DiscoverResult {
  mods: ModType[];
  meta: DiscoveryMeta;
}

export type { DiscoverFilter, DiscoveryMeta, PaginationMeta, DiscoverResult };
