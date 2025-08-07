import { Component, OnInit } from '@angular/core';
import { DailyTrackingService } from 'src/app/services/dailyTracking-Service/daily-tracking.service';

@Component({
  selector: 'app-inactive-details',
  templateUrl: './inactive-details.component.html',
  styleUrls: ['./inactive-details.component.css']
})
export class InactiveDetailsComponent implements OnInit {

  constructor(private dailyTrackingService: DailyTrackingService) {}

  // ================================= Filtres =================================

  // ⬤ Statuts : With_Main_Account = actif que sur le compte principal, With_Cashout_Account = actif cashout uniquement, etc.
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'With_Main_Account', label: 'Main Account Only' },
    { value: 'With_Cashout_Account', label: 'Cashout Account Only' },
    { value: 'With_Both_Accounts', label: 'Both Accounts' },
  ];
  
  selectedStatus: string = '';

  getAccountStatus(agent: any): string {
    const hasMain = agent.withMainAccount;
    const hasCashout = agent.withCashoutAccount;

    if (hasMain && hasCashout) {
      return 'With_Both_Accounts';
    } else if (hasMain) {
      return 'With_Main_Account';
    } else if (hasCashout) {
      return 'With_Cashout_Account';
    } else {
      return ' - '; 
    }
  }


  // ⬤ Zones et sous-zones
  selectedZone: string = '';
  selectedSubzone: string = '';
  zones: any[] = [];
  zonesWithSub: any = {}; 

  hasSubzones(): boolean {
    return !!(this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0);
  }

  getZoneAndSubZone() {
    this.dailyTrackingService.getAllZone().subscribe((data: any) => {
      this.zones = data;

      this.zones.forEach((zone: any) => {
        this.dailyTrackingService.getSubZonesPerZoneName(zone.name).subscribe((res: any) => {
          this.zonesWithSub[zone.name] = res[zone.name] ?? [];
        });
      });
    });
  }

  // ⬤ Catégorie d'agent (type)
  categories: any[] = ['650', 'Premium', 'Ordinary', '650 & Premium'];
  selectedCategory: string = '';

  // ⬤ Date du snapshot
  today: Date = new Date();
  selectedDate = '';
  selectDate = '';

  // Jours inactifs sélectionnés (optionnel)
  selectedDays: number = 3;

  // ================================= Données & Pagination ================================

  snapshots: any[] = [];
  loading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 20;
  itemsPerPageOptions = [5, 10, 20, 50, 100, 150, 200];
  totalPages: number = 0;
  totalElements: number = 0;

  // ============================== Gestion des filtres ==============================

  filterData() {
    this.loading = true;

    const params: any = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
    };

    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedZone) params.zone = this.selectedZone;
    if (this.selectedSubzone) params.subZone = this.selectedSubzone;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectDate) params.snapshotDate = this.selectDate;

    this.dailyTrackingService.getInactiveAndDormantFiltredSnapshot(params).subscribe({
      next: (response: any) => {
        this.snapshots = response.content;
        console.log('SNAPSHOTS:', this.snapshots); 
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Optionnel : afficher une alerte ou log
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.filterData();
  }

  filterByZoneAndSubzone() {
    this.selectedSubzone = '';
    this.applyFilters();
  }

  filterByStatus() {
    this.applyFilters();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.filterData();
  }

  // ============================== Pagination ==============================

  changePage(page: number) {
    this.currentPage = page;
    this.filterData();
  }

  getPageNumbers(): number[] {
    const visiblePages = 5;
    const pages: number[] = [];

    let start = Math.max(1, this.currentPage - Math.floor(visiblePages / 2));
    let end = Math.min(this.totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ============================== Gestion sélection agents ==============================

  selectedAgents: any[] = [];
  paginatedAgents: any[] = [];
  allAgentsSelected: boolean = false;

   toggleAgentSelection(agent: any, event: any): void {
    event.stopPropagation();

    if (event.target.checked) {
      this.selectedAgents.push(agent);
    } else {
      this.selectedAgents = this.selectedAgents.filter(
        (a) => a.code !== agent.code
      );
    }

    // Met à jour l'état de la case à cocher "Tout sélectionner"
    this.allAgentsSelected = this.selectedAgents.length === this.paginatedAgents.length;
  }


  isAgentSelected(agent: any): boolean {
    return this.selectedAgents.some(a => a.code === agent.code);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allAgentsSelected = isChecked;
    this.selectedAgents = isChecked ? [...this.paginatedAgents] : [];
  }

  exportReport() {
    // Implémenter export CSV / Excel ici
  }

  // ============================== Utilitaires ==============================

  sanitizeValue(value: string | null | undefined): string {
    if (!value || value.trim().toUpperCase() === '[NULL]' || value.trim() === '') {
      return '-';
    }
    return value;
  }


  // ============================== Modal ==============================

  openAgentModal(agent: any) {
    // Implémenter l'ouverture du modal avec les détails de l'agent
    console.log('Open modal for agent:', agent);
  }

  // ============================== Initialisation ==============================

  ngOnInit(): void {
    this.getZoneAndSubZone();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.selectedDate = yesterday.toISOString().split('T')[0];
    this.selectDate = this.selectedDate;

    this.filterData();
  }
}
