import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {

  constructor(private httpClient: HttpClient) { }

  getAllSnapshot(snapshotDate: string, page: number = 0, size: number= 100) {
    const params = {
      snapshotDate: snapshotDate,
      page: page,
      size: size
    };

    return this.httpClient.get("http://localhost:8080/agent-tracking/api/data/all-snapshots", {
      params: params
    });

  }

  getAllZone() {
    return this.httpClient.get("http://localhost:8080/agent-tracking/api/data/zones")
  }
  getSubZonesPerZoneName(zoneName: string) {
    return this.httpClient.get(`http://localhost:8080/agent-tracking/api/data/zones/${zoneName}/subzones/names`)
  }
}
