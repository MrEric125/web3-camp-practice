// import { NextRequest, NextResponse } from 'next/server';

// export interface HourlyVolumeData {
//   date: string;
//   hour: number;
//   volume: number;
// }

// export interface TradeVolumeResponse {
//   success: boolean;
//   data: HourlyVolumeData[];
//   message?: string;
// }

// /**
//  * 获取交易量数据
//  * GET /api/trade/volume?days=7&startDate=2024-01-01
//  */
// export async function GET(request: NextRequest) {
//   try {
//     console.log("调用getfangfa")
//     const { searchParams } = new URL(request.url);
//     const days = parseInt(searchParams.get('days') || '7');
//     const startDate = searchParams.get('startDate');

//     // 验证参数
//     if (days < 1 || days > 365) {
//       return NextResponse.json({
//         success: false,
//         message: '天数参数无效，必须在1-365之间'
//       } as TradeVolumeResponse, { status: 400 });
//     }

//     // 生成指定天数的日期
//     const generateDates = (days: number, startDate?: string | null): string[] => {
//       const start = startDate ? new Date(startDate) : new Date();
//       const dates = [];
//       for (let i = 0; i < days; i++) {
//         const date = new Date(start);
//         date.setDate(start.getDate() - (days - 1 - i)); // 逆序生成，从最早到最晚
//         dates.push(date.toISOString().split('T')[0]);
//       }
//       return dates;
//     };

//     // 生成24小时的交易量数据
//     const generateHourlyData = (date: string): HourlyVolumeData[] => {
//       const dateObj = new Date(date);
//       const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

//       return Array.from({ length: 24 }, (_, hour) => {
//         // 模拟不同小时的交易量模式
//         let baseVolume = 1000000; // 基础交易量

//         // 周末交易量较低 (0 = Sunday, 6 = Saturday)
//         if (dayOfWeek === 0 || dayOfWeek === 6) {
//           baseVolume *= 0.6;
//         }

//         // 亚洲交易时段 (0-8点) 相对活跃
//         if (hour >= 0 && hour <= 8) {
//           baseVolume *= 1.2;
//         }

//         // 欧洲交易时段 (8-16点) 最活跃
//         if (hour >= 8 && hour <= 16) {
//           baseVolume *= 1.8;
//         }

//         // 美洲交易时段 (16-24点) 活跃度中等
//         if (hour >= 16 && hour <= 24) {
//           baseVolume *= 1.4;
//         }

//         // 添加随机波动 (±30%)
//         const randomFactor = 0.7 + Math.random() * 0.6;
//         const volume = Math.round(baseVolume * randomFactor);

//         return {
//           date,
//           hour,
//           volume
//         };
//       });
//     };

//     // 生成数据
//     const dates = generateDates(days, startDate);
//     const data = dates.flatMap(date => generateHourlyData(date));

//     return NextResponse.json({
//       success: true,
//       data
//     } as TradeVolumeResponse);

//   } catch (error) {
//     console.error('获取交易量数据失败:', error);
//     return NextResponse.json({
//       success: false,
//       message: '服务器内部错误'
//     } as TradeVolumeResponse, { status: 500 });
//   }
// }
