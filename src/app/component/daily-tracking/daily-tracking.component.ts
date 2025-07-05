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
  yaxis?: ApexYAxis | ApexYAxis[]; // Tableau ou objet accepté
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

  timeRange = 'day';
  selectedDate = '';  // Pas de filtre initial
  selectedZone = '';
  zones = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Mouila'];

  predefinedMessages = [
    "Urgent: Please recharge retailers in your zone",
    "Reminder: Visit critical retailers today",
    "New campaign: Promote mobile money deposits",
    "Alert: High cashout demand in your area"
  ];

  selectedMessage = this.predefinedMessages[0];
  customMessage = '';
  activeTab = 'notification';

  selectedAggregator: any = null;
  selectedRetailer: any = null;

  sortedAggregators: any[] = [];
  previousTopAggregator: any = null;

  sortedCashInRetailers: any[] = [];
  sortedCashOutRetailers: any[] = [];
  previousTopCashInRetailer: any = null;
  previousTopCashOutRetailer: any = null;

  showPrincipalColumn = true;
  showWithdrawalColumn = true;

  aggregators = [
    { id: 1, firstName: 'Paul', lastName: 'Mba', zone: 'Libreville', score: 245, trend: 'up', points: 12, performance: 'high', lastActivity: '2 hours ago' },
    { id: 2, firstName: 'Marie', lastName: 'Nkoghe', zone: 'Port-Gentil', score: 218, trend: 'up', points: 8, performance: 'medium', lastActivity: '1 hour ago' },
    { id: 3, firstName: 'Jean', lastName: 'Dupont', zone: 'Franceville', score: 198, trend: 'down', points: 5, performance: 'low', lastActivity: '30 minutes ago' },
    { id: 4, firstName: 'Luc', lastName: 'Owono', zone: 'Oyem', score: 185, trend: 'up', points: 15, performance: 'high', lastActivity: '3 hours ago' },
    { id: 5, firstName: 'Alice', lastName: 'Minko', zone: 'Mouila', score: 172, trend: 'down', points: 3, performance: 'medium', lastActivity: '45 minutes ago' }
  ];
  retailers = [
    {
      id: 1,
      name: "Revendeur Mont-Bouët",
      zone: "Libreville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 5,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "2h ago",
      cashOutAlerts: 3,
      cashOutStatus: "green",
      cashOutTrend: "stable",
      principal: 85000,
      withdrawal: 32000,
      profit: 5300
    },
    {
      id: 2,
      name: "Revendeur Nzeng-Ayong",
      zone: "Libreville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 8,
      cashInStatus: "red",
      cashInTrend: "up",
      lastCashInAlert: "45m ago",
      cashOutAlerts: 2,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 62000,
      withdrawal: 28000,
      profit: 4200
    },
    {
      id: 3,
      name: "Revendeur Port-Gentil Centre",
      zone: "Port-Gentil",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 3,
      cashInStatus: "green",
      cashInTrend: "stable",
      lastCashInAlert: "5h ago",
      cashOutAlerts: 7,
      cashOutStatus: "red",
      cashOutTrend: "up",
      principal: 78000,
      withdrawal: 45000,
      profit: 6100
    },
    {
      id: 4,
      name: "Revendeur Akanda",
      zone: "Libreville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 6,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "1h ago",
      cashOutAlerts: 4,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 92000,
      withdrawal: 38000,
      profit: 6700
    },
    {
      id: 5,
      name: "Revendeur Franceville Centre",
      zone: "Franceville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 2,
      cashInStatus: "green",
      cashInTrend: "down",
      lastCashInAlert: "8h ago",
      cashOutAlerts: 1,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 45000,
      withdrawal: 15000,
      profit: 2800
    },
    {
      id: 6,
      name: "Revendeur Owendo",
      zone: "Libreville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 9,
      cashInStatus: "red",
      cashInTrend: "up",
      lastCashInAlert: "30m ago",
      cashOutAlerts: 5,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 105000,
      withdrawal: 52000,
      profit: 7800
    },
    {
      id: 7,
      name: "Revendeur Lambaréné",
      zone: "Moyen-Ogooué",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 4,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "3h ago",
      cashOutAlerts: 3,
      cashOutStatus: "green",
      cashOutTrend: "stable",
      principal: 68000,
      withdrawal: 25000,
      profit: 3900
    },
    {
      id: 8,
      name: "Revendeur Tchibanga",
      zone: "Nyanga",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 1,
      cashInStatus: "green",
      cashInTrend: "down",
      lastCashInAlert: "12h ago",
      cashOutAlerts: 6,
      cashOutStatus: "red",
      cashOutTrend: "up",
      principal: 38000,
      withdrawal: 42000,
      profit: 3100
    },
    {
      id: 9,
      name: "Revendeur Mouila",
      zone: "Ngounié",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 7,
      cashInStatus: "red",
      cashInTrend: "stable",
      lastCashInAlert: "1h ago",
      cashOutAlerts: 2,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 74000,
      withdrawal: 29000,
      profit: 5200
    },
    {
      id: 10,
      name: "Revendeur Oyem",
      zone: "Woleu-Ntem",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 3,
      cashInStatus: "green",
      cashInTrend: "stable",
      lastCashInAlert: "6h ago",
      cashOutAlerts: 4,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 55000,
      withdrawal: 33000,
      profit: 4100
    },
    {
      id: 11,
      name: "Revendeur Bitam",
      zone: "Woleu-Ntem",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 5,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "2h ago",
      cashOutAlerts: 3,
      cashOutStatus: "green",
      cashOutTrend: "stable",
      principal: 63000,
      withdrawal: 27000,
      profit: 4500
    },
    {
      id: 12,
      name: "Revendeur Port-Gentil Sud",
      zone: "Port-Gentil",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 8,
      cashInStatus: "red",
      cashInTrend: "up",
      lastCashInAlert: "40m ago",
      cashOutAlerts: 5,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 97000,
      withdrawal: 51000,
      profit: 7200
    },
    {
      id: 13,
      name: "Revendeur Koulamoutou",
      zone: "Ogooué-Lolo",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 2,
      cashInStatus: "green",
      cashInTrend: "down",
      lastCashInAlert: "9h ago",
      cashOutAlerts: 1,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 41000,
      withdrawal: 18000,
      profit: 2900
    },
    {
      id: 14,
      name: "Revendeur Makokou",
      zone: "Ogooué-Ivindo",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 6,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "1h ago",
      cashOutAlerts: 4,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 58000,
      withdrawal: 35000,
      profit: 4700
    },
    {
      id: 15,
      name: "Revendeur Libreville Quartsier Louis",
      zone: "Libreville",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 4,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "3h ago",
      cashOutAlerts: 7,
      cashOutStatus: "red",
      cashOutTrend: "up",
      principal: 89000,
      withdrawal: 47000,
      profit: 6800
    },
    {
      id: 16,
      name: "Revendeur Moanda",
      zone: "Haut-Ogooué",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 3,
      cashInStatus: "green",
      cashInTrend: "stable",
      lastCashInAlert: "7h ago",
      cashOutAlerts: 2,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 52000,
      withdrawal: 22000,
      profit: 3700
    },
    {
      id: 17,
      name: "Revendeur Ntoum",
      zone: "Estuaire",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 7,
      cashInStatus: "red",
      cashInTrend: "up",
      lastCashInAlert: "50m ago",
      cashOutAlerts: 3,
      cashOutStatus: "green",
      cashOutTrend: "stable",
      principal: 76000,
      withdrawal: 31000,
      profit: 5400
    },
    {
      id: 18,
      name: "Revendeur Lastourville",
      zone: "Ogooué-Lolo",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 1,
      cashInStatus: "green",
      cashInTrend: "down",
      lastCashInAlert: "10h ago",
      cashOutAlerts: 5,
      cashOutStatus: "orange",
      cashOutTrend: "up",
      principal: 37000,
      withdrawal: 39000,
      profit: 3300
    },
    {
      id: 19,
      name: "Revendeur Gamba",
      zone: "Ogooué-Maritime",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 5,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "2h ago",
      cashOutAlerts: 2,
      cashOutStatus: "green",
      cashOutTrend: "down",
      principal: 49000,
      withdrawal: 21000,
      profit: 3500
    },
    {
      id: 20,
      name: "Revendeur Fougamou",
      zone: "Ngounié",
      date: new Date().toISOString().split('T')[0],
      cashInAlerts: 4,
      cashInStatus: "orange",
      cashInTrend: "up",
      lastCashInAlert: "4h ago",
      cashOutAlerts: 6,
      cashOutStatus: "red",
      cashOutTrend: "up",
      principal: 67000,
      withdrawal: 43000,
      profit: 5500
    }
  ];

  recentActions = [
    { type: 'recharge', title: 'Recharged 3 retailers', time: '2 hours ago' },
    { type: 'visit', title: 'Visited critical retailer', time: '4 hours ago' },
    { type: 'training', title: 'Completed training', time: '1 day ago' }
  ];
  recentTransactions = [
    { date: 'Today', type: 'Deposit', amount: '15,000', status: 'completed' },
    { date: 'Today', type: 'Withdrawal', amount: '8,000', status: 'completed' },
    { date: 'Yesterday', type: 'Deposit', amount: '12,000', status: 'completed' },
    { date: 'Yesterday', type: 'Transfer', amount: '5,000', status: 'pending' }
  ];

  recentAlerts = [
    { type: 'cashout', title: 'High cashout demand', time: '15 minutes ago' },
    { type: 'recharge', title: 'Low balance alert', time: '30 minutes ago' },
    { type: 'cashout', title: 'Cashout request', time: '1 hour ago' }
  ];


  constructor() { }

  ngOnInit(): void {
    this.initCharts();
    this.initCounterAnimation();
    this.initRankingAnimation();
    this.initFilterToggle();
    this.updateSortedAggregators();
    this.updateRetailersRanking();

    setInterval(() => this.updateAggregatorsRanking(), 5000);
    setInterval(() => this.updateRetailersRanking(), 5000);
  }
  updateSortedAggregators(): void {
    this.sortedAggregators = [...this.aggregators]
      .sort((a, b) => b.score - a.score)
      .map((agg, index) => ({
        ...agg,
        isNewTop: index === 0 && (!this.previousTopAggregator || agg.id !== this.previousTopAggregator.id)
      }));

    if (this.sortedAggregators.length > 0) {
      this.previousTopAggregator = { ...this.sortedAggregators[0] };
    }
  }

  setTimeRange(range: string): void {
    this.timeRange = range;
    this.initCharts();
  }
  openAggregatorModal(aggregator: any): void {
    this.selectedAggregator = aggregator;
    this.activeTab = 'notification';
    const modal = document.getElementById('aggregatorModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  sendNotification(): void {
    const message = this.customMessage || this.selectedMessage;
    if (this.selectedAggregator) {
      alert(`Notification sent to ${this.selectedAggregator.firstName}:\n\n${message}`);
    }
    this.closeModal();
  }



  updateAggregatorsRanking(): void {
    this.aggregators = this.aggregators.map(agg => {
      const change = Math.floor(Math.random() * 10) - 3;
      const newScore = Math.max(0, agg.score + change);

      return {
        ...agg,
        score: newScore,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : agg.trend,
        points: Math.abs(change),
        lastActivity: this.getRandomTimeAgo()
      };
    });

    this.sortedAggregators = [...this.aggregators]
      .sort((a, b) => b.score - a.score)
      .map((agg, index) => ({
        ...agg,
        isNewTop: index === 0 && (!this.previousTopAggregator || agg.id !== this.previousTopAggregator.id)
      }));

    if (this.sortedAggregators.length > 0) {
      this.previousTopAggregator = { ...this.sortedAggregators[0] };
    }

    setTimeout(() => {
      this.sortedAggregators = this.sortedAggregators.map(agg => ({
        ...agg,
        isNewTop: false
      }));
    }, 3000);
  }


  applyFilters(): void {
    this.updateRetailersRanking();
  }

  toggleColumn(column: string): void {
    if (column === 'principal') {
      this.showPrincipalColumn = !this.showPrincipalColumn;
    } else if (column === 'withdrawal') {
      this.showWithdrawalColumn = !this.showWithdrawalColumn;
    }
  }

  initCharts(): void {
    this.cashFlowChartOptions = {
      series: [
        { name: "Cash In Requests", data: [12, 15, 10, 18, 14, 20, 16] },
        { name: "Cash Out Requests", data: [8, 10, 12, 9, 11, 15, 13] }
      ],
      chart: { height: 350, type: "line", toolbar: { show: false } },
      colors: ["#2ecc71", "#e74c3c"],
      dataLabels: { enabled: false },
      stroke: { width: 3, curve: "smooth" },
      xaxis: { categories: this.getXAxisCategories(), title: { text: this.getXAxisTitle() } },
      yaxis: { title: { text: "Number of Retailers" } },
      legend: { position: "top" },
      tooltip: {
        y: { formatter: val => `${val} retailers` }
      }
    };

    this.amountEstimationChartOptions = {
      series: [
        { name: "Cash In Amount", data: [450000, 520000, 380000, 610000, 490000, 750000, 680000] },
        { name: "Cash Out Amount", data: [280000, 310000, 350000, 290000, 330000, 450000, 390000] }
      ],
      chart: { height: 350, type: "area", stacked: false, toolbar: { show: false } },
      colors: ["#3498db", "#9b59b6"],
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: "smooth" },
      xaxis: { categories: this.getXAxisCategories(), title: { text: this.getXAxisTitle() } },
      yaxis: {
        title: { text: "Amount (XAF)" },
        labels: { formatter: val => `${val / 1000}K` }
      },
      tooltip: {
        y: { formatter: val => `XAF ${val.toLocaleString()}` }
      }
    };

    this.mixedChartOptions = {
      series: [
        { name: "Retailers", type: "column", data: [12, 15, 10, 18, 14, 20, 16] },
        { name: "Amount Estimated (XAF 1000)", type: "line", data: [450, 520, 380, 610, 490, 750, 680] }
      ],
      chart: { height: 350, type: "line", toolbar: { show: false } },
      colors: ["#3498db", "#9b59b6"],
      stroke: { width: [0, 3] },
      dataLabels: { enabled: false },
      xaxis: { categories: this.getXAxisCategories(), title: { text: this.getXAxisTitle() } },
      yaxis: [
        { title: { text: "Retailers" } },
        { opposite: true, title: { text: "Amount (XAF 1000)" } }
      ],
      tooltip: {
        y: {
          formatter: (val, { seriesIndex }) =>
            seriesIndex === 0 ? `${val} retailers` : `XAF ${(val * 1000).toLocaleString()}`
        }
      }
    };
  }

  updateRetailersRanking(): void {
    let filtered = [...this.retailers];
    if (this.selectedZone) filtered = filtered.filter(r => r.zone === this.selectedZone);
    if (this.selectedDate) filtered = filtered.filter(r => r.date === this.selectedDate);

    filtered = filtered.map(r => {
      const cashInChange = Math.floor(Math.random() * 3) - 1;
      const cashOutChange = Math.floor(Math.random() * 3) - 1;

      return {
        ...r,
        cashInAlerts: Math.max(0, r.cashInAlerts + cashInChange),
        cashInStatus: this.getStatus(r.cashInAlerts + cashInChange),
        cashInTrend: cashInChange > 0 ? 'up' : cashInChange < 0 ? 'down' : r.cashInTrend,
        lastCashInAlert: this.getRandomTimeAgo(),

        cashOutAlerts: Math.max(0, r.cashOutAlerts + cashOutChange),
        cashOutStatus: this.getStatus(r.cashOutAlerts + cashOutChange),
        cashOutTrend: cashOutChange > 0 ? 'up' : cashOutChange < 0 ? 'down' : r.cashOutTrend,
        lastCashOutAlert: this.getRandomTimeAgo()
      };
    });

    this.sortedCashInRetailers = [...filtered].sort((a, b) => b.cashInAlerts - a.cashInAlerts);
    this.sortedCashOutRetailers = [...filtered].sort((a, b) => b.cashOutAlerts - a.cashOutAlerts);
  }

  getStatus(alerts: number): string {
    return alerts <= 3 ? 'green' : alerts <= 6 ? 'orange' : 'red';
  }

  initCounterAnimation(): void {
    const counters = document.querySelectorAll<HTMLElement>('.counter');
    const speed = 200;

    counters.forEach(counter => {
      const targetAttr = counter.getAttribute('data-target');
      if (!targetAttr) return;

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
      this.aggregators = this.aggregators.map(agg => {
        const change = Math.floor(Math.random() * 6) - 2;
        return {
          ...agg,
          score: Math.max(100, agg.score + change),
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
    const btn = document.getElementById('filterBtn');
    const dropdown = document.getElementById('filterDropdown');

    if (btn && dropdown) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', e => {
        if (!btn.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
          dropdown.classList.add('hidden');
        }
      });
    }
  }

  openRetailerModal(retailer: any): void {
    this.selectedRetailer = retailer;
    this.activeTab = 'details';
    document.getElementById('retailerModal')?.classList.remove('hidden');
    this.initCounterAnimation();
  }

  closeModal(): void {
    document.getElementById('aggregatorModal')?.classList.add('hidden');
    document.getElementById('retailerModal')?.classList.add('hidden');
  }

  getXAxisCategories(): string[] {
    return this.timeRange === 'day' ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : this.timeRange === 'month' ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  }

  getXAxisTitle(): string {
    return this.timeRange === 'day' ? 'Day' : this.timeRange === 'month' ? 'Week of Month' : 'Month';
  }
}
