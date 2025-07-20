import { Component, OnInit } from '@angular/core';

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


  itemsPerPage: number = 10;
  today: Date = new Date();
  isInactiveFilterActive: boolean = false;
  currentPage: number = 1;
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'needCashIn', label: 'Need Cash In' },
    { value: 'needCashOut', label: 'Need Cash Out' },
    { value: 'availableForTransfer', label: 'Available for Transfer' },
    { value: 'dormant', label: 'Dormant' },
    { value: 'inactive', label: 'Inactive' }
  ];
  selectedStatus: string = '';
  selectedSubzone: string = '';
  selectedZone: string = '';
  selectedDays: number = 3;
  filteredRetailers: Retailer[] = [];
  selectedDate = '';
  zones = [
    { name: 'Libreville', subzones: ['Louis', 'Mont-Bouët', 'Glass', 'Akébé', 'Nombakélé'] },
    { name: 'Port-Gentil', subzones: ['Industrielle', 'Louis', 'Balise'] },
    { name: 'Franceville', subzones: ['Mvouli', 'Mikolongo'] },
    { name: 'Oyem' },  // Sans sous-zones
    { name: 'Mouila' }, // Sans sous-zones
    { name: 'Lambaréné', subzones: ['Bikele'] }
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
  ngOnInit(): void {
    this.initCounterAnimation();
  }
  hasSubzones(): boolean {
    const zone = this.zones.find(z => z.name === this.selectedZone);
    return !!zone?.subzones?.length;
  }

  getCurrentSubzones(): string[] {
    const zone = this.zones.find(z => z.name === this.selectedZone);
    return zone?.subzones || [];
  }

  getInactiveRetailersCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.retailers.filter(retailer => {
      return retailer.statusDetails.inactive &&
        new Date(retailer.lastActivityDate) <= cutoffDate;
    }).length;
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

  onZoneChange() {
    this.selectedSubzone = ''; // Réinitialise la sous-zone
    this.applyFilters();
  }

  applyFilters(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedDays);

    this.filteredRetailers = this.retailers.filter(retailer => {
      // 1. Filtre par zone principale OU sous-zone
      const zoneMatch = !this.selectedZone ||
        retailer.zone === this.selectedZone ||
        retailer.subZone === this.selectedZone;

      // 2. Si une sous-zone est sélectionnée, vérifier qu'elle correspond
      const subzoneMatch = !this.selectedSubzone ||
        retailer.subZone === this.selectedSubzone;

      // 3. Filtre par statut
      const statusMatch = !this.selectedStatus ||
        (this.selectedStatus === 'needCashIn' && retailer.statusDetails.needCashIn) ||
        (this.selectedStatus === 'needCashOut' && retailer.statusDetails.needCashOut) ||
        (this.selectedStatus === 'availableForTransfer' && retailer.statusDetails.availableForTransfer) ||
        (this.selectedStatus === 'dormant' && retailer.statusDetails.dormant) ||
        (this.selectedStatus === 'inactive' && retailer.statusDetails.inactive);

      // 4. Filtre temporel pour les inactifs
      const inactiveDurationMatch = !this.isInactiveFilterActive ||
        !this.selectedStatus ||
        this.selectedStatus !== 'inactive' ||
        (retailer.statusDetails.inactive && new Date(retailer.lastActivityDate) <= cutoffDate);

      return zoneMatch && subzoneMatch && statusMatch && inactiveDurationMatch;
    });
    this.currentPage = 1;
  }
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
}
