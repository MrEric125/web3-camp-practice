'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HourlyVolumeData {
  date: string;
  hour: number;
  volume: number;
}

interface TradeVolumeResponse {
  code: number;
  message: string;
  result: HourlyVolumeData[];
}

export function TradeVolumeChart() {
  const [daysToShow, setDaysToShow] = useState('7');
  const [chartData, setChartData] = useState<HourlyVolumeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 计算startDate - 根据选择的天数计算起始日期
  const getStartDate = (days: number): string => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1); // 从今天往前推days-1天
    return startDate.toISOString().split('T')[0];
  };

  // 生成指定天数的日期标签
  const generateDates = (days: number): string[] => {
    const today = new Date();
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
    }
    return dates;
  };

  // 获取API数据
  const fetchVolumeData = async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = getStartDate(days);
      const response = await fetch(`http://localhost:8088/api/trade/volume/query?startDate=${startDate}&symbol=ETHUSDT`);
      const result: TradeVolumeResponse = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '获取数据失败');
      }

      setChartData(result.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('获取交易量数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 当天数变化时重新获取数据
  useEffect(() => {
    const days = parseInt(daysToShow);
    fetchVolumeData(days);
  }, [daysToShow]);

  const maxVolume = Math.max(...chartData.map(d => d.volume));
  const minVolume = Math.min(...chartData.map(d => d.volume));

  // 获取强度等级 (1-5)
  const getIntensityLevel = (volume: number): number => {
    if (maxVolume === minVolume) return 3; // 如果所有值相同，返回中等强度
    const normalized = (volume - minVolume) / (maxVolume - minVolume);
    return Math.ceil(normalized * 5) || 1;
  };

  // 获取颜色强度
  const getColorClass = (level: number): string => {
    const colors = [
      'bg-blue-50 dark:bg-blue-950/20',
      'bg-blue-100 dark:bg-blue-900/30',
      'bg-blue-200 dark:bg-blue-800/40',
      'bg-blue-300 dark:bg-blue-700/50',
      'bg-blue-400 dark:bg-blue-600/60'
    ];
    return colors[level - 1] || colors[0];
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`;
    }
    return volume.toString();
  };

  const dates = generateDates(parseInt(daysToShow));

  // 计算标签间隔
  const getLabelInterval = (total: number, maxLabels: number = 6) => {
    return Math.max(1, Math.floor(total / maxLabels));
  };

  const dateInterval = getLabelInterval(dates.length, 6); // 横轴最多显示6个标签
  const hourInterval = getLabelInterval(24, 8); // 纵轴最多显示8个标签

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">交易量热力图</CardTitle>
          <Select value={daysToShow} onValueChange={setDaysToShow}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1天</SelectItem>
              <SelectItem value="3">3天</SelectItem>
              <SelectItem value="7">7天</SelectItem>
              <SelectItem value="14">14天</SelectItem>
              <SelectItem value="30">30天</SelectItem>
              <SelectItem value="60">60天</SelectItem>
              <SelectItem value="90">90天</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          显示过去{daysToShow}天24小时交易量分布（单位：USD）
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="w-full min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">数据加载失败</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button
                  onClick={() => fetchVolumeData(parseInt(daysToShow))}
                  className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 热力图 - 自适应容器 */}
              <div className="w-full min-h-[300px]">
                <div className="relative h-full">
                  {/* 日期标签 (横轴) */}
                  <div className="flex mb-2">
                    <div className="w-12"></div>
                    {dates.map((date, index) => {
                      const dateObj = new Date(date);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = dateObj.getDate();
                      const shouldShowLabel = index % dateInterval === 0;

                      return (
                        <div key={date} className="flex-1 text-center">
                          {shouldShowLabel && (
                            <>
                              <span className="text-xs text-muted-foreground block">
                                {dayName}
                              </span>
                              <span className="text-xs font-medium">
                                {dayNum}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 热力图网格 */}
                  <div className="relative h-full">
                    {/* 小时标签 (纵轴) - 绝对定位到正确位置 */}
                    <div className="absolute left-0 top-0 w-12 h-full z-10">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const shouldShowLabel = hour % hourInterval === 0;
                        const topPosition = `${(hour / 23) * 100}%`;

                        return shouldShowLabel ? (
                          <div
                            key={hour}
                            className="absolute right-2 transform -translate-y-1/2"
                            style={{ top: topPosition }}
                          >
                            <span className="text-xs text-muted-foreground">
                              {hour.toString().padStart(2, '0')}:00
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* 数据单元格网格 */}
                    <div className="ml-12 h-full grid gap-0" style={{ gridTemplateColumns: `repeat(${dates.length}, 1fr)`, gridTemplateRows: `repeat(24, minmax(20px, 1fr))` }}>
                      {Array.from({ length: 24 }, (_, hour) =>
                        dates.map((date) => {
                          const dataPoint = chartData.find(d => d.date === date && d.hour === hour);
                          const level = dataPoint ? getIntensityLevel(dataPoint.volume) : 1;
                          const colorClass = getColorClass(level);

                          return (
                            <div
                              key={`${date}-${hour}`}
                              className={`w-full h-full cursor-pointer transition-all hover:scale-110 hover:z-10 relative ${colorClass}`}
                              title={`${date} ${hour.toString().padStart(2, '0')}:00 - 交易量: ${formatVolume(dataPoint?.volume || 0)}`}
                            />
                          );
                        })
                      ).flat()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t">
                <span className="text-sm text-muted-foreground mr-2">交易量强度:</span>
                {[1, 2, 3, 4, 5].map(level => (
                  <div key={level} className="flex items-center gap-1">
                    <div className={`w-4 h-4 border rounded-sm ${getColorClass(level)}`} />
                    <span className="text-xs text-muted-foreground">Lv{level}</span>
                  </div>
                ))}
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">总交易量</p>
                  <p className="text-lg font-semibold">
                    {chartData.length > 0 ? formatVolume(chartData.reduce((sum, item) => sum + item.volume, 0)) : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">日均交易量</p>
                  <p className="text-lg font-semibold">
                    {chartData.length > 0 ? formatVolume(Math.round(chartData.reduce((sum, item) => sum + item.volume, 0) / dates.length)) : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">峰值小时</p>
                  <p className="text-lg font-semibold">
                    {(() => {
                      if (chartData.length === 0) return '-';
                      const peakData = chartData.reduce((max, item) =>
                        item.volume > max.volume ? item : max
                      );
                      const dateObj = new Date(peakData.date);
                      return `${dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${peakData.hour}:00`;
                    })()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
