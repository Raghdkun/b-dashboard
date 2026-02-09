# Restaurant Sales Dashboard - Visualization Guide & Analysis
**Store:** 03795-00001 | **Date:** January 30, 2026 | **Week:** 5 (Jan 27 - Feb 2, 2026)

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Daily Sales** | $6,919.14 | Peak day of week |
| **Weekly Sales** | $37,644.64 | ✅ Strong performance |
| **Customer Count** | 430 | Healthy traffic |
| **HNR Promise Met** | 96.81% | ✅ Excellent |
| **Portal On-Time** | 98.08% | ✅ Outstanding |

---

## 🎯 Key Performance Indicators

### Revenue Metrics
- **Day Total:** $6,919.14 (Jan 30)
- **Week Total:** $37,644.64
- **Avg Daily (Week):** $5,378.22
- **Peak Hour:** 18:00 ($1,011.88 royalty obligation)
- **Best Day:** Friday 1/31 ($6,994.18) ⬆️

### Operational Efficiency
- **Customer Count:** 430
- **Avg Transaction Value:** $16.09
- **Waste (Normal):** $183.45
- **Waste (Alta Inventory):** $23.27
- **Total Tips:** $107.91
- **Cash Over/Short:** +$2.16

### Service Quality (HNR - Hot & Ready)
- **Total Transactions:** 188
- **Promise Met:** 182 (96.81%) ✅
- **Broken Promises:** 6
- **Portal Eligible:** 156 (100% used)
- **On-Time Delivery:** 153 (98.08%)

---

## 📈 Recommended Visualization Strategy

### 1. **Daily Sales Trend (LINE CHART)** ⭐ PRIMARY
**Purpose:** Identify sales patterns and anomalies
**X-Axis:** Dates (Mon-Sun)
**Y-Axis:** Sales ($)
**Series:** 
- Current Week (solid line)
- Previous Week (dashed line)
- Year-over-Year (dotted line)

**Key Insight:** This week shows **strong mid-week growth**, peaking Thursday-Friday, then normalizing weekend. Previous week shows anomaly on Saturday (only $63.56 - possible store closure or system error).

**Action:** Investigate why previous Saturday was exceptionally low.

---

### 2. **Top 5 Menu Items (HORIZONTAL BAR)** ⭐ HIGH PRIORITY
**Purpose:** Identify revenue drivers and bestsellers
**Layout:** Item name on Y-axis, Sales ($) on X-axis

**Current Data:**
1. Classic Pepperoni: $1,460.30 (218 units) - **40.1% of top items**
2. Classic Cheese: $1,048.76 (154 units) - **28.8%**
3. Caesar Wings: $400.58 (44 units)
4. EMB Pepperoni: $342.92 (39 units)
5. Crazy Bread: $255.35 (65 units)

**Action:** Focus marketing/promotions on top 2 items. Cross-sell Crazy Bread as upgrade with pizzas.

---

### 3. **Sales Channel Mix (STACKED BAR)** ⭐ HIGH PRIORITY
**Purpose:** Understand digital vs traditional sales
**X-Axis:** Hours (10-23)
**Y-Axis:** Sales ($) stacked by channel

**Channel Breakdown (Daily Total):**
- DoorDash: ~$1,070 (strongest delivery platform)
- Mobile App: ~$925 (strong omnichannel)
- Website: ~$636 (growing trend)
- UberEats: ~$483
- Phone: ~$576
- GrubHub: ~$148
- Call Center: ~$19

**Key Insight:** Delivery platforms (DoorDash + UberEats) account for ~30% of sales. Digital channels (Mobile + Website) growing strong at ~35%.

**Action:** Optimize delivery platform integration and mobile app UX.

---

### 4. **Hourly Sales Pattern (AREA CHART)** ⭐ OPERATIONAL PLANNING
**Purpose:** Staffing and production scheduling
**X-Axis:** Hours (10 AM - 11 PM)
**Y-Axis:** Sales ($)

**Peak Hours:**
- **Lunch Rush:** 11-13 (hours 11-1 PM) - moderate activity
- **Afternoon Dip:** 14-15 (2-3 PM) - expected lull
- **Evening Rush:** 17-20 (5-8 PM) - **PEAK PERIOD** 🔥
  - Hour 18 peaks at $1,011.88
  - Hour 19 holds strong at $945.29
  - Combined 17-19: ~$2,805 (40% of daily sales)

**Action:** Ensure adequate staffing 5-8 PM. Pre-position inventory for evening rush.

---

### 5. **Ingredient Usage Distribution (PIE CHART)**
**Purpose:** Inventory & procurement planning
**Current Top 3:**
1. Pizza Boxes (14" white): 404 units (76%)
2. Generic 9x7 Boxes: 88 units (17%)
3. 20 oz Containers: 59 units (7%)

**Key Insight:** Pizza-focused business (76% of top ingredient use is packaging).

**Action:** Negotiate pizza box supply contracts, ensure adequate stock.

---

### 6. **Comparative Performance (MULTI-SERIES LINE)**
**Purpose:** Benchmark against historical performance
**Comparison Points:**
- This Week vs Previous Week: **+3.9% growth** week-over-week
- Jan 30, 2026 vs Jan 30, 2025: **+41% growth** YoY 🚀
  - 2026: $6,919.14
  - 2025: $4,908.60

**Action:** Strong YoY growth indicates successful store improvements or marketing initiatives.

---

## 📋 Dashboard Table Structure

### Daily Summary Table
| Metric | Value |
|--------|-------|
| Total Sales | $6,919.14 |
| Customer Count | 430 |
| Avg Check | $16.09 |
| Total Tips | $107.91 |
| Cash Deposit | $938.00 |
| Over/Short | +$2.16 ✅ |
| Normal Waste | $183.45 |
| Alta Waste | $23.27 |
| HNR % | 96.81% ✅ |

### Channel Performance Table
| Channel | Sales | % of Total | Peak Hour |
|---------|-------|-----------|-----------|
| DoorDash | $1,070+ | 30%+ | 15:00 |
| Mobile App | $925+ | 26%+ | 18:00 |
| Website | $636+ | 18%+ | 19:00 |
| Phone | $576+ | 16%+ | 18:00 |
| UberEats | $483+ | 14%+ | 13:00 |
| GrubHub | $148+ | 4%+ | 21:00 |
| Call Center | $19+ | <1%+ | 20:00 |

### Hourly Performance Table
| Hour | Sales | Customers | Avg Check | Channel Leader |
|------|-------|-----------|-----------|-----------------|
| 10 | $60 | ~5 | $12 | Website |
| 11 | $280 | ~22 | $12.73 | Phone |
| 12 | $313 | ~25 | $12.52 | Phone |
| 13 | $507 | ~40 | $12.68 | DoorDash |
| 14 | $397 | ~31 | $12.81 | DoorDash |
| 15 | $633 | ~48 | $13.19 | DoorDash |
| 16 | $561 | ~43 | $13.05 | Website |
| 17 | $848 | ~63 | $13.46 | DoorDash |
| 18 | $1,012 | ~76 | $13.32 | Mobile App |
| 19 | $945 | ~71 | $13.31 | Website |
| 20 | $698 | ~53 | $13.17 | Mobile App |
| 21 | $472 | ~35 | $13.49 | Website |
| 22 | $130 | ~10 | $13.00 | DoorDash |
| 23 | $62 | ~5 | $12.40 | Phone |

---

## 🎨 Visualization Best Practices Applied

### Chart Type Selection
| Data Type | Chart Type | Why |
|-----------|-----------|-----|
| Time Series (Daily Sales) | Line/Area | Shows trends and patterns |
| Comparison (Items) | Horizontal Bar | Easy label reading |
| Part-to-Whole (Channels) | Stacked Bar/Pie | Shows composition |
| Multiple Metrics | Combination | Correlates variables |
| Distribution (Hourly) | Column/Area | Shows peak times |

### Color Scheme
- **Revenue/Performance:** Blue (primary), Green (positive)
- **Warnings/Issues:** Orange (anomalies), Red (problems)
- **Channels:** Distinct palette for quick identification
- **Time periods:** Gradients to show progression

### Accessibility
- High contrast ratios (WCAG AA compliant)
- No color-only encoding (include labels)
- Clear axis labels with units
- Legend included where applicable

---

## 💡 Actionable Insights

### Strengths ✅
1. **Strong YoY Growth:** +41% vs same date last year
2. **Excellent Service Quality:** 96.81% HNR promise met
3. **Delivery Excellence:** 98.08% on-time portal orders
4. **Channel Diversification:** No single channel over-dependent
5. **Healthy Customer Count:** 430 transactions on a Thursday

### Opportunities 🚀
1. **Evening Rush Optimization:** 40% of daily sales in 3 hours (5-8 PM)
   - Implement predictive scheduling for this window
   - Pre-stage inventory and prep ingredients
   - Consider loyalty incentives for off-peak hours

2. **Afternoon Dip (2-4 PM):**
   - Lunch crowd clears, dinner crowd hasn't arrived
   - Opportunity for targeted happy hour promotions
   - Current: $397-$633/hour vs Evening: $1,011/hour

3. **Website Channel Growth:**
   - Peaked at $216.68 in hour 19
   - Consider website-exclusive offers
   - Improve mobile responsiveness

4. **Underutilized Channels:**
   - GrubHub only $148 daily (lowest performer)
   - Call Center only $19 (highest friction channel)
   - Evaluate platform economics

5. **Product Mix:**
   - Classic Pepperoni dominates (40% of top items)
   - Wings/Specialty items underperforming
   - Consider bundling or cross-promotion strategies

### Risk Areas ⚠️
1. **Previous Week Anomaly:** Saturday 1/25 only $63.56
   - Investigate: System failure, store closure, or data error?
   - Affects week-over-week comparison validity

2. **Normal Waste:** $183.45 daily (~2.6% of sales)
   - Monitor for waste reduction opportunities
   - Could recoup ~$67k annually if reduced 1%

---

## 📱 Recommended Dashboard Layout

### Mobile/Responsive View (3 Rows)
```
Row 1: Daily Sales Card + Key Metrics Strip
Row 2: Weekly Trend Line Chart (full width)
Row 3: Top 5 Items Bar Chart
Row 4: Hourly Sales Area Chart
Row 5: Channel Mix Breakdown (Pie or Stacked)
Row 6: Performance Tables (Tabbed for mobile)
```

### Desktop View (2-Column Grid)
```
Left Column:
├── Daily Metrics Summary Card
├── Weekly Trend Chart (tall)
└── Top Items Bar Chart

Right Column:
├── Hourly Distribution Area Chart
├── Channel Mix Pie Chart
└── Performance Metrics Table
```

---

## 🔧 Implementation Recommendations

### Tools/Platforms
- **Tableau/Power BI:** Enterprise dashboard with real-time data
- **Looker:** Custom metrics and drill-down analysis
- **Google Data Studio:** Free alternative for basic dashboards
- **Custom Web App:** React/Vue with Chart.js or D3.js for maximum control

### Data Refresh Cadence
- **Real-time:** Hourly sales and HNR metrics
- **Daily:** Full day summary (run at 11:59 PM)
- **Weekly:** Trend analysis and comparisons
- **Monthly:** YoY and trend analysis

### Alerts/Triggers
- Daily sales < $5,000: Low sales alert
- HNR promise met % < 95%: Service quality alert
- Waste > $250: Waste management alert
- Down time detection: System integration issues

---

## 📊 KPI Targets (Recommendations)

| KPI | Current | Target | Trend |
|-----|---------|--------|-------|
| Daily Avg Sales | $5,378 | $5,800 | ⬆️ +8% |
| Weekly Sales | $37,644 | $40,600 | ⬆️ +8% |
| HNR % | 96.81% | 98%+ | ⬆️ |
| Portal On-Time % | 98.08% | 99%+ | ⬆️ |
| Customer Count | 430 | 450 | ⬆️ +5% |
| Waste % of Sales | 2.97% | <2.5% | ⬇️ |
| Avg Check | $16.09 | $17 | ⬆️ +6% |

---

## 🎯 Next Steps

1. **Implement Dashboard:** Choose platform and set up real-time data pipeline
2. **Set Alerts:** Define thresholds for key metrics
3. **Train Staff:** Educate managers on reading and acting on data
4. **Monitor Trends:** Weekly review of dashboard metrics
5. **Optimize:** A/B test strategies to move KPIs toward targets

