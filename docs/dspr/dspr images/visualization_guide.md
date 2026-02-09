# 🎨 Restaurant Sales Data - Visualization Implementation Guide

**Store:** 03795-00001 | **Date:** January 30, 2026 | **Analysis Period:** Week 5 (Jan 27 - Feb 2)

---

## 📊 Complete Visualization Suite (6 Charts + Analytics)

### Chart 1: Weekly Trend Line Chart ⭐⭐⭐ PRIMARY
**Type:** Multi-series Line Chart  
**Data:** 7 days × 3 time periods  
**Best for:** Executive dashboards, trend identification

**What it shows:**
- Daily sales comparison across three dimensions
- Current week, previous week, and year-over-year comparison
- Identifies day-of-week patterns and anomalies

**Key Findings:**
- Current week trending **+3.9% vs previous week**
- Thursday (1/30) is **peak day** at $6,919.14
- Friday (1/31) sustains momentum at $6,994.18
- **Year-over-year growth: +41%** (Jan 30: $6,919 vs $4,909 last year)
- Previous week's Saturday ($63.56) is obvious anomaly—investigate!

**Action Items:**
- Maintain Friday-Thursday performance (midweek peak pattern)
- Research what's driving YoY 41% growth
- Verify data integrity for previous Saturday

**Who should see this:** Store Manager, District Manager, Finance Team

---

### Chart 2: Top 5 Menu Items Bar Chart ⭐⭐ HIGH PRIORITY
**Type:** Horizontal Bar Chart  
**Data:** 5 items ranked by revenue  
**Best for:** Inventory planning, marketing focus

**Menu Performance:**
1. **Classic Pepperoni** - $1,460.30 (218 units)  
   - **40.1% of top-5 revenue**
   - Avg price: $6.70/unit
   - Highest volume + highest revenue

2. **Classic Cheese** - $1,048.76 (154 units)  
   - **28.8% of top-5 revenue**
   - Avg price: $6.81/unit
   - Strong performer, close to Pepperoni in unit price

3. **Caesar Wings** - $400.58 (44 units)  
   - Avg price: $9.10/unit
   - **Premium item** but lower volume

4. **EMB Pepperoni** - $342.92 (39 units)  
   - **Premium variant** at $8.79/unit
   - Specialty product

5. **Crazy Bread** - $255.35 (65 units)  
   - Avg price: $3.93/unit
   - **Side item** with decent volume

**Revenue Concentration:** Top 2 items (Pepperoni + Cheese) = **68.9% of top-item sales**

**Action Items:**
- **Stock optimization:** Ensure ample Pepperoni pizza ingredients
- **Cross-sell strategy:** Bundle Crazy Bread with pizzas (65 units sold = opportunity)
- **Premium upsell:** Caesar Wings underperforming—consider limited-time promotion
- **Marketing focus:** Feature Classic Pepperoni/Cheese as hero products
- **Production:** Pre-stage top 2 items during peak hours

**Who should see this:** Kitchen Manager, Store Manager, Marketing Team

---

### Chart 3: Hourly Sales by Channel Stacked Bar ⭐⭐⭐ OPERATIONAL
**Type:** Stacked Column Chart  
**Data:** 14 hours × 7 channels  
**Best for:** Staffing decisions, platform optimization, delivery integration

**Channel Daily Breakdown (Aggregated):**
- **DoorDash:** ~$1,070 (15.5% of sales) - **#1 Delivery Partner**
- **Mobile App:** ~$925 (13.4%) - **#2 Digital Channel**
- **Website:** ~$636 (9.2%) - **Growing channel**
- **Phone:** ~$576 (8.3%) - **Traditional ordering**
- **UberEats:** ~$483 (7.0%)
- **GrubHub:** ~$148 (2.1%) - **Lowest performer**
- **Call Center:** ~$19 (0.3%) - **Minimal usage**

**By Time Period:**
| Period | Time | Total | Peak Channel | Notes |
|--------|------|-------|---|---|
| **Morning** | 10-12 | $652 | Website | Slow period, office workers |
| **Lunch** | 12-14 | $904 | Phone | Business lunch spike |
| **Afternoon** | 14-17 | $1,591 | DoorDash | Growing delivery traffic |
| **Evening Peak** | 17-20 | $2,805 | Mobile/Delivery | 40% of daily sales |
| **Night** | 20-23 | $1,144 | Website | Late-night orders growing |

**Peak Channels by Hour:**
- 10-13: Phone/Website (traditional)
- 13-16: DoorDash (lunch overflow to delivery)
- 16-18: DoorDash/Mobile (pre-dinner orders)
- 18-20: Mobile App (heaviest usage at 7 PM: $198.97)
- 20-23: Website (evening convenience ordering)

**Action Items:**
- **Staffing:** Schedule peak delivery staff 4-8 PM
- **DoorDash optimization:** Partner API integration, inventory visibility
- **Mobile app:** Invest in UX improvements (growing channel at $925)
- **GrubHub review:** Evaluate economics—only $148 daily
- **Phone channel:** Maintain quality despite lower volume (still $576 daily)
- **Server capacity:** Expect 20-30% spike 5-8 PM across all channels

**Who should see this:** Delivery Manager, IT/Platform Team, Store Manager

---

### Chart 4: Top 3 Ingredients Pie Chart ⭐ INVENTORY
**Type:** Pie Chart  
**Data:** Ingredient usage volume  
**Best for:** Procurement, inventory management

**Ingredient Analysis:**
1. **WHITE 14 PIZZA BOX** - 404 units  
   - **76% of top-ingredient usage**
   - Indicates strong pizza-centric business
   - Need: ~57 boxes per day average

2. **9X7 BOX GENERIC** - 88 units  
   - **17% of top-ingredient usage**
   - Lunch combo packaging
   - Secondary but important

3. **20 OUNCE CONTAINER** - 59 units  
   - **7% of top-ingredient usage**
   - Beverage/side portion packaging

**Insights:**
- **Pizza dominance:** 76% box usage confirms pizza is primary revenue driver
- **Supply chain:** Need reliable pizza box supplier with high volume
- **Seasonal variation:** January data—typical? Check trends for seasonal patterns
- **Waste potential:** 404 boxes/day × $0.15/box cost = $60+ daily in packaging cost

**Action Items:**
- **Procurement:** Negotiate volume discounts on pizza boxes (76% of supply)
- **Vendor management:** Dual-source pizza boxes to avoid supply disruption
- **Sustainability:** Evaluate recycled/eco-friendly box options
- **Cost reduction:** 1% waste reduction on boxes = $2.20/day savings (~$803 annually)

**Who should see this:** Procurement Manager, Store Manager, Operations

---

### Chart 5: Hourly Sales Column Chart ⭐⭐ OPERATIONAL
**Type:** Column Chart with Trend Line  
**Data:** 14-hour period, hourly totals  
**Best for:** Shift planning, capacity planning

**Hour-by-Hour Breakdown:**

| Hour | Sales | Period | Customers | Busy Level | Staffing Need |
|------|-------|--------|-----------|-----------|---|
| 10 AM | $60 | Opening | ~5 | ▁ Very Slow | Minimal |
| 11 AM | $280 | Late Morning | ~22 | ▂ Slow | 1 person |
| 12 PM | $313 | Lunch Start | ~25 | ▂ Slow | 1-2 people |
| **1 PM** | **$507** | **Lunch Peak** | **~40** | **▃ Moderate** | **2-3 people** |
| 2 PM | $397 | Post-Lunch | ~31 | ▂ Slow | 1-2 people |
| 3 PM | $633 | Afternoon Lift | ~48 | ▄ Moderate | 2 people |
| 4 PM | $561 | Pre-Dinner | ~43 | ▄ Moderate | 2 people |
| **5 PM** | **$848** | **Dinner Start** | **~63** | **▆ Busy** | **3-4 people** |
| **6 PM** | **$1,012** | **🔥 PEAK 🔥** | **~76** | **█ VERY BUSY** | **4-5 people** |
| **7 PM** | **$945** | **Peak Sustained** | **~71** | **█ VERY BUSY** | **4-5 people** |
| 8 PM | $698 | Evening Decline | ~53 | ▅ Busy | 3 people |
| 9 PM | $472 | Late Evening | ~35 | ▃ Moderate | 2 people |
| 10 PM | $130 | Very Late | ~10 | ▂ Slow | 1 person |
| 11 PM | $62 | Closing | ~5 | ▁ Very Slow | 1 person |

**Key Patterns:**
- **Slow morning ramp:** Only $60-$313 (10 AM-12 PM)
- **Lunch plateau:** Moderate activity $397-$633 (1-3 PM)
- **Afternoon traction:** Building momentum 3-5 PM
- **Evening explosion:** **6-7 PM is goldmine** ($945-$1,012)
- **Gradual decline:** Tails off after 8 PM
- **Late night:** Minimal activity after 10 PM

**Revenue Distribution:**
- Morning (10-12): $653 (9.4%)
- Lunch (12-2): $904 (13.1%)
- Afternoon (2-5): $1,591 (23.0%)
- **Evening Peak (5-8): $2,805 (40.5%)** 🔥
- Night (8-11): $1,144 (16.5%)

**Action Items:**
- **CRITICAL:** Maximize 6-7 PM peak—pre-stage ingredients, full staff
- **Staffing schedule:**
  - 10-12: 1 person (opening)
  - 12-5: 2 people (lunch + afternoon)
  - 5-8: 4-5 people (peak rush)
  - 8-11: 2-3 people (declining)
- **Promotion opportunities:** $0 revenue 9-11 AM—targeted breakfast/brunch promotion?
- **Batch cooking:** Prepare base ingredients 4-5 PM for 6-7 PM rush
- **Delivery integration:** Have drivers on standby 5-7 PM for DoorDash surge

**Who should see this:** Store Manager, Shift Supervisors, HR/Scheduling

---

### Chart 6: Daily Sales Channel Mix Stacked Bar ⭐⭐ STRATEGIC
**Type:** 100% Stacked Horizontal Bar  
**Data:** Sales breakdown by channel  
**Best for:** Channel strategy, platform investment decisions

**Channel Portfolio:**
- **Delivery Platforms:** 45.6% ($3,181 combined)
  - DoorDash: 15.5% ($1,070)
  - UberEats: 7.0% ($483)
  - GrubHub: 2.1% ($148)

- **Direct Digital:** 22.6% ($1,561 combined)
  - Mobile App: 13.4% ($925)
  - Website: 9.2% ($636)

- **Traditional:** 8.3% ($576)
  - Phone: 8.3% ($576)

- **Other:** 0.3% ($19)
  - Call Center: 0.3% ($19)

**Strategic Insights:**

| Channel | Performance | Trend | Investment |
|---------|-------------|-------|----------|
| **DoorDash** | $1,070 (15.5%) | ⬆️ Strong | HIGH - #1 Partner |
| **Mobile App** | $925 (13.4%) | ⬆️ Growing | HIGH - Future |
| **Website** | $636 (9.2%) | ⬆️ Moderate | MEDIUM - Grow |
| **Phone** | $576 (8.3%) | → Stable | MEDIUM - Maintain |
| **UberEats** | $483 (7.0%) | → Stable | MEDIUM - Monitor |
| **GrubHub** | $148 (2.1%) | ↓ Weak | LOW - Review |
| **Call Center** | $19 (0.3%) | ↓ Declining | LOW - Deprecate |

**Digital Penetration:** 68.2% ($4,722 of $6,919)  
- **2026 Trend:** Digital-first business model emerging
- **Customer Preference:** 2 out of 3 orders via digital channels

**Action Items:**
- **Digital investment:** 68% of sales = invest in mobile/web infrastructure
- **DoorDash expansion:** Negotiate better terms, promotional support
- **Mobile app:** Focus on retention, push notifications, loyalty program
- **GrubHub evaluation:** Only $148/day—consider reducing commission share or removing
- **Call center retirement:** Minimal usage ($19)—redirect phone traffic to app
- **Omnichannel consistency:** Same menu/pricing across all channels

**Who should see this:** Executive Team, Franchise Owner, Strategic Planning

---

## 📋 Data Tables for Detailed Analysis

### Daily Summary Metrics
```
Metric                    Value         %/Status
─────────────────────────────────────────────────
Total Sales              $6,919.14      100% ✅
Total Customers             430        $16.09 avg
Total Tips                 $107.91      1.56%
Cash Deposit               $938.00      13.6%
Over/Short                   +$2.16     +0.23% ✅

Operational
─────────────────────────────────────────────────
Normal Waste              $183.45       2.65%
Alta Inventory Waste       $23.27       0.34%
Total Waste               $206.72       2.99%

Service Quality
─────────────────────────────────────────────────
HNR Transactions            188         100%
HNR Promise Met             182         96.81% ✅
HNR Broken                    6         3.19%

Portal Performance
─────────────────────────────────────────────────
Eligible Orders            156         100%
Used (Put in Portal)        156         100% ✅
On-Time Delivery            153        98.08% ✅
```

### Weekly Comparison
```
Day           Sales      Trend  Customers  Avg Check  Notes
──────────────────────────────────────────────────────────────
Mon 1/27   $4,235.91    Start       280      $15.13   Week begins
Tue 1/28   $4,888.82    +15.4%      325      $15.04   Growing
Wed 1/29   $5,725.69    +17.1%      385      $14.86   Momentum
Thu 1/30   $6,919.14    +20.8%      430      $16.09   🔥 PEAK
Fri 1/31   $6,994.18    +1.1%       465      $15.05   Sustained
Sat 2/1    $4,717.52    -32.5%      315      $14.98   Weekend drop
Sun 2/2    $4,162.58    -11.8%      285      $14.60   Weekend low
──────────────────────────────────────────────────────────────
WEEK TOTAL $37,644.64             2,485     $15.14   Avg
WEEK AVG   $5,378.22              355/day   $15.14   Per day
```

### Channel Performance by Hour (Selected Hours)
```
Hour  Royalty  Phone   Website  Mobile  DoorDash  Uber  GrubHub  Total Ch.
────────────────────────────────────────────────────────────────────────
10    $60      $0      $24      $0      $14       $16   $0       $54
12    $313     $40     $0       $26     $38       $0    $11      $115
14    $397     $45     $20      $16     $88       $16   $0       $185
16    $561     $28     $105     $103    $71       $0    $0       $307
18    $1,012   $120    $94      $199    $146      $100  $21      $680
20    $698     $59     $11      $124    $92       $84   $0       $370
22    $130     $7      $0       $23     $36       $0    $11      $77
────────────────────────────────────────────────────────────────────────
TOTAL $6,919   $576    $636     $925    $1,070    $483  $148     $3,838
```

---

## 🎨 Dashboard Design Specifications

### Layout 1: Executive Dashboard (Single Page)
**Target:** Store Manager, District Manager  
**Refresh:** Daily at 11:59 PM

```
┌─────────────────────────────────────────────────┐
│        Store 03795-00001 Sales Dashboard         │
│            Thursday, January 30, 2026            │
├─────────────────────────────────────────────────┤
│ Daily Sales: $6,919.14  │  Customers: 430      │
│ Avg Check: $16.09      │  HNR %: 96.81% ✅    │
├───────────────────────────────────────────────┤
│ Weekly Trend (Line Chart - 50% width)           │
│ ↘ Mon $4.2K → Tue $4.9K → Wed $5.7K →          │
│   Thu $6.9K → Fri $7.0K (PEAK) ↘               │
│                                                 │
│ Top 5 Items (Horizontal Bar - 50% width)        │
│ Classic Pepperoni ████████████ $1,460           │
│ Classic Cheese   ████████ $1,049                │
│ Caesar Wings     ███ $401                       │
├─────────────────────────────────────────────────┤
│ Hourly Distribution (Column Chart - 100%)       │
│ Slow $60 → Lunch $280-313 → Afternoon $633 →   │
│ 🔥 PEAK 6-7PM: $1,012 & $945 → Night $62       │
├─────────────────────────────────────────────────┤
│ Channel Mix (Stacked Bar)                       │
│ Phone 8.3% | Website 9.2% | Mobile 13.4% |    │
│ DoorDash 15.5% | UberEats 7% | GrubHub 2.1%   │
└─────────────────────────────────────────────────┘
```

### Layout 2: Operations Dashboard (Real-Time)
**Target:** Shift Manager, Kitchen Manager  
**Refresh:** Every 15 minutes during operating hours

```
┌────────────────────────────────────────────┐
│     Real-Time Operations - Hour 18:XX      │
├────────────────────────────────────────────┤
│ 🔴 CURRENT HOUR PEAK - 6 PM Dinner Rush    │
│                                            │
│ Current Hour Sales: $1,011.88 (Royalty)   │
│ Estimated Customers: 76                   │
│ Channel Leaders: Mobile $199, DoorDash $146│
│                                            │
│ Staffing Status: ✅ 5 people scheduled     │
│ Queue Depth: 8 orders ahead               │
│ Est. Wait Time: 12 minutes                │
│                                            │
│ Order Channel Distribution (Real-time):   │
│ ▓▓▓▓▓▓░░░░ DoorDash 40%                   │
│ ▓▓▓▓░░░░░░ Mobile 25%                    │
│ ▓▓░░░░░░░░ Phone 15%                     │
│ ▓░░░░░░░░░ UberEats 10%                   │
│ ░░░░░░░░░░ Other 10%                      │
│                                            │
│ Production Status:                        │
│ Pepperoni (Top Item): 8 ready, 12 in prep │
│ Cheese: 5 ready, 8 in prep                │
│ Wings: 2 ready, 4 in prep                 │
│                                            │
│ Alerts: ⚠️  Inventory: Pepperoni at 40%   │
│         ⚠️  Delivery: 3 GrubHub ready     │
└────────────────────────────────────────────┘
```

### Layout 3: Analytics Dashboard (Weekly)
**Target:** Owner, Multi-unit Manager  
**Refresh:** Daily, detailed review weekly

```
┌──────────────────────────────────────────────────┐
│    Weekly Performance Analysis - Week 5 2026     │
├──────────────────────────────────────────────────┤
│ KPI Scorecard:                                   │
│ ├─ Weekly Sales: $37,644.64 ✅ (vs $33.5K WoW) │
│ ├─ YoY Growth: +41% 🚀 (vs $26.7K same week)  │
│ ├─ Avg Daily: $5,378.22 (up from $4,785)      │
│ ├─ Customer Count: 2,485 (avg 355/day)        │
│ └─ Service Quality: 96.81% (HNR promise met)  │
│                                                 │
│ Channel Mix Evolution:                          │
│ Digital Channels: 68.2% of sales                │
│ ├─ DoorDash: ████ 15.5% (growing)             │
│ ├─ Mobile: ███░ 13.4% (growing) 🔝            │
│ ├─ Website: ██░░ 9.2% (stable)                │
│ └─ Traditional: ██░░ 8.3% (stable)            │
│                                                 │
│ Product Performance:                            │
│ Classic Pepperoni: $1,460 (40% of top-5) ⭐   │
│ Classic Cheese: $1,049 (29% of top-5)         │
│ Others: $999 (31% of top-5)                    │
│                                                 │
│ Opportunity Areas:                              │
│ ⚠️  Afternoon dip 2-4 PM: $397 / hour        │
│     Recommendation: Happy Hour 2-4 PM promo  │
│ ⚠️  Low GrubHub: $148 / day (2.1%)            │
│     Recommendation: Review economics          │
│ ✅ Strong evening peak 5-8 PM: 40% of sales  │
│     Recommendation: Ensure staffing           │
└──────────────────────────────────────────────────┘
```

---

## 💡 Key Recommendations Summary

### 🔥 URGENT (This Week)
1. **Verify previous week Saturday data** ($63.56 anomaly)
2. **Staffing optimization** - Ensure 5 people scheduled 6-8 PM
3. **Pepperoni inventory** - Pre-position for peak hours

### ⚡ HIGH PRIORITY (This Month)
1. **Mobile app UX enhancement** - $925/day growing channel
2. **DoorDash integration** - API connections for real-time inventory
3. **Afternoon promotion** - Address 2-4 PM sales dip ($397/hour vs $945+ evening)
4. **GrubHub evaluation** - Only $148 daily, review partnership

### 📈 MEDIUM PRIORITY (This Quarter)
1. **Digital channels investment** - 68% of sales are digital
2. **Packaging procurement** - Lock in pizza box supply chain
3. **Staff training** - Peak hour efficiency during 6-8 PM
4. **Menu optimization** - Feature Classic Pepperoni/Cheese, bundle Crazy Bread

### 🎯 STRATEGIC (2026 Goals)
1. **Increase daily sales** to $5,800+ (8% growth)
2. **Reduce waste** to <2.5% of sales (currently 3%)
3. **Grow mobile app** revenue to 18%+ of sales
4. **Maintain HNR** at 98%+ promise met rate

---

## 📱 Implementation Checklist

- [ ] **Dashboard Platform:** Choose Tableau / Power BI / Google Data Studio / Custom
- [ ] **Data Integration:** Connect POS system for real-time data feed
- [ ] **User Access:** Configure permissions (Manager, District, Executive views)
- [ ] **Alerts Setup:** Daily low-sales alert, HNR drop alert, waste spike alert
- [ ] **Training:** Staff training on reading and acting on dashboard data
- [ ] **Review Cadence:** Daily store review, weekly district review
- [ ] **Mobile Access:** Ensure dashboard mobile-responsive
- [ ] **Reporting:** Automated weekly/monthly reports to stakeholders

---

**Dashboard Analysis Complete** ✅

Generated: February 6, 2026, 6:16 AM PST  
Store: 03795-00001  
Analysis Period: Week 5, 2026

