the api endpoint 
https://data.lcportal.cloud/api/reports/dspr/{STORE-ID}/{DATE_FILTER}
THE FULL RESPONSE EXAPMPLE : api-response.json

we will display this as static endpoint : https://data.lcportal.cloud/api/reports/dspr/03795-00001/2026-01-30 and we will make it dynamic and filtered later 
sales part 

we will use this endpoint from .env 


"sales": {
    "this_week_by_day": {
      "2026-01-27": 4235.91,
      "2026-01-28": 4888.82,
      "2026-01-29": 5725.69,
      "2026-01-30": 6919.14,
      "2026-01-31": 6994.18,
      "2026-02-01": 4717.52,
      "2026-02-02": 4162.58
    },
    "previous_week_by_day": {
      "2026-01-20": 4372.85,
      "2026-01-21": 3902.42,
      "2026-01-22": 4149.29,
      "2026-01-23": 6668.23,
      "2026-01-24": 5268.94,
      "2026-01-25": 63.56,
      "2026-01-26": 6044.92
    },
    "same_week_last_year_by_day": {
      "2025-01-28": 4466.06,
      "2025-01-29": 4677.91,
      "2025-01-30": 4908.6,
      "2025-01-31": 7205.45,
      "2025-02-01": 5736.05,
      "2025-02-02": 4459.56,
      "2025-02-03": 4113.7
    }
}


here we should use 
https://apexcharts.com/react-chart-demos/mixed-charts/multiple-yaxis/

example from the website :

   const ApexChart = () => {
        const [state, setState] = React.useState({
          
            series: [{
              name: 'Income',
              type: 'column',
              data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
            }, {
              name: 'Cashflow',
              type: 'column',
              data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
            }, {
              name: 'Revenue',
              type: 'line',
              data: [20, 29, 37, 36, 44, 45, 50, 58]
            }],
            options: {
              chart: {
                height: 350,
                type: 'line',
                stacked: false
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                width: [1, 1, 4]
              },
              title: {
                text: 'XYZ - Stock Analysis (2009 - 2016)',
                align: 'left',
                offsetX: 110
              },
              xaxis: {
                categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
              },
              yaxis: [
                {
                  seriesName: 'Income',
                  axisTicks: {
                    show: true,
                  },
                  axisBorder: {
                    show: true,
                    color: '#008FFB'
                  },
                  labels: {
                    style: {
                      colors: '#008FFB',
                    }
                  },
                  title: {
                    text: "Income (thousand crores)",
                    style: {
                      color: '#008FFB',
                    }
                  },
                  tooltip: {
                    enabled: true
                  }
                },
                {
                  seriesName: 'Cashflow',
                  opposite: true,
                  axisTicks: {
                    show: true,
                  },
                  axisBorder: {
                    show: true,
                    color: '#00E396'
                  },
                  labels: {
                    style: {
                      colors: '#00E396',
                    }
                  },
                  title: {
                    text: "Operating Cashflow (thousand crores)",
                    style: {
                      color: '#00E396',
                    }
                  },
                },
                {
                  seriesName: 'Revenue',
                  opposite: true,
                  axisTicks: {
                    show: true,
                  },
                  axisBorder: {
                    show: true,
                    color: '#FEB019'
                  },
                  labels: {
                    style: {
                      colors: '#FEB019',
                    },
                  },
                  title: {
                    text: "Revenue (thousand crores)",
                    style: {
                      color: '#FEB019',
                    }
                  }
                },
              ],
              tooltip: {
                fixed: {
                  enabled: true,
                  position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                  offsetY: 30,
                  offsetX: 60
                },
              },
              legend: {
                horizontalAlign: 'left',
                offsetX: 40
              }
            },
          
          
        });

        

        return (
          <div>
            <div id="chart">
                <ReactApexChart options={state.options} series={state.series} type="line" height={350} />
              </div>
            <div id="html-dist"></div>
          </div>
        );
      }

      const domContainer = document.querySelector('#app');
      ReactDOM.render(<ApexChart />, domContainer);

      in the initial we should display the 3 of them and we can show hide each one of them from built in props 

      make sure to display all the available props so we can adjust them later 


"top": {
    "top_5_items_sales_for_day": [
      {
        "franchise_store": "03795-00001",
        "item_id": "101001",
        "menu_item_name": "Classic Pepperoni",
        "gross_sales": 1460.3,
        "quantity_sold": 218
      },
      {
        "franchise_store": "03795-00001",
        "item_id": "101002",
        "menu_item_name": "Classic Cheese",
        "gross_sales": 1048.76,
        "quantity_sold": 154
      },
      {
        "franchise_store": "03795-00001",
        "item_id": "105001",
        "menu_item_name": "Caesar Wings",
        "gross_sales": 400.58,
        "quantity_sold": 44
      },
      {
        "franchise_store": "03795-00001",
        "item_id": "201106",
        "menu_item_name": "EMB Pepperoni",
        "gross_sales": 342.92,
        "quantity_sold": 39
      },
      {
        "franchise_store": "03795-00001",
        "item_id": "103001",
        "menu_item_name": "Crazy Bread",
        "gross_sales": 255.35,
        "quantity_sold": 65
      }
    ],
    "top_3_ingredients_used": [
      {
        "ingredient_id": "4660/4621",
        "ingredient_description": "WHITE 14 PIZZA BOX",
        "actual_usage": 404
      },
      {
        "ingredient_id": "4659",
        "ingredient_description": "9X7 BOX GENERIC (ICB/LUNCH COMBO)",
        "actual_usage": 88
      },
      {
        "ingredient_id": "03",
        "ingredient_description": "20 OUNCE",
        "actual_usage": 59
      }
    ]
  },


  here we should have top 5/3 lists that can display only menu_item_name, gross_sales,quantity_sold 


   "day": {
    "hourly_sales_and_channels": [
      {
        "hour": 10,
        "royalty_obligation": "60.38",
        "phone_sales": "0.00",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "24.14",
        "mobile_sales": "0.00",
        "doordash_sales": "14.20",
        "ubereats_sales": "15.59",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 11,
        "royalty_obligation": "279.54",
        "phone_sales": "122.22",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "0.00",
        "mobile_sales": "23.47",
        "doordash_sales": "51.04",
        "ubereats_sales": "19.00",
        "grubhub_sales": "9.31"
      },
      {
        "hour": 12,
        "royalty_obligation": "312.72",
        "phone_sales": "39.96",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "0.00",
        "mobile_sales": "26.47",
        "doordash_sales": "38.38",
        "ubereats_sales": "0.00",
        "grubhub_sales": "10.50"
      },
      {
        "hour": 13,
        "royalty_obligation": "507.20",
        "phone_sales": "0.00",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "11.48",
        "mobile_sales": "60.18",
        "doordash_sales": "107.91",
        "ubereats_sales": "64.80",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 14,
        "royalty_obligation": "397.36",
        "phone_sales": "44.73",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "19.98",
        "mobile_sales": "16.28",
        "doordash_sales": "88.22",
        "ubereats_sales": "15.85",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 15,
        "royalty_obligation": "633.08",
        "phone_sales": "96.36",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "76.08",
        "mobile_sales": "85.30",
        "doordash_sales": "153.77",
        "ubereats_sales": "0.00",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 16,
        "royalty_obligation": "561.44",
        "phone_sales": "27.57",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "105.37",
        "mobile_sales": "103.42",
        "doordash_sales": "71.27",
        "ubereats_sales": "0.00",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 17,
        "royalty_obligation": "848.05",
        "phone_sales": "68.11",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "105.73",
        "mobile_sales": "90.60",
        "doordash_sales": "139.47",
        "ubereats_sales": "20.34",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 18,
        "royalty_obligation": "1011.88",
        "phone_sales": "119.65",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "93.77",
        "mobile_sales": "198.97",
        "doordash_sales": "145.94",
        "ubereats_sales": "99.65",
        "grubhub_sales": "21.01"
      },
      {
        "hour": 19,
        "royalty_obligation": "945.29",
        "phone_sales": "20.37",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "216.68",
        "mobile_sales": "157.59",
        "doordash_sales": "121.61",
        "ubereats_sales": "47.55",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 20,
        "royalty_obligation": "698.34",
        "phone_sales": "59.03",
        "call_center_sales": "19.20",
        "drive_thru_sales": "0.00",
        "website_sales": "10.78",
        "mobile_sales": "124.15",
        "doordash_sales": "92.11",
        "ubereats_sales": "84.47",
        "grubhub_sales": "0.00"
      },
      {
        "hour": 21,
        "royalty_obligation": "472.11",
        "phone_sales": "0.00",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "72.93",
        "mobile_sales": "60.28",
        "doordash_sales": "71.31",
        "ubereats_sales": "33.87",
        "grubhub_sales": "41.51"
      },
      {
        "hour": 22,
        "royalty_obligation": "129.74",
        "phone_sales": "6.79",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "0.00",
        "mobile_sales": "22.95",
        "doordash_sales": "36.10",
        "ubereats_sales": "0.00",
        "grubhub_sales": "11.09"
      },
      {
        "hour": 23,
        "royalty_obligation": "62.01",
        "phone_sales": "11.08",
        "call_center_sales": "0.00",
        "drive_thru_sales": "0.00",
        "website_sales": "0.00",
        "mobile_sales": "4.99",
        "doordash_sales": "18.78",
        "ubereats_sales": "0.00",
        "grubhub_sales": "0.00"
      }
    ],

    https://apexcharts.com/react-chart-demos/bar-charts/stacked/

     const ApexChart = () => {
        const [state, setState] = React.useState({
          
            series: [{
              name: 'Marine Sprite',
              data: [44, 55, 41, 37, 22, 43, 21]
            }, {
              name: 'Striking Calf',
              data: [53, 32, 33, 52, 13, 43, 32]
            }, {
              name: 'Tank Picture',
              data: [12, 17, 11, 9, 15, 11, 20]
            }, {
              name: 'Bucket Slope',
              data: [9, 7, 5, 8, 6, 9, 4]
            }, {
              name: 'Reborn Kid',
              data: [25, 12, 19, 32, 25, 24, 10]
            }],
            options: {
              chart: {
                type: 'bar',
                height: 350,
                stacked: true,
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  dataLabels: {
                    total: {
                      enabled: true,
                      offsetX: 0,
                      style: {
                        fontSize: '13px',
                        fontWeight: 900
                      }
                    }
                  }
                },
              },
              stroke: {
                width: 1,
                colors: ['#fff']
              },
              title: {
                text: 'Fiction Books Sales'
              },
              xaxis: {
                categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
                labels: {
                  formatter: function (val) {
                    return val + "K"
                  }
                }
              },
              yaxis: {
                title: {
                  text: undefined
                },
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return val + "K"
                  }
                }
              },
              fill: {
                opacity: 1
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40
              }
            },
          
          
        });

        

        return (
          <div>
            <div id="chart">
                <ReactApexChart options={state.options} series={state.series} type="bar" height={350} />
              </div>
            <div id="html-dist"></div>
          </div>
        );
      }

      const domContainer = document.querySelector('#app');
      ReactDOM.render(<ApexChart />, domContainer);

      here we will display the hours and replace it with the date 
      we will display royalty_obligation as total and we will display the rest of them as rows 

        "total_cash_sales": 936.11,
    "total_deposit": 938,
    "over_short": 2.16,
    "refunded_orders": {
      "count": 0,
      "sales": 0
    },
    "customer_count": 430,
    "waste": {
      "alta_inventory": 23.27,
      "normal": 183.45
    },
    "total_tips": 107.91,

    here we will display them in one place in a nice way and with best practices 

     "hnr_transactions": 188,
    "hnr_broken_promises": 6,
    "portal": {
      "portal_eligible_orders": 156,
      "portal_used_orders": 156,
      "portal_on_time_orders": 153,
      "put_into_portal_percent": 100,
      "in_portal_on_time_percent": 98.08
    }
  }

  and we will do the same here 

  and for now we will use half pie chart like the fuel counter for labor but we will make it static for now and here is and example you can find it half-pie.jpg




