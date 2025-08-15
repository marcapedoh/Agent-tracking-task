import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {Agent, Aggregator, DailyTrackingService} from 'src/app/services/dailyTracking-Service/daily-tracking.service';
import * as L from "leaflet";
import {catchError, of} from "rxjs";

@Component({
  selector: 'app-inactive-details',
  templateUrl: './inactive-details.component.html',
  styleUrls: ['./inactive-details.component.css'],
})
export class InactiveDetailsComponent implements OnInit {
  constructor(private dailyTrackingService: DailyTrackingService) {}

  // ================================= Filtres =================================

  // Statuts : With_Main_Account = actif que sur le compte principal, With_Cashout_Account = actif cashout uniquement, etc.
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'MAIN_ONLY', label: 'Main Account Only' },
    { value: 'CASHOUT_ONLY', label: 'Cashout Account Only' },
    { value: 'BOTH', label: 'Both Accounts' },
    { value: 'NONE', label: 'No Active Account' },
  ];

  selectedStatus: string = '';
  selectedAgentStatus: string = '';

  // Zones et sous-zones
  selectedZone: string = '';
  selectedSubzone: string = '';
  zones: any[] = [];
  zonesWithSub: any = {};

  hasSubzones(): boolean {
    return !!(
      this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0
    );
  }

  getZoneAndSubZone() {
    this.dailyTrackingService.getAllZone().subscribe((data: any) => {
      this.zones = data;

      this.zones.forEach((zone: any) => {
        this.dailyTrackingService
          .getSubZonesPerZoneName(zone.name)
          .subscribe((res: any) => {
            this.zonesWithSub[zone.name] = res[zone.name] ?? [];
          });
      });
    });
  }

  // Catégorie d'agent (type)
  categories: any[] = ['650', 'Premium', 'Ordinary', '650 & Premium'];
  selectedCategory: string = '';

  // Date du snapshot
  today: Date = new Date();
  selectedDate = '';

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

    let params = new HttpParams()
      .set('page', (this.currentPage - 1).toString())
      .set('size', this.itemsPerPage.toString());

    if (this.selectedStatus) {
      params = params.set('accountType', this.selectedStatus);
    }

    if (this.selectedAgentStatus) {
      params = params.set('agentStatus', this.selectedAgentStatus);
    }

    if (this.selectedZone) {
      params = params.set('zone', this.selectedZone);
    }

    if (this.selectedSubzone) {
      params = params.set('subZone', this.selectedSubzone);
    }

    if (this.selectedCategory) {
      params = params.set('category', this.selectedCategory);
    }

    if (this.selectedDate) {
      params = params.set('snapshotDate', this.selectedDate);
    }

    if (this.minMainAccount !== null && this.minMainAccount >= 0) {
      params = params.set('minMainAccount', this.minMainAccount.toString());
    }

    if (this.minCashoutAccount !== null && this.minCashoutAccount >= 0) {
      params = params.set(
        'minCashoutAccount',
        this.minCashoutAccount.toString()
      );
    }

    if (this.inactiveDays !== null && this.inactiveDays >= 0) {
      params = params.set('inactiveDays', this.inactiveDays.toString());
    }

    this.dailyTrackingService
      .getInactiveAndDormantFiltredSnapshot(params)
      .subscribe({
        next: (response: any) => {
          this.snapshots = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;

          // -------------------- UTILISATION DES TOTAUX DU BACKEND --------------------
          this.totalPremium = response.totalPremium;
          this.totalAgents650 = response.totalAgents650;
          this.totalPremiumAnd650 = response.totalPremiumAnd650;
          this.totalInactiveCashout = response.totalInactiveCashout;
          this.totalInactiveMain = response.totalInactiveMain;
          this.totalInactiveBoth = response.totalInactiveBoth;

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          console.error('Erreur lors du chargement des données filtrées.');
        },
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

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.filterData();
  }

  // ================================ Filtres pour les valeurs minimal =================================
  minMainAccount: number | null = null;
  minCashoutAccount: number | null = null;
  inactiveDays: number | null = null;

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
  selectedAgentIds: string[] = []; // liste des IDs sélectionnés

// Vérifie si un agent est sélectionné
  isSelected(agentId: string): boolean {
    return this.selectedAgentIds.includes(agentId);
  }

  toggleSelection(agentId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedAgentIds.includes(agentId)) {
        this.selectedAgentIds.push(agentId);
      }
    } else {
      this.selectedAgentIds = this.selectedAgentIds.filter(id => id !== agentId);
    }
  }

  isAllSelected(): boolean {
    return this.snapshots.length > 0 &&
      this.selectedAgentIds.length === this.snapshots.length;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedAgentIds = this.snapshots.map(agent => agent.agentId);
    } else {
      this.selectedAgentIds = [];
    }
  }

  getSelectedIds(): string[] {
    return this.selectedAgentIds;
  }

  exportReport(): void {
    const ids = this.getSelectedIds();
    console.log('IDs sélectionnés pour export :', ids);
    // Ici, tu peux appeler ton service pour export CSV/Excel
  }

  // ============================== Utilitaires ==============================

  sanitizeValue(value: string | null | undefined): string {
    if (
      !value ||
      value.trim().toUpperCase() === '[NULL]' ||
      value.trim() === ''
    ) {
      return '-';
    }
    return value;
  }

  getLastActivityDate(momoInactiveDays: number | null | undefined): string {
    if (momoInactiveDays == null || isNaN(momoInactiveDays)) {
      return "N/A";
    }

    const today = new Date();
    const lastActivity = new Date(today);
    lastActivity.setDate(today.getDate() - momoInactiveDays);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return lastActivity.toLocaleDateString('en-US', options);
  }




  // ============================== Modal ==============================

  selectedRetailer: any = {};
  agentFound: Agent | null = null;
  mainAggregator: any = {};
  agentModal = false;
  agents: any[] = [];


  getAllAgent() {
    this.dailyTrackingService.getAllAgent().subscribe((res: any) => {
      this.agents = res;
    });
  }


  openAgentModal(agent: { agentId: string }): void {

    if (!agent || !agent.agentId) {
      console.warn('Agent ID manquant ou invalide.');
      return;
    }

    // Réinitialiser les données du modal avant l'appel API
    this.selectedRetailer = agent;
    this.agentFound = null;
    this.agentModal = false;

    this.dailyTrackingService.getAgentById(agent.agentId)
      .pipe(
        catchError(err => {
          console.error(`Erreur lors de la récupération de l'agent ${agent.agentId}`, err);
          return of(null);
        })
      )
      .subscribe(agentData => {

        if (agentData) {
          this.agentFound = agentData ?? agentData;

          console.log('Agent Found:', this.selectedRetailer);
          console.log('Aggregators id', this.selectedRetailer.topAggregatorId, this.selectedRetailer.mainAggregatorId);

          this.agentModal = true;
          console.log('Agent récupéré :', this.agentFound);
        } else {
          console.warn(`Agent ${agent.agentId} introuvable.`);
        }
      });
  }

  closeModal(): void {
    this.agentModal = false;
    this.selectedRetailer = {};
    this.agentFound = null;
    this.mainAggregator = null;
    this.activeTab = 'retailer'
  }

  getAccountTypeLabel(accountType: string | null | undefined): string {
    switch (accountType) {
      case 'BOTH':
        return 'Both Accounts';
      case 'MAIN_ONLY':
        return 'With Main Only';
      case 'CASHOUT_ONLY':
        return 'With Cashout Only';
      case 'NONE':
        return 'No Active Account';
      default:
        return 'N/A';
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    if (
      tab === 'aggregators' &&
      this.selectedRetailer?.mainAggregatorId &&
      this.selectedRetailer?.topAggregatorId
    ) {

      this.loadAgentAggregators(
        this.selectedRetailer.mainAggregatorId,
        this.selectedRetailer.topAggregatorId
      );
    }
  }

  aggregators: { mainAggregator: Aggregator | null; topAggregator: Aggregator | null } = {
    mainAggregator: null,
    topAggregator: null
  };

  loadAgentAggregators(mainAggregatorId: string, topAggregatorId: string) {
    // Récupération de l'agrégateur principal
    this.dailyTrackingService.getAggregatorById(mainAggregatorId).subscribe({
      next: (mainData) => {
        this.aggregators.mainAggregator = mainData;
      },
      error: (err) => {
        console.error('Failed to load main aggregator', err);
        this.aggregators.mainAggregator = null;
      }
    });

    // Récupération du top agrégateur
    this.dailyTrackingService.getAggregatorById(topAggregatorId).subscribe({
      next: (topData) => {
        this.aggregators.topAggregator = topData;
      },
      error: (err) => {
        console.error('Failed to load top aggregator', err);
        this.aggregators.topAggregator = null;
      }
    });
  }

  // -------------------------- SMS d'un agent --------------------------

  sendSmsToAgent(agent: any): void {
    if (!agent || !agent.msisdn) {
      console.error('No agent or phone number provided');
      return;
    }
    // Logique d'envoi SMS ou ouverture modale ici
    console.log(`Send SMS to ${agent.name || agent.msisdn}`);
    // Par exemple : ouvrir un modal, appeler un service SMS, etc.
  }

  // Envoyer des messages aux agregateur
  sendSmsToBothAggregators() {}

  // ------------------------- Localisation de l'agent --------------------------
  showLocationModal = false;
  selectedLatitude?: number;
  selectedLongitude?: number;
  locationSource: 'box' | 'cell' | null = null;


  activeTab: string = 'retailer';

  userLatitude?: number;
  userLongitude?: number;

  availableLocations: { type: 'box' | 'cell'; lat: number; lng: number }[] = [];

  openLocationModal(agent: any): void {
    this.availableLocations = [];

    if (agent.boxLatitude && agent.boxLongitude) {
      this.availableLocations.push({
        type: 'box',
        lat: +agent.boxLatitude,
        lng: +agent.boxLongitude,
      });
    }

    if (agent.cellLatitude && agent.cellLongitude) {
      this.availableLocations.push({
        type: 'cell',
        lat: +agent.cellLatitude,
        lng: +agent.cellLongitude,
      });
    }

    if (this.availableLocations.length === 0) {
      alert('Aucune coordonnée géographique disponible pour cet agent.');
      return;
    }

    this.locationSource = this.availableLocations[0].type;
    this.updateSelectedLocation();
    this.showLocationModal = true;


    // On demande la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;
        },
        (error) => {
          console.error("Geolocation failed or denied, falback to Gabon center");
          this.userLatitude = 0.5;
          this.userLongitude = 11.5;
        }
      );
    } else {
      this.userLatitude = 0.5; // Gabon center
      this.userLongitude = 11.5;
    }
    this.showLocationModal = true;
  }


  updateSelectedLocation(): void {
    const selected = this.availableLocations.find(
      (loc) => loc.type === this.locationSource
    );
    if (selected) {
      this.selectedLatitude = selected.lat;
      this.selectedLongitude = selected.lng;
    }
  }


  // ================================= Les cartes =======================================

  // Totaux pour les cartes
  totalPremium: number = 0;
  totalAgents650: number = 0;
  totalPremiumAnd650: number = 0;
  totalInactiveCashout: number = 0;
  totalInactiveMain: number = 0;
  totalInactiveBoth: number = 0;


  // ============================== Initialisation ==============================

  ngOnInit(): void {
    // Initialiser la date à hier
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.selectedDate = yesterday.toISOString().split('T')[0];

    this.getZoneAndSubZone();
    this.filterData();

    this.getAllAgent();
  }
}
