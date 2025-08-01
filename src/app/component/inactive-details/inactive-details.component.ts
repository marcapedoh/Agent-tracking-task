import { Component, OnInit } from '@angular/core';
import { DailyTrackingService } from 'src/app/services/dailyTracking-Service/daily-tracking.service';

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
  selector: 'app-inactive-details',
  templateUrl: './inactive-details.component.html',
  styleUrls: ['./inactive-details.component.css']
})
export class InactiveDetailsComponent implements OnInit {

  Math = Math;
  itemsPerPageOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];
  itemsPerPage: number = 10;
  today: Date = new Date();
  isInactiveFilterActive: boolean = false;
  currentPage: number = 1;
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Need_Cashing', label: 'Need Cash In' },
    { value: 'Need_Cashout', label: 'Need Cash Out' },
    { value: 'Dormant', label: 'Dormant' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Normal', label: 'Normal' }
  ];
  selectedStatus: string = '';
  selectedSubzone: string = '';
  selectedZone: string = '';
  selectedDays: number = 3;
  filteredRetailers: Retailer[] = [];
  agents: any[] = [];
  filteredAgents: any[] = [];
  paginatedAgents: any[] = [];
  agentType: string = ""
  // Sélection multiple
  selectedAgents: any[] = [];
  allAgentsSelected: boolean = false;
  zones: any = [

  ];
  retailers: Retailer[] = [
    // Libreville (1-15)
    { id: 1, code: 'RTL-2025-001', fullName: 'Jean Okou', zone: 'Libreville', subZone: 'Mont-Bouët', status: 'active', type: 'VIP', principalBalance: 1850000, withdrawalBalance: 420000, autoTransferAmount: 200000, lastActivityDate: new Date('2025-05-15'), topAggregatorCode: 'AGG-LB-01', messageReceived: "Retrait urgent", statusDetails: { needCashIn: false, needCashOut: true, availableForTransfer: false, dormant: false, inactive: false }, topAggregator: { code: 'AGG-LB-01', fullName: 'Marc Ondo', zone: 'Libreville', status: 'active', phone: '+24101234567', email: 'm.ondo@ga' }, statistics: { totalTransactions: 124, monthlyAverage: 28, lastTransactionAmount: 75000 } },
    { id: 2, code: 'RTL-2025-002', fullName: 'Sarah Nguema', zone: 'Libreville', subZone: 'Glass', status: 'active', type: 'ordinary', principalBalance: 950000, withdrawalBalance: 310000, autoTransferAmount: 90000, lastActivityDate: new Date('2025-05-14'), topAggregatorCode: 'AGG-LB-02', messageReceived: "Approvisionnement nécessaire", statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false }, topAggregator: { code: 'AGG-LB-02', fullName: 'Pauline Mba', zone: 'Libreville', status: 'active', phone: '+24102345678', email: 'p.mba@ga' }, statistics: { totalTransactions: 85, monthlyAverage: 22, lastTransactionAmount: 50000 } },
    { id: 3, code: 'RTL-2025-003', fullName: 'David Minko', zone: 'Libreville', subZone: 'Akébé', status: 'critical', type: 'ordinary', principalBalance: 120000, withdrawalBalance: 110000, autoTransferAmount: 25000, lastActivityDate: new Date('2025-05-10'), topAggregatorCode: 'AGG-LB-03', messageReceived: "Solde critique", statusDetails: { needCashIn: true, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false }, topAggregator: { code: 'AGG-LB-03', fullName: 'Lucie Benga', zone: 'Libreville', status: 'active', phone: '+24103456789', email: 'l.benga@ga' } },

    // Port-Gentil (16-30)
    { id: 16, code: 'RTL-2025-016', fullName: 'Marie Engonga', zone: 'Port-Gentil', subZone: 'Zone Industrielle', status: 'active', type: 'VIP', principalBalance: 2200000, withdrawalBalance: 510000, autoTransferAmount: 250000, lastActivityDate: new Date('2025-05-16'), topAggregatorCode: 'AGG-PG-01', messageReceived: "Retrait demandé", statusDetails: { needCashIn: false, needCashOut: true, availableForTransfer: false, dormant: false, inactive: false }, topAggregator: { code: 'AGG-PG-01', fullName: 'Pierre Moussavou', zone: 'Port-Gentil', status: 'active', phone: '+24105678901', email: 'p.moussavou@ga' } },
    { id: 17, code: 'RTL-2025-017', fullName: 'Roger Obiang', zone: 'Port-Gentil', subZone: 'Balise', status: 'active', type: 'ordinary', principalBalance: 780000, withdrawalBalance: 350000, autoTransferAmount: 100000, lastActivityDate: new Date('2025-05-15'), topAggregatorCode: 'AGG-PG-02', messageReceived: "Transfert disponible", statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false }, topAggregator: { code: 'AGG-PG-02', fullName: 'Christine Mbina', zone: 'Port-Gentil', status: 'active', phone: '+24106789012', email: 'c.mbina@ga' } },

    // Franceville (31-40)
    { id: 31, code: 'RTL-2025-031', fullName: 'Daniel Meye', zone: 'Franceville', subZone: 'Mvouli', status: 'active', type: 'VIP', principalBalance: 1600000, withdrawalBalance: 320000, autoTransferAmount: 180000, lastActivityDate: new Date('2025-05-14'), topAggregatorCode: 'AGG-FV-01', messageReceived: "Transfert possible", statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: true, dormant: false, inactive: false }, topAggregator: { code: 'AGG-FV-01', fullName: 'Martine Obame', zone: 'Franceville', status: 'active', phone: '+24109012345', email: 'm.obame@ga' } },

    // Oyem (41-45)
    { id: 41, code: 'RTL-2025-041', fullName: 'Paul Mba', zone: 'Oyem', subZone: 'Centre-ville', status: 'active', type: 'VIP', principalBalance: 1250000, withdrawalBalance: 280000, autoTransferAmount: 150000, lastActivityDate: new Date('2025-05-13'), topAggregatorCode: 'AGG-OY-01', messageReceived: "Nouvelle transaction", statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: false, dormant: false, inactive: false }, topAggregator: { code: 'AGG-OY-01', fullName: 'Alain Nzeng', zone: 'Oyem', status: 'active', phone: '+24111223344', email: 'a.nzeng@ga' } },

    // Mouila (46-50)
    { id: 46, code: 'RTL-2025-046', fullName: 'Julie Mintsa', zone: 'Mouila', subZone: 'Marché Central', status: 'inactive', type: 'ordinary', principalBalance: 50000, withdrawalBalance: 20000, autoTransferAmount: 0, lastActivityDate: new Date('2025-03-10'), topAggregatorCode: 'AGG-ML-01', messageReceived: "Compte inactif", statusDetails: { needCashIn: false, needCashOut: false, availableForTransfer: false, dormant: true, inactive: true }, topAggregator: { code: 'AGG-ML-01', fullName: 'Gérard Oyoubi', zone: 'Mouila', status: 'active', phone: '+24122334455', email: 'g.oyoubi@ga' } }
  ];
  datas: any = []
  selectDate = ""
  dateObj = new Date()
  zonesWithSub: any = []
  constructor(private dailyTrackingService: DailyTrackingService) { }
  ngOnInit(): void {
    this.initCounterAnimation();
    this.dailyTrackingService.getAllZone().subscribe((data: any) => {
      console.log(data)
      this.zones = data
      this.zones.forEach((zone: any) => {
        this.dailyTrackingService.getSubZonesPerZoneName(zone.name).subscribe((res: any) => {
          this.zonesWithSub[zone.name] = res[zone.name] ?? [];
          console.log(this.zonesWithSub)
        })
      })
    })
  }


  hasSubzones(): boolean {
    return !!(this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0);
  }

  getCurrentSubzones(): string[] {
    return this.selectedZone ? this.zonesWithSub[this.selectedZone] || [] : [];
  }



  getInactiveRetailersCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.retailers.filter(retailer => {
      return retailer.statusDetails.inactive &&
        new Date(retailer.lastActivityDate) <= cutoffDate;
    }).length;
  }

  toggleSelectAllAgents(event: any): void {
    this.allAgentsSelected = event.target.checked;

    if (this.allAgentsSelected) {
      this.selectedAgents = [...this.paginatedAgents];
    } else {
      this.selectedAgents = [];
    }
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

  isAgentSelected(agent: any): boolean {
    return this.selectedAgents.some(a => a.code === agent.code);
  }

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

  // Ouvre le modal pour voir les détails d'un agent
  openAgentModal(agent: any): void {
    // Implémentez votre logique pour ouvrir un modal avec les détails de l'agent
    console.log('Ouvrir modal pour:', agent);
    // this.modalService.open(agent);
  }

  // Ouvre le modal pour les actions groupées
  openBulkActionModal(): void {
    // Implémentez votre logique pour les actions groupées
    console.log('Agents sélectionnés:', this.selectedAgents);
    // this.bulkActionService.open(this.selectedAgents);
  }
  getPageNumbers(): number[] {
    const pages: number[] = [];
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
  allData: any[] = []


  withdrawalThreshold: any;
  mainAccountThreshold: any;
  inactiveDays: any;


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

  onZoneChange() {
    this.selectedSubzone = ''; // Réinitialise la sous-zone
    this.applyFilters();
  }

  applyFilters(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedDays);

    this.filteredRetailers = this.datas.filter((retailer: any) => {
      // 1. Filtre par zone principale OU sous-zone
      const zoneMatch = !this.selectedZone ||
        retailer.zone === this.selectedZone ||
        retailer.subZone === this.selectedZone;

      // 2. Si une sous-zone est sélectionnée, vérifier qu'elle correspond
      const subzoneMatch = !this.selectedSubzone ||
        retailer.subZone === this.selectedSubzone;

      // 3. Filtre par statut
      const statusMatch = !this.selectedStatus ||
        (this.selectedStatus === 'Need_Cashing' && retailer.statusDetails.needCashIn) ||
        (this.selectedStatus === 'Need_Cashout' && retailer.statusDetails.needCashOut) ||
        (this.selectedStatus === 'Dormant' && retailer.statusDetails.availableForTransfer) ||
        (this.selectedStatus === 'Inactive' && retailer.statusDetails.dormant) ||
        (this.selectedStatus === 'Normal' && retailer.statusDetails.inactive);

      // 4. Filtre temporel pour les inactifs
      const inactiveDurationMatch = !this.isInactiveFilterActive ||
        !this.selectedStatus ||
        this.selectedStatus !== 'Inactive' ||
        (retailer.statusDetails.inactive && new Date(this.selectDate) <= cutoffDate);

      return zoneMatch && subzoneMatch && statusMatch && inactiveDurationMatch;
    });
    this.currentPage = 1;
  }
  getInactiveDays(lastActivityDate: Date): number {
    if (!lastActivityDate) return 0;

    const today = new Date();
    const lastDate = new Date(lastActivityDate);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours
  }
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.datas.slice(startIndex, startIndex + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.datas.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }


}
