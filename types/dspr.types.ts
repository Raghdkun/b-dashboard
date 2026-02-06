/**
 * DSPR (Daily Store Performance Report) Types
 * Maps the API response from data.lcportal.cloud/api/reports/dspr
 */

// ============================================================================
// Filtering
// ============================================================================

export interface DsprFiltering {
  store: string;
  date: string;
  iso_week: number;
  week_start: string;
  week_end: string;
}

// ============================================================================
// Sales
// ============================================================================

/** Date string -> sales amount mapping */
export type DaySalesMap = Record<string, number>;

export interface DsprSales {
  this_week_by_day: DaySalesMap;
  previous_week_by_day: DaySalesMap;
  same_week_last_year_by_day: DaySalesMap;
}

// ============================================================================
// Top Items & Ingredients
// ============================================================================

export interface TopMenuItem {
  franchise_store: string;
  item_id: string;
  menu_item_name: string;
  gross_sales: number;
  quantity_sold: number;
}

export interface TopIngredient {
  ingredient_id: string;
  ingredient_description: string;
  actual_usage: number;
}

export interface DsprTop {
  top_5_items_sales_for_day: TopMenuItem[];
  top_3_ingredients_used: TopIngredient[];
}

// ============================================================================
// Day Details
// ============================================================================

export interface HourlySalesChannel {
  hour: number;
  royalty_obligation: string;
  phone_sales: string;
  call_center_sales: string;
  drive_thru_sales: string;
  website_sales: string;
  mobile_sales: string;
  doordash_sales: string;
  ubereats_sales: string;
  grubhub_sales: string;
}

export interface DsprRefundedOrders {
  count: number;
  sales: number;
}

export interface DsprWaste {
  alta_inventory: number;
  normal: number;
}

export interface DsprHnr {
  hnr_transactions: number;
  hnr_broken_promises: number;
  hnr_promise_met: number;
  hnr_promise_met_percent: number;
}

export interface DsprPortal {
  portal_eligible_orders: number;
  portal_used_orders: number;
  portal_on_time_orders: number;
  put_into_portal_percent: number;
  in_portal_on_time_percent: number;
}

export interface DsprDay {
  hourly_sales_and_channels: HourlySalesChannel[];
  total_cash_sales: number;
  total_deposit: number;
  over_short: number;
  refunded_orders: DsprRefundedOrders;
  customer_count: number;
  waste: DsprWaste;
  total_tips: number;
  hnr: DsprHnr;
  labor: number;
  portal: DsprPortal;
}

// ============================================================================
// Full DSPR Response
// ============================================================================

export interface DsprResponse {
  filtering: DsprFiltering;
  sales: DsprSales;
  top: DsprTop;
  day: DsprDay;
}
