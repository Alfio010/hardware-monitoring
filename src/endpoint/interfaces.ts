export interface Coordinates {
  x: Date[];
  y: number[];
}

export interface IHw {
  hwName: string;
  os: string;
  cpu?: string;
  gpu?: string;
}

export interface IHwStatistic {
  hwInfoId: number;
  cpuUsage: number;
  cpuTemperature: number;
  gpuUsage?: number;
  programInUse?: string;
}
