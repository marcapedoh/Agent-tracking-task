import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { DailyTrackingService } from 'src/app/services/dailyTracking-Service/daily-tracking.service';
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
  subZone: string;
  status: 'active' | 'inactive' | 'critical';
  type: 'VIP' | 'ordinary';
  principalBalance: number;
  lastStatusChange?: string; // Ajout de cette propriété optionnelle
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
export class DailyTrackingComponent implements OnInit, OnDestroy {
  selectedDays: number = 3;
  showDaysDropdown: boolean = false;
  isInactiveFilterActive: boolean = false;
  selectedZone: string = '';
  selectedSubzone: string = '';
  chartOptions!: Partial<ChartOptions>;
  Math = Math;
  today: Date = new Date();
  timeRange = 'day';
  selectedDate = '';
  alertInterval: any;
  currentAlert?: Retailer;
  showAlertModal = false;

  // Messages
  predefinedMessages = [
    "URGENT: Votre solde est critique, merci de recharger",
    "Rappel: Paiement en attente de validation",
    "Notification: Transfert disponible sur votre compte",
    "Alerte: Activité suspecte détectée"
  ];
  zones = [
    { name: 'Libreville', subzones: ['Louis', 'Mont-Bouët', 'Glass', 'Akébé', 'Nombakélé'] },
    { name: 'Port-Gentil', subzones: ['Industrielle', 'Louis', 'Balise'] },
    { name: 'Franceville', subzones: ['Mvouli', 'Mikolongo'] },
    { name: 'Oyem' },  // Sans sous-zones
    { name: 'Mouila' }, // Sans sous-zones
    { name: 'Lambaréné', subzones: ['Bikele'] }
  ];
  filteredRetailers: any[] = [];
  selectedRetailers: any[] = [];
  allSelected: boolean = false;
  // Modal related properties
  selectedRetailer: Retailer | null = null;
  showBulkSMSModal: boolean = false;
  activeTab: 'retailer' | 'aggregator' = 'retailer';
  activeMainTab: 'list' | 'details' = 'list';
  selectedPredefinedMessage = '';
  customMessage = '';
  selectedRetailerForDetails?: Retailer;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectedStatus: string = '';
  alertPaused = false;
  alertTimeout: any;
  lastAlertTime?: Date;
  alertCooldown = 20 * 60 * 1000; // 20 minutes en millisecond
  itemsPerPageOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Need_Cashing', label: 'Need Cash In' },
    { value: 'Need_Cashout', label: 'Need Cash Out' },
    { value: 'Dormant', label: 'Dormant' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Normal', label: 'Normal' }
  ];
  // Bulk SMS properties
  activeDetailsTab: 'info' | 'messages' = 'info';
  bulkMessages: string[] = [
    'Your account needs attention. Please check your balances.',
    'Your principal balance is low. Please recharge soon.',
    'Thank you for your recent transactions.'
  ];
  selectedBulkMessage: string = '';
  bulkMessageContent: string = '';
  retailers: any[] = [];
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

  toggleDaysDropdown(): void {
    this.showDaysDropdown = !this.showDaysDropdown;
  }

  // Helper pour construire le template du message
  private buildMessageTemplate(content: string, retailer: Retailer): string {
    const variables = {
      '{name}': retailer.fullName,
      '{code}': retailer.code,
      '{balance}': retailer.principalBalance.toLocaleString(),
      '{date}': new Date().toLocaleDateString()
    };

    return content.replace(
      /{name}|{code}|{balance}|{date}/g,
      match => variables[match as keyof typeof variables] || match
    );
  }

  // Réinitialisation du formulaire
  private resetMessageForm(): void {
    this.customMessage = '';
    this.selectedPredefinedMessage = '';
  }

  // Notification (à adapter avec votre système de notifications)
  private showNotification(message: string, type: 'success' | 'error'): void {
    // Implémentez votre système de notification ici
    console.log(`${type.toUpperCase()}: ${message}`);
    // Exemple avec un toast :
    // this.toastService.show(message, { type });
  }
  getInactiveRetailersCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return 0
  }

  selectDays(days: number): void {
    this.selectedDays = days;
    this.showDaysDropdown = false;

    // Réinitialisation si on sélectionne 3 jours (valeur par défaut)
    if (days === 3) {
      this.resetInactiveFilter();
    } else {
      this.isInactiveFilterActive = true;
      this.selectedStatus = 'inactive';
      this.applyFilters();
    }

    setTimeout(() => this.initCounterAnimation(), 0);
  }

  resetInactiveFilter(): void {
    this.isInactiveFilterActive = false;
    this.selectedStatus = '';
    this.selectedDays = 3; // Réinitialise à la valeur par défaut
    this.applyFilters();
  }

  onZoneChange() {
    this.selectedSubzone = ''; // Réinitialise la sous-zone
    this.applyFilters();
  }



  showInactivityAlert = false;
  currentInactivityAlert?: Retailer;
  inactivityAlertInterval: any;
  showAgent650Modal: boolean = false;
  showVipAlertsModal: boolean = false;


  // Méthodes pour compter les inactifs
  getInactiveVipCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.retailers.filter(r =>
      r.type === 'VIP' &&
      r.statusDetails.inactive &&
      new Date(r.lastActivityDate) <= cutoffDate
    ).length;
  }


  openDetailsModal(retailer: Retailer): void {
    this.selectedRetailerForDetails = retailer;
    this.activeDetailsTab = 'info';
    this.pauseAlerts(); // Mettre en pause les alertes pendant la consultation
  }


  pauseAlerts(): void {
    this.alertPaused = true;

    // Ferme les alertes visibles
    this.showAlertModal = false;
    this.showInactivityAlert = false;

    console.log('Alertes mises en pause');
  }
  openVipAlertsModal() {
    // Ici vous pourriez charger les données des alertes si nécessaire
    this.showVipAlertsModal = true;
  }



  resumeAlertsAfterCooldown(): void {
    // Annule tout timer existant
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }

    // Programme la reprise après le cooldown
    this.alertTimeout = setTimeout(() => {
      this.alertPaused = false;
      console.log('Alertes réactivées après cooldown');

      // Vérifie immédiatement s'il y a des alertes à montrer
      this.checkCriticalAlerts();
      this.checkInactivityAlerts();

    }, this.alertCooldown);
  }

  checkCriticalAlerts(): void {
    // 1. Vérifier si les alertes sont en pause
    if (this.alertPaused) {
      console.debug('Alertes en pause - vérification critique ignorée');
      return;
    }

    // 2. Obtenir la date limite pour éviter les répétitions
    const now = new Date();
    const lastAlertCutoff = new Date(now.getTime() - 30000); // 30 secondes depuis dernière alerte

    // 3. Filtrer les revendeurs critiques
    const criticalAlerts = this.retailers.filter(retailer => {
      // Critères pour VIP
      const isVipCritical = retailer.type === 'VIP' && retailer.status === 'critical';

      // Critères pour revendeur 650
      const isRegularCritical = retailer.type === 'ordinary' &&
        retailer.status === 'critical' &&
        retailer.principalBalance <= 650000;

      // Vérifier si déjà alerté récemment
      const wasRecentlyAlerted = retailer.lastStatusChange &&
        new Date(retailer.lastStatusChange) > lastAlertCutoff;

      return (isVipCritical || isRegularCritical) && !wasRecentlyAlerted;
    });

    // 4. Trier par priorité (VIP d'abord) puis par ancienneté
    criticalAlerts.sort((a, b) => {
      if (a.type === 'VIP' && b.type !== 'VIP') return -1;
      if (a.type !== 'VIP' && b.type === 'VIP') return 1;
      return new Date(a.lastActivityDate).getTime() - new Date(b.lastActivityDate).getTime();
    });

    // 5. Afficher l'alerte si nécessaire
    if (criticalAlerts.length > 0 && !this.showAlertModal) {
      this.currentAlert = criticalAlerts[0];
      this.showAlertModal = true;
      this.lastAlertTime = now;

      // Mettre à jour le timestamp pour éviter les répétitions
      const retailer = this.retailers.find(r => r.id === this.currentAlert?.id);
      if (retailer) {
        retailer.lastStatusChange = now.toISOString();
      }


      // Fermeture automatique après 8 secondes si non interagi
      setTimeout(() => {
        if (this.showAlertModal && this.currentAlert?.id === criticalAlerts[0].id) {
          this.showAlertModal = false;
        }
      }, 8000);
    }
  }
  showInactiveResellersModal = false;

  openInactiveResellersModal(): void {
    this.showInactiveResellersModal = true;
  }

  // Méthode pour récupérer les revendeurs inactifs
  getInactiveRetailers(): Retailer[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedDays);

    return this.retailers.filter(retailer =>
      retailer.statusDetails.inactive &&
      new Date(retailer.lastActivityDate) <= cutoffDate
    );
  }


  // Fermer le modal de détails
  closeDetailsModal(): void {
    this.selectedRetailerForDetails = undefined;
    this.resumeAlertsAfterCooldown(); // Reprendre les alertes
  }

  // Envoyer un message
  sendMessage(to: 'retailer' | 'aggregator'): void {
    if (!this.selectedRetailerForDetails || !this.customMessage) return;

    const recipient = to === 'retailer'
      ? this.selectedRetailerForDetails
      : this.selectedRetailerForDetails.topAggregator;

    console.log(`Envoi message à ${to}:`, {
      recipient: recipient.fullName,
      phone: "recipient.phone",
      message: this.customMessage
    });

    // Réinitialiser le formulaire
    this.customMessage = '';
    this.selectedPredefinedMessage = '';

    // Feedback utilisateur
    alert(`Message envoyé à ${recipient.fullName}`);
  }


  getInactive650Count(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.retailers.filter(r =>
      r.type === 'ordinary' &&
      r.principalBalance <= 650000 &&
      r.statusDetails.inactive &&
      new Date(r.lastActivityDate) <= cutoffDate
    ).length;
  }

  hasInactiveVip(): boolean {
    return this.getInactiveVipCount(this.selectedDays) > 0;
  }

  hasInactive650(): boolean {
    return this.getInactive650Count(this.selectedDays) > 0;
  }
  getInactiveDays(lastActivityDate: Date): number {
    if (!lastActivityDate) return 0;

    const today = new Date();
    const lastDate = new Date(lastActivityDate);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours
  }

  // Initialiser les alertes d'inactivité
  initInactivityAlerts(): void {
    this.checkInactivityAlerts();
    this.inactivityAlertInterval = setInterval(() => {
      this.checkInactivityAlerts();
    }, 10000); // Vérifie toutes les 10 secondes
  }

  checkInactivityAlerts(): void {
    const inactiveVips = this.retailers.filter(r =>
      r.type === 'VIP' &&
      r.statusDetails.inactive &&
      this.getInactiveDays(r) >= 3 // Seuil de 3 jours pour l'alerte
    );

    const inactive650s = this.retailers.filter(r =>
      r.type === 'ordinary' &&
      r.principalBalance <= 650000 &&
      r.statusDetails.inactive &&
      this.getInactiveDays(r) >= 3 // Seuil de 3 jours pour l'alerte
    );

    // Priorité aux VIP
    const alertCandidate = inactiveVips.length > 0 ? inactiveVips[0] :
      inactive650s.length > 0 ? inactive650s[0] :
        null;

    if (alertCandidate && !this.showInactivityAlert) {
      this.currentInactivityAlert = alertCandidate;
      this.showInactivityAlert = true;

      // Fermer automatiquement après 5 secondes
      setTimeout(() => {
        this.showInactivityAlert = false;
      }, 5000);
    }
  }
  constructor(private dailyTrackingService: DailyTrackingService) { }

  zonesWithSub: any = []
  ngOnInit(): void {
    //this.initAlerts();
    this.initInactivityAlerts();
    this.initCounterAnimation();
    this.initFilterToggle();

    // Définir la date du jour au format 'YYYY-MM-DD'
    const today = new Date();
    this.selectDate = today.toISOString().substring(0, 10);

    // Appeler directement le filtre avec la date du jour
    this.filterData();

    this.filteredRetailers = [...this.retailers];
    this.dailyTrackingService.getAllZone().subscribe((data: any) => {

      this.zones = data
      this.zones.forEach((zone: any) => {
        this.dailyTrackingService.getSubZonesPerZoneName(zone.name).subscribe((res: any) => {
          this.zonesWithSub[zone.name] = res[zone.name] ?? [];
          console.log(this.zonesWithSub)
        })
      })
    })

  }

  dateObj = new Date()
  selectDate = ''
  datas: any[] = []
  allData: any[] = []
  filterData() {
    if (!this.selectDate) {
      console.warn("Aucune date sélectionnée !");
      return;
    }

    const formattedDate = new Date(this.selectDate).toISOString().split('T')[0];
    this.dateObj = new Date(formattedDate);

    this.dailyTrackingService.getAllSnapshot(this.selectDate, 0, this.itemsPerPage).subscribe((res: any) => {
      console.log(res.content);
      this.allData = res.content;   // Original
      this.datas = [...this.allData];
    })


  }
  hasSubzones(): boolean {
    return !!(this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0);
  }

  sanitizeValue(value: string | null | undefined): string {
    if (value === null || value === undefined || value.trim().toUpperCase() === '[NULL]' || value.trim() === '') {
      return '-';
    }
    return value;
  }


  getCurrentSubzones(): string[] {
    return this.selectedZone ? this.zonesWithSub[this.selectedZone] || [] : [];
  }
  ngOnDestroy(): void {
    clearInterval(this.alertInterval);
  }
  changePage(page: number): void {
    this.currentPage = page;
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
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedDays);

    this.datas = this.datas.filter((retailer: any) => {
      // 1. Filtre par zone principale OU sous-zone
      // const zoneMatch = !this.selectedZone ||
      //   retailer.zone === this.selectedZone ||
      //   retailer.subZone === this.selectedZone;

      // 2. Si une sous-zone est sélectionnée, vérifier qu'elle correspond
      // const subzoneMatch = !this.selectedSubzone ||
      //   retailer.subZone === this.selectedSubzone;

      // 3. Filtre par statut
      // const statusMatch = !this.selectedStatus ||
      //   retailer.agentStatus?.toUpperCase() === this.selectedStatus.toUpperCase() ||
      //   (this.selectedStatus === 'Need_Cashing' && retailer.agentStatus.toUpperCase() === 'NEED_CASHING') ||
      //   (this.selectedStatus === 'Need_Cashout' && retailer.agentStatus.toUpperCase() === 'NEED_CASHOUT') ||
      //   (this.selectedStatus === 'Dormant' && retailer.agentStatus.toUpperCase() === 'DORMANT') ||
      //   (this.selectedStatus === 'Inactive' && retailer.agentStatus.toUpperCase() === 'INACTIVE') ||
      //   (this.selectedStatus === 'Normal' && retailer.agentStatus.toUpperCase() === 'NORMAL');

      // console.log(statusMatch)
      // // 4. Filtre temporel pour les inactifs
      // const inactiveDurationMatch = !this.isInactiveFilterActive ||
      //   !this.selectedStatus ||
      //   this.selectedStatus !== 'Inactive' ||
      //   (retailer.agentStatus.toUpperCase() === 'INACTIVE' && new Date(this.selectDate) <= cutoffDate);

      const subzoneMatch = !this.selectedSubzone ||
        retailer.subZone === this.selectedSubzone;

      const statusMapping: { [key: string]: string } = {
        Need_Cashing: 'NEED_CASHING',
        Need_Cashout: 'NEED_CASHOUT',
        Dormant: 'DORMANT',
        Inactive: 'INACTIVE',
        Normal: 'NORMAL'
      };

      const statusMatch = !this.selectedStatus ||
        retailer.agentStatus?.toUpperCase() === statusMapping[this.selectedStatus];

      const inactiveDurationMatch = !this.isInactiveFilterActive ||
        this.selectedStatus !== 'Inactive' ||
        (retailer.agentStatus?.toUpperCase() === 'INACTIVE' &&
          retailer.lastActiveDate &&
          new Date(retailer.lastActiveDate) <= cutoffDate);

      return subzoneMatch && statusMatch && inactiveDurationMatch;
    });
    console.log(this.datas)
    this.currentPage = 1;
  }

  filterByStatus(): void {
    if (!this.selectedStatus) {
      this.datas = [...this.allData]; // Remet la liste complète si aucun statut choisi
      return;
    }
    console.log(this.datas)

    const statusMapping: { [key: string]: string } = {
      Need_Cashing: 'NEED_CASHING',
      Need_Cashout: 'NEED_CASHOUT',
      Dormant: 'DORMANT',
      Inactive: 'INACTIVE',
      Normal: 'NORMAL'
    };

    const mappedStatus = statusMapping[this.selectedStatus];
    console.log(mappedStatus)
    this.datas = this.allData.filter(agent =>
      agent.agentStatus?.toUpperCase() === mappedStatus
    );

    console.log('Agents filtrés par statut :', this.datas);
    this.currentPage = 1; // Reset pagination
  }

  filterByZoneAndSubzone(): void {
    // Si aucune zone ni sous-zone n'est sélectionnée, on remet tout
    if (!this.selectedZone && !this.selectedSubzone) {
      this.datas = [...this.allData];
      return;
    }

    let filtered = [...this.allData];

    if (this.selectedZone) {
      filtered = filtered.filter(agent => agent.zone === this.selectedZone);
    }

    if (this.selectedSubzone) {
      filtered = filtered.filter(agent => agent.subZone === this.selectedSubzone);
    }

    this.datas = filtered;
    this.currentPage = 1; // Réinitialiser la pagination
    console.log('Agents filtrés par zone/sous-zone :', this.datas);
  }


  get paginatedRetailers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRetailers.slice(startIndex, startIndex + this.itemsPerPage);
  }
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.datas.slice(startIndex, startIndex + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.datas.length / this.itemsPerPage);
  }

  openAgentModal(agent: any): void {
    this.selectedRetailer = agent;
  }

  allAgentsSelected: boolean = false;

  toggleAgentSelection(agent: any, event: any): void {
    event.stopPropagation();

    if (event.target.checked) {
      this.selectedAgents.push(agent);
    } else {
      this.selectedAgents = this.selectedAgents.filter(a => a.code !== agent.code);
    }

    // Met à jour l'état de la case à cocher "Tout sélectionner"
    this.allAgentsSelected = this.selectedAgents.length === this.paginatedAgents.length;
  }



  paginatedAgents: any[] = [];
  selectedAgents: any[] = [];
  isAgentSelected(agent: any): boolean {
    return this.selectedAgents.some(a => a.code === agent.code);
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
  // initCounterAnimation(): void {
  //   const counters = document.querySelectorAll<HTMLElement>('.counter');
  //   const speed = 200;

  //   counters.forEach(counter => {
  //     const targetAttr = counter.getAttribute('data-target');
  //     if (!targetAttr) return;

  //     const target = +targetAttr;
  //     const count = +counter.innerText;
  //     const increment = target / speed;

  //     if (count < target) {
  //       counter.innerText = Math.ceil(count + increment).toString();
  //       setTimeout(() => this.initCounterAnimation(), 1);
  //     } else {
  //       counter.innerText = target.toString();
  //     }
  //   });
  // }
  selectedCategory: any;
  sites: any;
  selectedSite: any;


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


  exportReport() {

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
    const dayProgress = i / 29;
    return {
      date: new Date(2023, 4, i + 1), // Mai 2023
      principalBalance: Math.round(principalBase + (principalVar * dayProgress * (0.9 + Math.random() * 0.2))),
      withdrawalBalance: Math.round(withdrawalBase + (withdrawalVar * dayProgress * (0.9 + Math.random() * 0.2))),
      autoTransferAmount: Math.round(autoTransferBase + (autoTransferVar * dayProgress * (0.9 + Math.random() * 0.2)))
    };
  });
}
