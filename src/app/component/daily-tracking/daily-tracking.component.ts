import { Component, OnInit } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexFill,
  ApexStroke,
  ApexGrid,
  ApexLegend,
  ApexTooltip,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis | ApexYAxis[];  // <== Ici j'ajoute la compatibilité tableau
  xaxis?: ApexXAxis;
  fill?: ApexFill;
  stroke?: ApexStroke;
  grid?: ApexGrid;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  title?: ApexTitleSubtitle;
  colors?: string[];
};



@Component({
  selector: 'app-daily-tracking',
  templateUrl: './daily-tracking.component.html',
  styleUrls: ['./daily-tracking.component.css']
})
export class DailyTrackingComponent implements OnInit {

  cashFlowChartOptions!: Partial<ChartOptions>;
  amountEstimationChartOptions!: Partial<ChartOptions>;
  mixedChartOptions!: Partial<ChartOptions>;


  timeRange: string = 'day';
  selectedDate: Date = new Date();
  predefinedMessages = [
    "Urgent: Please recharge retailers in your zone",
    "Reminder: Visit critical retailers today",
    "New campaign: Promote mobile money deposits",
    "Alert: High cashout demand in your area"
  ];
  selectedMessage: string = this.predefinedMessages[0];
  customMessage: string = '';
  activeTab: string = 'notification';
  selectedAggregator: any = null;
  selectedRetailer: any = null;

  aggregators = [
    { id: 1, firstName: 'Paul', lastName: 'Mba', zone: 'Libreville', score: 245, trend: 'up', points: 12, performance: 'high', lastActivity: '2 hours ago' },
    { id: 2, firstName: 'Marie', lastName: 'Nkoghe', zone: 'Port-Gentil', score: 218, trend: 'up', points: 8, performance: 'medium', lastActivity: '1 hour ago' },
    { id: 3, firstName: 'Jean', lastName: 'Dupont', zone: 'Franceville', score: 198, trend: 'down', points: 5, performance: 'low', lastActivity: '30 minutes ago' },
    { id: 4, firstName: 'Luc', lastName: 'Owono', zone: 'Oyem', score: 185, trend: 'up', points: 15, performance: 'high', lastActivity: '3 hours ago' },
    { id: 5, firstName: 'Alice', lastName: 'Minko', zone: 'Mouila', score: 172, trend: 'down', points: 3, performance: 'medium', lastActivity: '45 minutes ago' }
  ];

  retailers = [
    { id: 1, name: 'Retailer 1', alerts: 3, status: 'green', trend: 'stable', lastAlert: '1 hour ago', principal: 45000, withdrawal: 12000, profit: 3000 },
    { id: 2, name: 'Retailer 2', alerts: 5, status: 'orange', trend: 'up', lastAlert: '30 minutes ago', principal: 32000, withdrawal: 8000, profit: 2000 },
    { id: 3, name: 'Retailer 3', alerts: 9, status: 'red', trend: 'up', lastAlert: '15 minutes ago', principal: 28000, withdrawal: 15000, profit: 2500 },
    { id: 4, name: 'Retailer 4', alerts: 2, status: 'green', trend: 'down', lastAlert: '2 hours ago', principal: 38000, withdrawal: 9000, profit: 2200 },
    { id: 5, name: 'Retailer 5', alerts: 7, status: 'red', trend: 'stable', lastAlert: '45 minutes ago', principal: 42000, withdrawal: 11000, profit: 2800 }
  ];

  recentActions = [
    { type: 'recharge', title: 'Recharged 3 retailers', time: '2 hours ago' },
    { type: 'visit', title: 'Visited critical retailer', time: '4 hours ago' },
    { type: 'training', title: 'Completed training', time: '1 day ago' }
  ];

  recentAlerts = [
    { type: 'cashout', title: 'High cashout demand', time: '15 minutes ago' },
    { type: 'recharge', title: 'Low balance alert', time: '30 minutes ago' },
    { type: 'cashout', title: 'Cashout request', time: '1 hour ago' }
  ];

  recentTransactions = [
    { date: 'Today', type: 'Deposit', amount: '15,000', status: 'completed' },
    { date: 'Today', type: 'Withdrawal', amount: '8,000', status: 'completed' },
    { date: 'Yesterday', type: 'Deposit', amount: '12,000', status: 'completed' },
    { date: 'Yesterday', type: 'Transfer', amount: '5,000', status: 'pending' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initCharts();
    this.initCounterAnimation();
    this.initRankingAnimation();
    this.initFilterToggle();
  }

  initCharts(): void {
    // Cash Flow Chart (Cash In vs Cash Out)
    this.cashFlowChartOptions = {
      series: [
        {
          name: "Cash In Requests",
          data: [12, 15, 10, 18, 14, 20, 16]
        },
        {
          name: "Cash Out Requests",
          data: [8, 10, 12, 9, 11, 15, 13]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false
        }
      },
      colors: ["#2ecc71", "#e74c3c"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: "smooth"
      },
      xaxis: {
        categories: this.getXAxisCategories(),
        title: {
          text: this.getXAxisTitle()
        }
      },
      yaxis: {
        title: {
          text: "Number of Retailers"
        }
      },
      legend: {
        position: "top"
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " retailers";
          }
        }
      }
    };

    // Amount Estimation Chart
    this.amountEstimationChartOptions = {
      series: [
        {
          name: "Cash In Amount",
          data: [450000, 520000, 380000, 610000, 490000, 750000, 680000]
        },
        {
          name: "Cash Out Amount",
          data: [280000, 310000, 350000, 290000, 330000, 450000, 390000]
        }
      ],
      chart: {
        height: 350,
        type: "area",
        stacked: false,
        toolbar: {
          show: false
        }
      },
      colors: ["#3498db", "#9b59b6"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: "smooth"
      },
      xaxis: {
        categories: this.getXAxisCategories(),
        title: {
          text: this.getXAxisTitle()
        }
      },
      yaxis: {
        title: {
          text: "Amount (XAF)"
        },
        labels: {
          formatter: function (val) {
            return (val / 1000) + "K";
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "XAF " + val.toLocaleString();
          }
        }
      }
    };

    // Mixed Chart (Bar + Line)
    this.mixedChartOptions = {
      series: [
        {
          name: "Retailers",
          type: "column",
          data: [12, 15, 10, 18, 14, 20, 16]
        },
        {
          name: "Amount (XAF 1000)",
          type: "line",
          data: [450, 520, 380, 610, 490, 750, 680]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false
        }
      },
      colors: ["#3498db", "#9b59b6"],
      stroke: {
        width: [0, 3]
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: this.getXAxisCategories(),
        title: {
          text: this.getXAxisTitle()
        }
      },
      yaxis: [
        {
          title: {
            text: "Retailers"
          }
        },
        {
          opposite: true,
          title: {
            text: "Amount (XAF 1000)"
          }
        }
      ],
      tooltip: {
        y: {
          formatter: function (val, { seriesIndex }) {
            return seriesIndex === 0 ? val + " retailers" : "XAF " + (val * 1000).toLocaleString();
          }
        }
      }
    };
  }

  getXAxisCategories(): string[] {
    if (this.timeRange === 'day') {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else if (this.timeRange === 'month') {
      return ["Week 1", "Week 2", "Week 3", "Week 4"];
    } else {
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    }
  }

  getXAxisTitle(): string {
    return this.timeRange === 'day' ? 'Day' :
      this.timeRange === 'month' ? 'Week of Month' : 'Month';
  }

  setTimeRange(range: string): void {
    this.timeRange = range;
    this.initCharts();
  }

  initCounterAnimation(): void {
    const counters = document.querySelectorAll<HTMLElement>('.counter');
    const speed = 200;

    counters.forEach(counter => {
      const targetAttr = counter.getAttribute('data-target');
      if (!targetAttr) return;  // Sécurité : ignorer si pas d'attribut

      const target = +targetAttr;
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment).toString();
        setTimeout(() => this.initCounterAnimation(), 1);
      } else {
        counter.innerText = target.toString();
      }
    });
  }


  initRankingAnimation(): void {
    setInterval(() => {
      // Simulate ranking changes
      this.aggregators = this.aggregators.map(agg => {
        const change = Math.floor(Math.random() * 6) - 2; // -2 to +3
        const newScore = Math.max(100, agg.score + change);

        return {
          ...agg,
          score: newScore,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : agg.trend,
          points: Math.abs(change),
          lastActivity: this.getRandomTimeAgo()
        };
      }).sort((a, b) => b.score - a.score);
    }, 5000);
  }

  getRandomTimeAgo(): string {
    const times = ['5 minutes ago', '15 minutes ago', '30 minutes ago', '1 hour ago', '2 hours ago'];
    return times[Math.floor(Math.random() * times.length)];
  }

  initFilterToggle(): void {
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    if (filterBtn && filterDropdown) {
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!filterBtn.contains(e.target as Node) && !filterDropdown.contains(e.target as Node)) {
          filterDropdown.classList.add('hidden');
        }
      });
    }
  }

  openAggregatorModal(aggregator: any): void {
    this.selectedAggregator = aggregator;
    this.activeTab = 'notification';
    const modal = document.getElementById('aggregatorModal');
    if (modal) modal.classList.remove('hidden');
  }

  openRetailerModal(retailer: any): void {
    this.selectedRetailer = retailer;
    this.activeTab = 'details';
    const modal = document.getElementById('retailerModal');
    if (modal) modal.classList.remove('hidden');
    this.initCounterAnimation(); // Animate the account balances
  }

  closeModal(): void {
    document.getElementById('aggregatorModal')?.classList.add('hidden');
    document.getElementById('retailerModal')?.classList.add('hidden');
  }

  sendNotification(): void {
    const message = this.customMessage || this.selectedMessage;
    alert(`Notification sent to ${this.selectedAggregator.firstName}:\n\n${message}`);
    this.closeModal();
  }
}
