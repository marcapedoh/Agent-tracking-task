import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

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
  yaxis?: ApexYAxis;
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  transactionsChartOptions!: Partial<ChartOptions>;
  alertsByZoneChartOptions!: Partial<ChartOptions>;
  performanceChartOptions!: Partial<ChartOptions>;

  recentActivities = [
    { type: 'alert', retailer: 'Jean Dupont', location: 'Libreville', time: '10 mins ago' },
    { type: 'cashout', retailer: 'Marie Nkoghe', location: 'Port-Gentil', time: '25 mins ago' },
    { type: 'new', retailer: 'Paul Mba', location: 'Franceville', time: '1 hour ago' },
    { type: 'alert', retailer: 'Luc Owono', location: 'Oyem', time: '2 hours ago' }
  ];

  pendingAlerts = [
    { priority: 'high', type: 'Recharge', retailer: 'Alice Minko', location: 'Libreville', details: 'Balance: XAF 12,500 (critical)' },
    { priority: 'medium', type: 'Cashout', retailer: 'David Nguema', location: 'Port-Gentil', details: 'Requested: XAF 75,000' },
    { priority: 'low', type: 'Transfer', retailer: 'Sarah Ngoua', location: 'Franceville', details: 'Threshold reached' }
  ];
  mapOptions: L.MapOptions = {
    layers: getLayers(),
    zoom: 6,
    center: L.latLng(0.4162, 9.4673) // Centre sur le Gabon
  };

  // Données des revendeurs
  resellersData = [
    {
      name: 'Jean Dupont',
      city: 'Libreville',
      position: [0.4162, 9.4673],
      status: 'active',
      lastActivity: '2 hours ago',
      balance: 'XAF 45,000'
    },
    {
      name: 'Marie Nkoghe',
      city: 'Port-Gentil',
      position: [-0.7167, 8.7833],
      status: 'inactive',
      lastActivity: '5 days ago',
      balance: 'XAF 12,500'
    },
    {
      name: 'Paul Mba',
      city: 'Franceville',
      position: [-1.6333, 13.5833],
      status: 'active',
      lastActivity: '1 hour ago',
      balance: 'XAF 78,000'
    },
    {
      name: 'Luc Owono',
      city: 'Oyem',
      position: [1.6167, 11.5833],
      status: 'critical',
      lastActivity: '30 minutes ago',
      balance: 'XAF 5,000'
    },
    {
      name: 'Alice Minko',
      city: 'Mouila',
      position: [-1.8667, 11.0167],
      status: 'active',
      lastActivity: '3 hours ago',
      balance: 'XAF 32,000'
    }
  ];

  // Couches de la carte
  mapLayers: L.Layer[] = [];

  initMap(): void {
    // Ajouter les marqueurs
    this.resellersData.forEach(reseller => {
      const marker = L.marker(reseller.position as L.LatLngExpression, {
        icon: this.getIconForStatus(reseller.status)
      })
        .bindPopup(`
        <b>${reseller.name}</b><br>
        <span>${reseller.city}</span><br>
        <span>Status: ${reseller.status}</span><br>
        <span>Balance: ${reseller.balance}</span><br>
        <span>Last activity: ${reseller.lastActivity}</span>
      `);

      this.mapLayers.push(marker);
    });
  }

  getIconForStatus(status: string): L.Icon {
    const iconUrl = status === 'active' ? 'assets/marker-green.png' :
      status === 'inactive' ? 'assets/marker-red.png' :
        'assets/marker-orange.png';

    return L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  }

  constructor() { }

  ngOnInit(): void {
    this.initCharts();
    this.initCounterAnimation();
    this.initFilterToggle();
  }

  initCharts(): void {
    // Transactions Chart
    this.transactionsChartOptions = {
      series: [
        {
          name: "Transactions",
          data: [45, 52, 38, 24, 33, 26, 45]
        }
      ],
      chart: {
        height: 300,
        type: "line",
        toolbar: {
          show: false
        }
      },
      colors: ["#3498db"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: "smooth"
      },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " transactions";
          }
        }
      }
    };

    // Alerts by Zone Chart
    this.alertsByZoneChartOptions = {
      series: [
        {
          name: "Alerts",
          data: [14, 23, 21, 17, 15]
        }
      ],
      chart: {
        height: 300,
        type: "bar",
        toolbar: {
          show: false
        }
      },
      colors: ["#9b59b6"],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '45%',
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Mouila"]
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " alerts";
          }
        }
      }
    };

    // Performance Chart
    this.performanceChartOptions = {
      series: [
        {
          name: "Performance",
          data: [44, 55, 57, 56, 61, 58, 63]
        }
      ],
      chart: {
        height: 300,
        type: "bar",
        toolbar: {
          show: false
        }
      },
      colors: ["#2ecc71"],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '45%',
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ["Paul Mba", "Marie Nkoghe", "Jean Dupont", "Luc Owono", "Alice Minko", "David Nguema", "Sarah Ngoua"]
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " score";
          }
        }
      }
    };
  }

  initCounterAnimation(): void {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
      const el = counter as HTMLElement;
      const target = +el.getAttribute('data-target')!;
      let count = 0;

      const updateCount = () => {
        const increment = target / speed;

        if (count < target) {
          count += increment;
          el.innerText = Math.ceil(count).toString();
          requestAnimationFrame(updateCount);
        } else {
          el.innerText = target.toString();
        }
      };

      updateCount();
    });
  }



  initFilterToggle(): void {
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    if (filterBtn && filterDropdown) {
      filterBtn.addEventListener('click', () => {
        filterDropdown.classList.toggle('hidden');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!filterBtn.contains(e.target as Node) && !filterDropdown.contains(e.target as Node)) {
          filterDropdown.classList.add('hidden');
        }
      });
    }
  }

}

export function getLayers(): L.Layer[] {
  return [
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  ];
}
