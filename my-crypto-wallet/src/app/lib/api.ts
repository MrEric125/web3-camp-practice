// 统一的API请求管理
export interface HourlyVolumeData {
  date: string;
  hour: number;
  volume: number;
}

export interface TradeVolumeResponse {
  code: number;
  message: string;
  result: HourlyVolumeData[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getTradeVolume(startDate: string, symbol: string = 'ETHUSDT'): Promise<TradeVolumeResponse> {
    const url = `${this.baseURL}/api/trade/volume/query?startDate=${startDate}&symbol=${symbol}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TradeVolumeResponse = await response.json();
    return data;
  }

  // 可以在这里添加更多API方法
}

// 创建API客户端实例
export const tradeApi = new ApiClient('http://localhost:8088');

// 工具函数
export const calculateStartDate = (days: number): string => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  return startDate.toISOString().split('T')[0];
};

export const generateDateLabels = (days: number): string[] => {
  const today = new Date();
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};
