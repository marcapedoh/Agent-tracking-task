import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// En dehors de la classe, en haut du fichier service
export interface SummaryData {
  need_cashing: number;
  need_cashout: number;
  auto_transfer: number;
}

@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {

  private readonly baseUrl = 'http://localhost:8080/agent-tracking/api/data';

  constructor(private httpClient: HttpClient) { }


    // 2. Zones
    getAllZone(): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/zones`);
    }

    // 3. Sous-zones d'une zone
    getSubZonesPerZoneName(zoneName: string): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/zones/${zoneName}/subzones/names`);
    }

    // 4. Tous les agents
    getAllAgent(): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/agents`);
    }

    // 5. Agrégateur principal d'un agent
    getMainAggregator(agentId: string): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/agents/${agentId}/aggregator`);
    }

    // 6. Résumé global (summary), avec ou sans filtres
    getSummaryForCart(date: string, zone?: string, subZone?: string, category?: string) {
      let params = new HttpParams().set('date', date);
      
      if (date) params = params.set('date', date)
      if (zone) params = params.set('zone', zone);
      if (subZone) params = params.set('subZone', subZone);
      if (category) params = params.set('category', category);

      return this.httpClient.get<{ [key: string]: number }>(`${this.baseUrl}/summary`, { params });
    }

    // 7. Recuperation des agents inactifs pour le filtage 
    getInactiveAndDormantFiltredSnapshot(params: HttpParams): Observable<any>{
      return this.httpClient.get(`${this.baseUrl}/inactive-dormant/filtered`, { params })
    }

    // 8. Autre méthode générique (si besoin)
    getFilteredSnapshots(params: HttpParams): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/global/filtered`, { params });
    }

    // 9. Récupérer l'historique des 4 comportements sur les soldes
    getAgentStatusHistory(agentId: string): Observable<{ createdAt: string, agentStatus: string }[]> {
      return this.httpClient.get<{ createdAt: string, agentStatus: string }[]>(
        `${this.baseUrl}/${agentId}/status-history`
      );
    }

}
