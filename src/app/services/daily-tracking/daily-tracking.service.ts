import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {

  constructor(private httpClient: HttpClient) { }

  getAllAgentDTOs(){

  }

  getZones() {
    return this.httpClient.get ("http://localhost:8080/agent-tracking/api/data/zones");
  }
  getSubZones( subZoneName:string){
    return this.httpClient.get ("http://localhost:8080/agent-tracking/agent-tracking/api/data/zones/+subZoneName"+"/subzones/names");
  }

  getAllAgentTableDTI(){
    return this.httpClient.get ("http://localhost:8080/agent-tracking/api/data/agents");
  }

  getDailyTrackingData(){
    const today = new Date().toISOString().split('T')[0];
    return this.httpClient.get(`http://localhost:8080/agent-tracking/api/data/all-snapshots?snapshotDate=${today}`);
  }



}
