import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {

  constructor(private httpClient: HttpClient) { }

  getAllSnapshot(snapshotDate: string, page: number, size: number, filters?: {
    zone?: string,
    subZone?: string,
    agentStatus?: string,
    category?: string
  }) {
    let params = new HttpParams()
      .set('snapshotDate', snapshotDate)
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.zone) params = params.set('zone', filters.zone);
      if (filters.subZone) params = params.set('subZone', filters.subZone);
      if (filters.agentStatus) params = params.set('agentStatus', filters.agentStatus);
      if (filters.category) params = params.set('category', filters.category);
    }
    console.log(params)
    return this.httpClient.get("http://localhost:8080/agent-tracking/api/data/global/filtered", { params });
  }


  getAllZone() {
    return this.httpClient.get("http://localhost:8080/agent-tracking/api/data/zones")
  }
  getSubZonesPerZoneName(zoneName: string) {
    return this.httpClient.get(`http://localhost:8080/agent-tracking/api/data/zones/${zoneName}/subzones/names`)
  }

  getAllAgent() {
    return this.httpClient.get("http://localhost:8080/agent-tracking/api/data/agents")
  }

  getMainAggregator(agentId: string) {
    return this.httpClient.get(`http://localhost:8080/agent-tracking/api/data/agents/${agentId}/aggregator`)
  }

  getSummary(date: string, zone?: string, subZone?: string) {
    let params = new HttpParams().set('date', date);

    if (zone) {
      params = params.set('zone', zone);
    }

    if (subZone) {
      params = params.set('subZone', subZone);
    }

    return this.httpClient.get<any>(`http://localhost:8080/agent-tracking/api/data/summary`, { params });
  }
}
