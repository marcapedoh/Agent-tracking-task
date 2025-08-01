import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {

  selectedType = 'daily';
  selectedDate: string = '';
  selectedZone = '';
  selectedSubzone = '';

  today: Date = new Date();

  mainAccountThreshold: number = 0;
  balanceThreshold: number = 0;



  zones: string[] = ['North', 'South', 'East', 'West']; // Exemple
  subzones: { [zone: string]: string[] } = {
    North: ['Subzone A1', 'Subzone A2'],
    South: ['Subzone B1', 'Subzone B2'],
    East: ['Subzone C1'],
    West: ['Subzone D1', 'Subzone D2', 'Subzone D3']
  };

  applyFilters() {
    console.log('Applying filters:', {
      type: this.selectedType,
      date: this.selectedDate,
      zone: this.selectedZone,
      subzone: this.selectedSubzone
    });
    // Tu feras l'appel à l’API ici
  }

  exportReport() {
    console.log('Exporting report...');
    // Appel API pour téléchargement
  }
}
