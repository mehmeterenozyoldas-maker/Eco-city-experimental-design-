export interface SimulationState {
  windSpeed: number; // 0 to 100
  sunIntensity: number; // 0 to 100 (represents time of day/cloud cover)
  totalDemand: number; // Fixed baseline for the city
}

export enum EnergyType {
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  GRID = 'GRID'
}

export interface EnergyDataPoint {
  time: string;
  solar: number;
  wind: number;
  consumption: number;
}
