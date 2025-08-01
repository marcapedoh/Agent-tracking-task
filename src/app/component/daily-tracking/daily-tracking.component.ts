import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';


import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
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


@Component({
  selector: 'app-daily-tracking',
  templateUrl: './daily-tracking.component.html',
  styleUrls: ['./daily-tracking.component.css']
})
export class DailyTrackingComponent implements OnInit, OnDestroy, AfterViewInit {

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
  selectDate = '';
  dateObj = new Date();
  selectedDays: number = 3;
  selectedStatus: string = '';
  selectedZone: string = '';
  selectedSubzone: string = '';
  isInactiveFilterActive: boolean = false;
  // Leaflet Map
  map!: L.Map;
  mapLayers: L.Layer[] = [];
  mapOptions: L.MapOptions = {};
  agentModal = false;
  // Statistiques / Chart
  chartOptions!: Partial<ChartOptions>;

  // Alertes
  showInactivityAlert = false;
  alertInterval: any;
  inactivityAlertInterval: any;

  // Modal / Bulk SMS
  selectedRetailer: any = {};
  selectedRetailers: any[] = [];
  selectedBulkMessage: string = '';
  bulkMessageContent: string = '';
  showBulkSMSModal: boolean = false;
  activeTab: 'retailer' | 'aggregator' | 'Location' = 'retailer';

  // Zones et SubZones
  zones: any[] = [];
  zonesWithSub: any = [];

  // Agrégateur principal
  mainAggregator: any = {};
  agentFound: any = {};

  // Pagination
  currentPage: number = 0;
  itemsPerPage: number = 100;
  itemsPerPageOptions = [10, 50, 100, 150, 200]
  allSelected: boolean = false;
  filteredRetailers: any[] = [];


  // Statuts possibles
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Need_Cashing', label: 'Need Cash In' },
    { value: 'Need_Cashout', label: 'Need Cash Out' },
    { value: 'Auto_Transfer', label: 'Auto Transfer' },
  ];


  constructor(private dailyTrackingService: DailyTrackingService) { }

  // Initialisation

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.selectedDate = today.toISOString().split('T')[0];
    this.selectDate = today.toISOString().substring(0, 10);

    this.initInactivityAlerts();
    this.initCounterAnimation();
    this.initFilterToggle();
    this.initChart();
    this.filterData();
    this.dailyTrackingService.getAllSnapshot(this.selectDate, this.currentPage, this.itemsPerPage).subscribe((res: any) => {
      console.log(res.content);
      this.allData = res.content;
      this.datas = [...this.allData];
    })
    this.filteredRetailers = [...this.retailers];
    this.getZoneAndSubZone()
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
        this.dailyTrackingService.getSubZonesPerZoneName(zone.name).subscribe((res: any) => {
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
          attribution: '&copy; OpenStreetMap contributors'
        })
      ]
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.alertInterval);
  }

  // Carte et Leaflet
  initMap(): void {
    // Ajouter les marqueurs
    const agent = this.selectedRetailer;

    const marker = L.marker(
      [
        agent.boxLatitude ? agent.boxLatitude : agent.cellLatitude,
        agent.boxLongitude ? agent.boxLongitude : agent.cellLongitude
      ] as L.LatLngExpression,
      {
        icon: this.getIconForStatus(agent.status)
      }
    ).bindPopup(`
    <b>${this.mainAggregator.name}</b><br>
    <span>${this.mainAggregator.shortCode}</span><br>`);

    this.mapLayers.push(marker);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Marqueur pour la machine
        const userMarker = L.marker([userLat, userLng], {
          icon: L.icon({
            iconUrl: 'assets/marker-blue.png', // Icône pour la machine
            iconSize: [40, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
          })
        }).bindPopup(`<b>Ma Position</b>`);

        this.mapLayers.push(userMarker);

        // Tracer la trajectoire
        const latlngs: L.LatLngExpression[] = [
          [userLat, userLng],
          [
            agent.boxLatitude ? agent.boxLatitude : agent.cellLatitude,
            agent.boxLongitude ? agent.boxLongitude : agent.cellLongitude
          ]
        ];

        const polyline = L.polyline(latlngs, { color: 'blue', weight: 4 });
        this.mapLayers.push(polyline);

        // Centrer la carte sur les deux points
        const bounds = L.latLngBounds(latlngs);
        this.map.fitBounds(bounds);
      }, (error) => {
        console.error('Erreur de géolocalisation :', error);
      });
    } else {
      console.error('Géolocalisation non supportée par ce navigateur.');
    }
  }

  // Chart et Historique
  statsData: any = {}
  initChart() {
    this.chartOptions = {
      series: [
        {
          name: "Main Account",
          data: this.selectedRetailer?.balanceHistory?.map((item: any) => item.principalBalance) || [14, 78, 5, 21, 19, 8, 11]
        },
        {
          name: "Cashout Account",
          data: this.selectedRetailer?.balanceHistory?.map((item: any) => item.withdrawalBalance) || [25, 36, 23, 12, 7, 2, 16]
        },
        {
          name: "Auto Transfer",
          data: this.selectedRetailer?.balanceHistory?.map((item: any) => item.autoTransferAmount) || [18, 52, 13, 42, 8, 5, 5]
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
        categories: this.selectedRetailer?.balanceHistory?.map((item: any) =>
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
            return ` ${value.toLocaleString()}`;
          }
        }
      },
      tooltip: {
        y: {
          formatter: (value) => {
            return ` ${value.toLocaleString()}`;
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

  // --------------------------------Filtres-------------------------------------

  // Filtres de la categorie :
  categoryOptions = [
    { label: '650', value: '650' },
    { label: '650 & Premium', value: '650_and_Premium' },
    { label: 'Ordinary', value: 'Ordinary' },
    { label: 'Premium', value: 'Premium' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  selectedCategory: string = '';



  filterData() {

    if (!this.selectDate) {
      console.warn("Aucune date sélectionnée !");
      return;
    }

    const formattedDate = new Date(this.selectDate).toISOString().split('T')[0];
    this.dateObj = new Date(formattedDate);

    this.dailyTrackingService.getAllSnapshot(this.selectDate, 0, this.itemsPerPage).subscribe((res: any) => {
      console.log(res.content);
      this.allData = res.content;
      this.datas = [...this.allData];
    })
    this.dailyTrackingService.getSummary(this.selectedDate, this.selectedZone, this.selectedSubzone).subscribe((res: any) => {
      console.log(res)
      this.statsData = res;
    })
  }


  applyFilters(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedDays);

    this.datas = this.datas.filter((retailer: any) => {

      const subzoneMatch = !this.selectedSubzone ||
        retailer.subZone === this.selectedSubzone;

      const statusMapping: { [key: string]: string } = {
        Need_Cashing: 'NEED_CASHING',
        Need_Cashout: 'NEED_CASHOUT',
        Auto_Transfer: 'AUTO_TRANSFER',
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
      this.datas = [...this.allData];
      return;
    }
    console.log(this.datas)

    const statusMapping: { [key: string]: string } = {
      Need_Cashing: 'NEED_CASHING',
      Need_Cashout: 'NEED_CASHOUT',
      Auto_Transfer: 'AUTO_TRANSFER',
    };

    const mappedStatus = statusMapping[this.selectedStatus];
    console.log(mappedStatus)
    this.datas = this.allData.filter(agent =>
      agent.agentStatus?.toUpperCase() === mappedStatus
    );

    console.log('Agents filtrés par statut :', this.datas);
    this.currentPage = 1;
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
    this.currentPage = 1;
    console.log('Agents filtrés par zone/sous-zone :', this.datas);
  }

  hasSubzones(): boolean {
    return !!(this.selectedZone && this.zonesWithSub[this.selectedZone]?.length > 0);
  }

  // Compteurs
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


  // Inactivité & Alertes
  getInactiveDays(lastActivityDate: Date): number {
    if (!lastActivityDate) return 0;

    const today = new Date();
    const lastDate = new Date(lastActivityDate);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  initInactivityAlerts(): void {
    this.checkInactivityAlerts();
    this.inactivityAlertInterval = setInterval(() => {
      this.checkInactivityAlerts();
    }, 10000);
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

      this.showInactivityAlert = true;

      // Fermer automatiquement après 5 secondes
      setTimeout(() => {
        this.showInactivityAlert = false;
      }, 5000);
    }
  }


  getIconForStatus(status: string): L.Icon {
    const iconUrl = status === 'active' ? 'assets/marker-green.png' :
      status === 'inactive' ? 'assets/marker-red.png' :
        'assets/marker-orange.png';

    return L.icon({
      iconUrl,
      iconSize: [40, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  }

  // Utilitaires
  sanitizeValue(value: string | null | undefined): string {
    if (value === null || value === undefined || value.trim().toUpperCase() === '[NULL]' || value.trim() === '') {
      return '-';
    }
    return value;
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


  getInactiveRetailersCount(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return 0
  }

  // Pagination
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.datas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.datas.length / this.itemsPerPage);
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

  changePage(page: number): void {
    this.currentPage = page;
  }

  // -----------------------Modal Agent----------------------------------------
  openAgentModal(agent: any): void {
    this.selectedRetailer = agent;
    this.agentModal = true
    console.log(agent)
    this.agentFound = this.agents.find((agent: any) =>
      this.selectedRetailer.agentId == agent.id
    )
    this.dailyTrackingService.getMainAggregator(this.selectedRetailer.agentId).subscribe(res => {
      this.mainAggregator = res
      console.log("Aggregator ", this.mainAggregator)
    })
    this.initMap()
    this.mapOptions = {
      layers: getLayers(),
      zoom: 6,
      center: L.latLng(+this.selectedRetailer.boxLatitude ? +this.selectedRetailer.boxLatitude : +this.selectedRetailer.cellLatitude, +this.selectedRetailer.boxLongitude ? +this.selectedRetailer.boxLongitude : +this.selectedRetailer.cellLongitude)
    };

    console.log("AgentFound ", this.agentFound)
  }

  closeModal(): void {
    this.agentModal = false
    this.selectedRetailer = null;
  }


  // ----------------------------Bulk SMS------------------------------------
  openBulkSMSModal(): void {
    this.showBulkSMSModal = true;
    this.selectedBulkMessage = '';
    this.bulkMessageContent = '';
  }

  sendSMS(): void {
    this.closeModal();
  }

  // -------------------------Sélections agents-------------------------------
  selectedAgents: any[] = [];
  paginatedAgents: any[] = [];
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



  isAgentSelected(agent: any): boolean {
    return this.selectedAgents.some(a => a.code === agent.code);
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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  ];


}
