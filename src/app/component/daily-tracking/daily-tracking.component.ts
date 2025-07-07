import { Component, OnInit } from '@angular/core';
// import {
//   ApexAxisChartSeries,
//   ApexChart,
//   ApexDataLabels,
//   ApexPlotOptions,
//   ApexYAxis,
//   ApexXAxis,
//   ApexFill,
//   ApexStroke,
//   ApexGrid,
//   ApexLegend,
//   ApexTooltip,
//   ApexTitleSubtitle
// } from "ng-apexcharts";

// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   dataLabels?: ApexDataLabels;
//   plotOptions?: ApexPlotOptions;
//   yaxis?: ApexYAxis | ApexYAxis[]; // Tableau ou objet accepté
//   xaxis?: ApexXAxis;
//   fill?: ApexFill;
//   stroke?: ApexStroke;
//   grid?: ApexGrid;
//   legend?: ApexLegend;
//   tooltip?: ApexTooltip;
//   title?: ApexTitleSubtitle;
//   colors?: string[];
// };

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexTooltip,
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
};

interface Retailer {
  id: number;
  code: string;
  fullName: string;
  zone: string;
  status: 'active' | 'inactive' | 'critical';
  type: 'VIP' | 'ordinary';
  principalBalance: number;
  withdrawalBalance: number;
  autoTransferAmount: number;
  lastActivityDate: Date;
  topAggregatorCode: string;
  messageReceived: string;

  statusDetails: {
    needCashIn: boolean;
    needCashOut: boolean;
    availableForTransfer: boolean;
    dormant: boolean;
    inactive: boolean;
  };

  topAggregator: {
    code: string;
    fullName: string;
    zone: string;
    status: 'active' | 'inactive';
    phone: string;
    email: string;
  };

  balanceHistory?: {
    date: Date;
    principalBalance: number;
    withdrawalBalance: number;
    autoTransferAmount: number;
  }[];

  // Optionnel - pour les statistiques supplémentaires
  statistics?: {
    totalTransactions?: number;
    monthlyAverage?: number;
    lastTransactionAmount?: number;
  };
}
@Component({
  selector: 'app-daily-tracking',
  templateUrl: './daily-tracking.component.html',
  styleUrls: ['./daily-tracking.component.css']
})
export class DailyTrackingComponent implements OnInit {

  chartOptions!: Partial<ChartOptions>;
  Math = Math;
  today: Date = new Date();
  timeRange = 'day';
  selectedDate = '';  // Pas de filtre initial
  selectedZone = '';
  zones: string[] = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Mouila'];
  filteredRetailers: Retailer[] = [];
  selectedRetailers: Retailer[] = [];
  allSelected: boolean = false;
  // Modal related properties
  selectedRetailer: Retailer | null = null;
  showBulkSMSModal: boolean = false;
  activeTab: 'retailer' | 'aggregator' = 'retailer';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectedStatus: string = '';
  itemsPerPageOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'needCashIn', label: 'Need Cash In' },
    { value: 'needCashOut', label: 'Need Cash Out' },
    { value: 'availableForTransfer', label: 'Available for Transfer' },
    { value: 'dormant', label: 'Dormant' },
    { value: 'inactive', label: 'Inactive' }
  ];
  // Bulk SMS properties
  bulkMessages: string[] = [
    'Your account needs attention. Please check your balances.',
    'Your principal balance is low. Please recharge soon.',
    'Thank you for your recent transactions.'
  ];
  selectedBulkMessage: string = '';
  bulkMessageContent: string = '';
  retailers: Retailer[] = [
    // 1-10: Libreville VIP
    {
      id: 1, code: 'RTL-001', fullName: 'Jean Okou', zone: 'Libreville', status: 'active', type: 'VIP',
      principalBalance: 1250000, withdrawalBalance: 320000, autoTransferAmount: 150000, lastActivityDate: new Date('2023-05-20'),
      topAggregatorCode: 'AGG-LB-01', messageReceived: "Veuillez effectuer un retrait urgent",
      statusDetails: { needCashIn: false, needCashOut: true, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-LB-01', fullName: 'Marc Ondo', zone: 'Libreville', status: 'active', phone: '+24101234567', email: 'm.ondo@aggregator.ga' },
      balanceHistory: generateBalanceHistory(1000000, 300000, 200000, 150000, 100000, 80000)
    },
    {
      id: 2, code: 'RTL-002', fullName: 'Sarah Nguema', zone: 'Libreville', status: 'active', type: 'ordinary',
      principalBalance: 850000, withdrawalBalance: 210000, autoTransferAmount: 80000, lastActivityDate: new Date('2023-05-18'),
      topAggregatorCode: 'AGG-LB-02', messageReceived: "Approvisionnement nécessaire",
      statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-LB-02', fullName: 'Pauline Mba', zone: 'Libreville', status: 'active', phone: '+24102345678', email: 'p.mba@aggregator.ga' },
      balanceHistory: generateBalanceHistory(700000, 200000, 150000, 100000, 50000, 50000)
    },
    {
      id: 3, code: 'RTL-003', fullName: 'David Minko', zone: 'Libreville', status: 'critical', type: 'ordinary',
      principalBalance: 150000, withdrawalBalance: 95000, autoTransferAmount: 20000, lastActivityDate: new Date('2023-05-15'),
      topAggregatorCode: 'AGG-LB-03', messageReceived: "Solde critique - approvisionnement immédiat",
      statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-LB-03', fullName: 'Lucie Benga', zone: 'Libreville', status: 'active', phone: '+24103456789', email: 'l.benga@aggregator.ga' },
      balanceHistory: generateBalanceHistory(100000, 100000, 50000, 60000, 10000, 15000)
    },
    {
      id: 4, code: 'RTL-004', fullName: 'Grace Ndong', zone: 'Libreville', status: 'inactive', type: 'ordinary',
      principalBalance: 50000, withdrawalBalance: 20000, autoTransferAmount: 0, lastActivityDate: new Date('2023-04-10'),
      topAggregatorCode: 'AGG-LB-01', messageReceived: "Compte inactif - contactez support",
      statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: false, dormant: true, inactive: true },
      topAggregator: { code: 'AGG-LB-01', fullName: 'Marc Ondo', zone: 'Libreville', status: 'active', phone: '+24101234567', email: 'm.ondo@aggregator.ga' },
      balanceHistory: generateBalanceHistory(80000, 30000, 30000, 20000, 0, 0)
    },
    {
      id: 5, code: 'RTL-005', fullName: 'Kevin Mbina', zone: 'Libreville', status: 'active', type: 'VIP',
      principalBalance: 750000, withdrawalBalance: 180000, autoTransferAmount: 120000, lastActivityDate: new Date('2023-05-19'),
      topAggregatorCode: 'AGG-LB-04', messageReceived: "Transfert disponible",
      statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-LB-04', fullName: 'Alain Sounga', zone: 'Libreville', status: 'inactive', phone: '+24104567890', email: 'a.sounga@aggregator.ga' },
      balanceHistory: generateBalanceHistory(600000, 200000, 120000, 80000, 80000, 60000)
    },
    {
      id: 6, code: 'RTL-006', fullName: 'Marie-Louise Engonga', zone: 'Port-Gentil', status: 'active', type: 'VIP',
      principalBalance: 920000, withdrawalBalance: 310000, autoTransferAmount: 180000, lastActivityDate: new Date('2023-05-20'),
      topAggregatorCode: 'AGG-PG-01', messageReceived: "Retrait demandé",
      statusDetails: { needCashIn: false, needCashOut: true, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-PG-01', fullName: 'Pierre Moussavou', zone: 'Port-Gentil', status: 'active', phone: '+24105678901', email: 'p.moussavou@aggregator.ga' },
      balanceHistory: generateBalanceHistory(800000, 250000, 250000, 120000, 120000, 90000)
    },
    {
      id: 7, code: 'RTL-007', fullName: 'Roger Ndong Obiang', zone: 'Port-Gentil', status: 'active', type: 'ordinary',
      principalBalance: 680000, withdrawalBalance: 250000, autoTransferAmount: 90000, lastActivityDate: new Date('2023-05-18'),
      topAggregatorCode: 'AGG-PG-02', messageReceived: "Solde disponible pour transfert",
      statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-PG-02', fullName: 'Christine Mbina', zone: 'Port-Gentil', status: 'active', phone: '+24106789012', email: 'c.mbina@aggregator.ga' },
      balanceHistory: generateBalanceHistory(550000, 200000, 180000, 100000, 60000, 50000)
    },
    {
      id: 8, code: 'RTL-008', fullName: 'Patricia Nzeng', zone: 'Port-Gentil', status: 'critical', type: 'ordinary',
      principalBalance: 120000, withdrawalBalance: 85000, autoTransferAmount: 15000, lastActivityDate: new Date('2023-05-16'),
      topAggregatorCode: 'AGG-PG-03', messageReceived: "URGENT: Approvisionnement requis",
      statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-PG-03', fullName: 'Gérard Oyoubi', zone: 'Port-Gentil', status: 'inactive', phone: '+24107890123', email: 'g.oyoubi@aggregator.ga' },
      balanceHistory: generateBalanceHistory(150000, 50000, 60000, 40000, 10000, 10000)
    },
    {
      id: 9, code: 'RTL-009', fullName: 'Albert Bivigou', zone: 'Port-Gentil', status: 'active', type: 'ordinary',
      principalBalance: 430000, withdrawalBalance: 190000, autoTransferAmount: 50000, lastActivityDate: new Date('2023-05-17'),
      topAggregatorCode: 'AGG-PG-01', messageReceived: "Besoin de retrait",
      statusDetails: { needCashIn: false, needCashOut: true, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-PG-01', fullName: 'Pierre Moussavou', zone: 'Port-Gentil', status: 'active', phone: '+24105678901', email: 'p.moussavou@aggregator.ga' },
      balanceHistory: generateBalanceHistory(350000, 150000, 120000, 90000, 30000, 30000)
    },
    {
      id: 10, code: 'RTL-010', fullName: 'Sylvie Mba', zone: 'Port-Gentil', status: 'inactive', type: 'ordinary',
      principalBalance: 80000, withdrawalBalance: 30000, autoTransferAmount: 0, lastActivityDate: new Date('2023-03-25'),
      topAggregatorCode: 'AGG-PG-04', messageReceived: "Compte dormant - réactivation nécessaire",
      statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: false, dormant: true, inactive: true },
      topAggregator: { code: 'AGG-PG-04', fullName: 'Jacques Ndong', zone: 'Port-Gentil', status: 'active', phone: '+24108901234', email: 'j.ndong@aggregator.ga' },
      balanceHistory: generateBalanceHistory(120000, 50000, 40000, 20000, 0, 0)
    },

    // 11-20: Franceville
    {
      id: 11, code: 'RTL-011', fullName: 'Daniel Meye', zone: 'Franceville', status: 'active', type: 'VIP',
      principalBalance: 760000, withdrawalBalance: 220000, autoTransferAmount: 140000, lastActivityDate: new Date('2023-05-19'),
      topAggregatorCode: 'AGG-FV-01', messageReceived: "Transfert possible",
      statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-FV-01', fullName: 'Martine Obame', zone: 'Franceville', status: 'active', phone: '+24109012345', email: 'm.obame@aggregator.ga' },
      balanceHistory: generateBalanceHistory(600000, 200000, 150000, 100000, 100000, 60000)
    },
    {
      id: 12, code: 'RTL-012', fullName: 'Julie Ndoutoume', zone: 'Franceville', status: 'active', type: 'ordinary',
      principalBalance: 540000, withdrawalBalance: 180000, autoTransferAmount: 70000, lastActivityDate: new Date('2023-05-18'),
      topAggregatorCode: 'AGG-FV-02', messageReceived: "Besoin d'approvisionnement",
      statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-FV-02', fullName: 'Patrick Mba', zone: 'Franceville', status: 'active', phone: '+24110123456', email: 'p.mba@aggregator.ga' },
      balanceHistory: generateBalanceHistory(450000, 150000, 120000, 80000, 40000, 40000)
    },
    {
      id: 13, code: 'RTL-013', fullName: 'Olivier Mintsa', zone: 'Franceville', status: 'critical', type: 'ordinary',
      principalBalance: 95000, withdrawalBalance: 45000, autoTransferAmount: 10000, lastActivityDate: new Date('2023-05-14'),
      topAggregatorCode: 'AGG-FV-03', messageReceived: "Solde très bas - approvisionnez",
      statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false },
      topAggregator: { code: 'AGG-FV-03', fullName: 'Gisèle Minko', zone: 'Franceville', status: 'inactive', phone: '+24111234567', email: 'g.minko@aggregator.ga' },
      balanceHistory: generateBalanceHistory(120000, 40000, 30000, 20000, 5000, 10000)
    },
    // ... (Continuer jusqu'à 50 avec le même modèle)
  ];
  // Dans votre composant TypeScript
  sendSMSDirect(retailer: Retailer): void {
    if (!retailer?.topAggregator?.phone) {
      console.error('Aucun numéro de téléphone disponible pour le revendeur');
      return;
    }

    // Construction du message en fonction du statut
    let messageContent: string;

    if (retailer.status === 'critical') {
      messageContent = `URGENT: Votre solde est critique (${retailer.principalBalance} XAF). Veuillez approvisionner.`;
    } else if (retailer.statusDetails.needCashOut) {
      messageContent = `Rappel: Retrait demandé de ${retailer.withdrawalBalance} XAF disponible. Code: ${retailer.code}`;
    } else {
      messageContent = `Notification: Votre solde actuel est ${retailer.principalBalance} XAF.`;
    }


    // Exemple avec un service fictif
    // this.smsService.send({
    //   to: retailer.phone || retailer.topAggregator.phone,
    //   message: messageContent,
    //   retailerCode: retailer.code
    // }).subscribe({
    //   next: () => this.showSuccess('SMS envoyé au revendeur avec succès'),
    //   error: (err) => this.showError(`Échec d'envoi: ${err.message}`)
    // });
  }

  // Méthode pour envoyer à l'aggrégateur (existant)


  // Méthodes utilitaires pour les notifications

  constructor() { }

  ngOnInit(): void {
    this.initCounterAnimation();
    this.initFilterToggle();
    this.filteredRetailers = [...this.retailers];
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: "Principal Balance",
          data: this.selectedRetailer?.balanceHistory?.map(item => item.principalBalance) || []
        },
        {
          name: "Withdrawal Balance",
          data: this.selectedRetailer?.balanceHistory?.map(item => item.withdrawalBalance) || []
        },
        {
          name: "Auto Transfer",
          data: this.selectedRetailer?.balanceHistory?.map(item => item.autoTransferAmount) || []
        }
      ],
      chart: {
        type: "line",
        height: 300,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      colors: ["#3B82F6", "#10B981", "#8B5CF6"],
      stroke: {
        curve: "smooth",
        width: 2
      },
      xaxis: {
        categories: this.selectedRetailer?.balanceHistory?.map(item =>
          new Date(item.date).toLocaleDateString()
        ) || [],
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return `XAF ${value.toLocaleString()}`;
          }
        }
      },
      tooltip: {
        y: {
          formatter: (value) => {
            return `XAF ${value.toLocaleString()}`;
          }
        }
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px"
      }
    };


  }

  applyFilters(): void {
    this.filteredRetailers = this.retailers.filter(retailer => {
      const zoneMatch = !this.selectedZone || retailer.zone === this.selectedZone;
      const statusMatch = !this.selectedStatus ||
        (this.selectedStatus === 'needCashIn' && retailer.statusDetails.needCashIn) ||
        (this.selectedStatus === 'needCashOut' && retailer.statusDetails.needCashOut) ||
        (this.selectedStatus === 'availableForTransfer' && retailer.statusDetails.availableForTransfer) ||
        (this.selectedStatus === 'dormant' && retailer.statusDetails.dormant) ||
        (this.selectedStatus === 'inactive' && retailer.statusDetails.inactive);

      return zoneMatch && statusMatch;
    });
    this.currentPage = 1; // Reset to first page when filters change
  }
  // get paginatedRetailers(): Retailer[] {
  //   const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  //   return this.filteredRetailers.slice(startIndex, startIndex + this.itemsPerPage);
  // }

  get paginatedRetailers(): Retailer[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRetailers.slice(startIndex, startIndex + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.filteredRetailers.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allSelected = isChecked;
    if (isChecked) {
      this.selectedRetailers = [...this.filteredRetailers];
    } else {
      this.selectedRetailers = [];
    }
  }

  toggleRetailerSelection(retailer: Retailer, event: Event): void {
    event.stopPropagation();
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedRetailers.push(retailer);
    } else {
      this.selectedRetailers = this.selectedRetailers.filter(r => r.id !== retailer.id);
    }

    this.allSelected = this.selectedRetailers.length === this.filteredRetailers.length;
  }

  isSelected(retailer: Retailer): boolean {
    return this.selectedRetailers.some(r => r.id === retailer.id);
  }

  openRetailerModal(retailer: Retailer): void {
    this.selectedRetailer = retailer;
    this.activeTab = 'retailer';
    this.initChart();
  }

  closeModal(): void {
    this.selectedRetailer = null;
  }

  openBulkSMSModal(): void {
    this.showBulkSMSModal = true;
    this.selectedBulkMessage = '';
    this.bulkMessageContent = '';
  }

  closeBulkSMSModal(): void {
    this.showBulkSMSModal = false;
  }

  sendSMS(retailer: Retailer): void {
    // Implement SMS sending logic for single retailer
    console.log('Sending SMS to', retailer.fullName);
    this.closeModal();
  }

  sendBulkSMS(): void {
    // Implement bulk SMS sending logic
    console.log('Sending bulk SMS to', this.selectedRetailers.length, 'recipients');
    console.log('Message:', this.bulkMessageContent);
    this.closeBulkSMSModal();
    this.selectedRetailers = [];
    this.allSelected = false;
  }

  setTimeRange(range: string): void {
    this.timeRange = range;
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




}



export function generateBalanceHistory(
  principalBase: number,
  principalVar: number,
  withdrawalBase: number,
  withdrawalVar: number,
  autoTransferBase: number,
  autoTransferVar: number
) {
  return Array.from({ length: 30 }, (_, i) => {
    const dayProgress = i / 29; // Normalisé entre 0 et 1
    return {
      date: new Date(2023, 4, i + 1), // Mai 2023
      principalBalance: Math.round(principalBase + (principalVar * dayProgress * (0.9 + Math.random() * 0.2))),
      withdrawalBalance: Math.round(withdrawalBase + (withdrawalVar * dayProgress * (0.9 + Math.random() * 0.2))),
      autoTransferAmount: Math.round(autoTransferBase + (autoTransferVar * dayProgress * (0.9 + Math.random() * 0.2)))
    };
  });
}
