import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
} from 'ng-apexcharts';
import { DailyTrackingService } from 'src/app/services/dailyTracking-Service/daily-tracking.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  legend: {
    show: true;
    position: 'top';
    labels: {
      colors: '#333';
    };
  };
  colors: string[];
};

@Component({
  selector: 'app-daily-tracking',
  templateUrl: './daily-tracking.component.html',
  styleUrls: ['./daily-tracking.component.css'],
})
export class DailyTrackingComponent
  implements OnInit, OnDestroy, AfterViewInit {
  // Services et Constantes
  Math = Math;
  // Donnees brutes et Utilisateurs
  retailers: any[] = [];
  agents: any[] = [];
  datas: any[] = [];
  allData: any[] = [];

  // Date et Filtres
  today: Date = new Date();
  selectedDate = '';
  selectedDays: number = 3;

  map!: L.Map;
  mapLayers: L.Layer[] = [];
  mapOptions: L.MapOptions = {};

  // Statistiques / Chart
  chartOptions!: Partial<ChartOptions>;

  // Alertes
  showInactivityAlert = false;
  alertInterval: any;
  inactivityAlertInterval: any;

  // Zones et SubZones
  zones: any[] = [];
  zonesWithSub: any = [];

  allSelected: boolean = false;
  filteredRetailers: any[] = [];

  // Statuts possibles
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'NEED_CASHING', label: 'Need Cash In' },
    { value: 'NEED_CASHOUT', label: 'Need Cash Out' },
    { value: 'AUTO_TRANSFER', label: 'Auto Transfer' },
  ];

  constructor(private dailyTrackingService: DailyTrackingService) { }

  // Initialisation

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.selectedDate = today.toISOString().split('T')[0];
    this.selectDate = today.toISOString().substring(0, 10);

    this.initFilterToggle();
    this.filterData();
    this.loadSummaryForCart();

    this.getZoneAndSubZone();
    this.getAllAgent();
  }

  getAllAgent() {
    this.dailyTrackingService.getAllAgent().subscribe((res: any) => {
      this.agents = res;
    });
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

  ngAfterViewInit(): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 5,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }),
      ],
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.alertInterval);
  }

  // --------------------------------Filtres et Pagination dans le tableau de Global View-------------------------------------

  // Filtres de la categorie :
  categoryOptions = [
    { label: '650', value: '650' },
    { label: '650 & Premium', value: '650_and_Premium' },
    { label: 'Ordinary', value: 'Ordinary' },
    { label: 'Premium', value: 'Premium' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  // Filtres
  selectedStatus: string = '';
  selectedCategory: string = '';
  selectedZone: string = '';
  selectedSubzone: string = '';
  selectDate: string = '';

  loading = false;

  // Donnees filtrées
  snapshots: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 20;
  itemsPerPageOptions = [5, 10, 20, 50, 100, 150, 200];
  totalPages: number = 0;
  totalElements: number = 0;

  // Fonction pour récupérer les données paginées avec filtres

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

    this.dailyTrackingService
      .getFilteredSnapshots(params)
      .subscribe((response: any) => {
        this.snapshots = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      });

    error: () => {
      this.loading = false;
    };
  }

  // Méthodes supplémentaires pour pagination
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

  // Méthodes pour déclencher les filtres
  applyFilters() {
    this.currentPage = 1;
    this.filterData();
    this.loadSummaryForCart();
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

  hasSubzones(): boolean {
    return !!(
      this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0
    );
  }

  // ----------------------- Methode pour charger les valeurs des cartes --------------------------
  summary: {
    need_cashing?: number;
    need_cashout?: number;
    auto_transfer?: number;
  } = {};

  loadSummaryForCart() {
    if (!this.selectDate) return;

    this.dailyTrackingService
      .getSummaryForCart(
        this.selectDate,
        this.selectedZone,
        this.selectedSubzone,
        this.selectedCategory
      )
      .subscribe({
        next: (res) => {
          this.summary = res;
        },
        error: (err) => {
          console.error('Error fetching summary:', err);
        },
      });
  }

  // -----------------------Modal Agent & Bulk SMS----------------------------------------

  agentModal = false;
  showBulkSMSModal: boolean = false;

  selectedRetailer: any = {};
  agentFound: any = {};
  mainAggregator: any = {};
  selectedRetailers: any[] = [];

  selectedBulkMessage: string = '';
  bulkMessageContent: string = '';
  activeTab: 'retailer' | 'aggregator' | 'location' = 'retailer';

  openAgentModal(agent: any): void {
    this.selectedRetailer = agent;
    this.agentModal = true;

    this.agentFound = this.agents.find((a: any) => a.id === agent.agentId);
    console.log('Agent Found:', this.selectedRetailer.agentId);
    this.loadAgentStatusChart(this.selectedRetailer.agentId);

    this.dailyTrackingService
      .getMainAggregator(agent.agentId)
      .subscribe((res) => {
        this.mainAggregator = res;
      });

    this.initMap();
    this.mapOptions = {
      layers: getLayers(),
      zoom: 6,
      center: L.latLng(
        +agent.boxLatitude || +agent.cellLatitude,
        +agent.boxLongitude || +agent.cellLongitude
      ),
    };
  }

  closeModal(): void {
    this.agentModal = false;
    this.selectedRetailer = {};
    this.agentFound = null;
    this.mainAggregator = null;
  }

  openBulkSMSModal(): void {
    this.showBulkSMSModal = true;
    this.selectedBulkMessage = '';
    this.bulkMessageContent = '';
  }

  sendSMS(): void {
    // À implémenter plus tard
    this.closeModal();
  }

  // ----------------------- Courbe --------------------------
  loadAgentStatusChart(agentId: string): void {
    if (!agentId) {
      console.error('Agent ID is required');
      this.chartOptions = {};
      return;
    }

    this.dailyTrackingService.getAgentStatusHistory(agentId).subscribe({
      next: (data) => {
        const filteredData = data.filter((d) =>
          ['NORMAL', 'NEED_CASHING', 'NEED_CASHOUT', 'AUTO_TRANSFER'].includes(
            d.agentStatus
          )
        );

        const labels = filteredData.map((d) => d.createdAt.split('T')[0]);

        const seriesMap: Record<string, (number | null)[]> = {
          NORMAL: [],
          NEED_CASHING: [],
          NEED_CASHOUT: [],
          AUTO_TRANSFER: [],
        };

        const statusToValue: Record<string, number> = {
          NORMAL: 0,
          NEED_CASHING: 1,
          NEED_CASHOUT: 2,
          AUTO_TRANSFER: 3,
        };

        // Initialiser les tableaux avec nulls
        filteredData.forEach((d) => {
          const currentStatus = d.agentStatus;
          Object.keys(seriesMap).forEach((status) => {
            seriesMap[status].push(
              status === currentStatus ? statusToValue[status] : null
            );
          });
        });

        this.chartOptions = {
          chart: {
            type: 'line',
            height: 350,
            toolbar: { show: true },
          },
          series: [
            {
              name: 'NORMAL',
              data: seriesMap['NORMAL'],
            },
            {
              name: 'NEED_CASHING',
              data: seriesMap['NEED_CASHING'],
            },
            {
              name: 'NEED_CASHOUT',
              data: seriesMap['NEED_CASHOUT'],
            },
            {
              name: 'AUTO_TRANSFER',
              data: seriesMap['AUTO_TRANSFER'],
            },
          ],
          xaxis: {
            categories: labels,
            title: {
              text: 'Date',
              style: { fontWeight: 600 },
            },
          },
          yaxis: {
            min: 0,
            max: 3,
            tickAmount: 3,
            forceNiceScale: true,
            labels: {
              formatter: (val: number) => {
                const reverseMap = [
                  'NORMAL',
                  'NEED_CASHING',
                  'NEED_CASHOUT',
                  'AUTO_TRANSFER',
                ];
                return reverseMap[Math.round(val)] ?? 'UNKNOWN';
              },
            },
          },
          tooltip: {
            y: {
              formatter: (val: number) => {
                const reverseMap = [
                  'NORMAL',
                  'NEED_CASHING',
                  'NEED_CASHOUT',
                  'AUTO_TRANSFER',
                ];
                return reverseMap[val] ?? 'UNKNOWN';
              },
            },
          },
          colors: ['#22c55e', '#f97316', '#ef4444', '#3b82f6'], // vert, orange, rouge, bleu
          stroke: {
            curve: 'smooth',
            width: 3,
          },
          legend: {
            show: true,
            position: 'top',
            labels: {
              colors: '#333',
            },
          },
        };
      },
      error: (err) => {
        console.error('Erreur lors du chargement du statut de l’agent', err);
        this.chartOptions = {};
      },
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

  // ------------------------- Localisation de l'agent --------------------------
  showLocationModal = false;
  selectedLatitude?: number;
  selectedLongitude?: number;
  locationSource: 'box' | 'cell' | null = null;
  trackingMode = 'live';

  userLatitude?: number;
  userLongitude?: number;
  mapInstance?: L.Map;
  routeLayer?: L.Polyline; // pour la route

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

    setTimeout(() => this.initMap(), 0);

    // On demande la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;
          this.initMap();
        },
        (error) => {
          console.error("Geolocation failed or denied, falback to Gabon center");
          this.userLatitude = 0.5;
          this.userLongitude = 11.5;
          this.initMap();
        }
      );
    } else {
      this.userLatitude = 0.5; // Gabon center
      this.userLongitude = 11.5;
      this.initMap();
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

  closeLocationModal(): void {
    this.showLocationModal = false;
    setTimeout(() => this.initMap(), 0); // réinitialise à la fermeture
  }

  onLocationChange(): void {
    this.updateSelectedLocation();
    setTimeout(() => this.initMap(), 0);
  }



  initMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    mapContainer.innerHTML = ''; // reset map container

    // Initialisation carte
    this.mapInstance = L.map('map', {
      zoomControl: true,
    });

    // Si on a les coords agent et utilisateur
    if (this.selectedLatitude && this.selectedLongitude && this.userLatitude && this.userLongitude) {
      // Calcul du centre entre user et agent
      const centerLat = (this.selectedLatitude + this.userLatitude) / 2;
      const centerLng = (this.selectedLongitude + this.userLongitude) / 2;

      this.mapInstance.setView([centerLat, centerLng], 10); // zoom intermédiaire

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.mapInstance);

      // Marker Agent
      L.marker([this.selectedLatitude, this.selectedLongitude], { title: 'Agent Location', icon: this.agentIcon() })
        .addTo(this.mapInstance)
        .bindPopup('Location of Agent')
        .openPopup();

      // Marker User
      L.marker([this.userLatitude, this.userLongitude], { title: 'Your Location', icon: this.userIcon() })
        .addTo(this.mapInstance)
        .bindPopup('Your Current Location');

      // Tracer itinéraire (ligne simple entre user et agent)
      const latlngs: L.LatLngTuple[] = [
        [this.userLatitude as number, this.userLongitude as number],
        [this.selectedLatitude as number, this.selectedLongitude as number],
      ];

      if (this.routeLayer) {
        this.mapInstance.removeLayer(this.routeLayer);
      }

      this.routeLayer = L.polyline(latlngs, { color: '#FF6600', weight: 4, opacity: 0.7 }).addTo(this.mapInstance);

    } else {
      // Si pas de user ou agent, centre sur Gabon
      this.mapInstance.setView([0.5, 11.5], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.mapInstance);
    }
  }

  // Icônes personnalisées
  agentIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/icons/marker-agent.png', // à créer (ou remplacer par une icône dispo)
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -37],
    });
  }

  userIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/icons/marker-user.png', // à créer ou choisir une icône utilisateur
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -37],
    });
  }



  refreshMap(): void {
    this.initMap(); // Refresh = reinit
  }

  centerMapOnAgent(): void {
    this.initMap(); // Même logique si on veut recenter simplement
  }



  getIconForStatus(status: string): L.Icon {
    const iconUrl =
      status === 'active'
        ? 'assets/marker-green.png'
        : status === 'inactive'
          ? 'assets/marker-red.png'
          : 'assets/marker-orange.png';

    return L.icon({
      iconUrl,
      iconSize: [40, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }

  // Utilitaires
  sanitizeValue(value: string | null | undefined): string {
    if (
      value === null ||
      value === undefined ||
      value.trim().toUpperCase() === '[NULL]' ||
      value.trim() === ''
    ) {
      return '-';
    }
    return value;
  }

  initFilterToggle(): void {
    const btn = document.getElementById('filterBtn');
    const dropdown = document.getElementById('filterDropdown');

    if (btn && dropdown) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (
          !btn.contains(e.target as Node) &&
          !dropdown.contains(e.target as Node)
        ) {
          dropdown.classList.add('hidden');
        }
      });
    }
  }

  getInactiveRetailersCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return 0;
  }

  // Pagination
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.datas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // -----------------------Modal Agent----------------------------------------

  // ----------------------------Bulk SMS------------------------------------

  // -------------------------Sélections agents-------------------------------
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
    this.allAgentsSelected =
      this.selectedAgents.length === this.paginatedAgents.length;
  }

  isAgentSelected(agent: any): boolean {
    return this.selectedAgents.some((a) => a.code === agent.code);
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

  exportReport() { }
}

export function getLayers(): L.Layer[] {
  return [
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
  ];
}
