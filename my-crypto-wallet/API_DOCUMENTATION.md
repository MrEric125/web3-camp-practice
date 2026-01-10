# 交易量数据API文档

## 接口概述

交易量热力图数据接口，用于获取指定时间范围内的24小时交易量分布数据。

## 接口地址

```
GET /api/trade/volume
```

## 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| days | number | 是 | - | 要查询的天数 (1-365) |
| startDate | string | 否 | 今天 | 起始日期，格式：YYYY-MM-DD |

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "hour": 9,
      "volume": 1250000
    },
    {
      "date": "2024-01-15",
      "hour": 10,
      "volume": 1800000
    }
  ]
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

## 数据结构说明

### HourlyVolumeData

| 字段 | 类型 | 描述 |
|------|------|------|
| date | string | 日期，格式：YYYY-MM-DD |
| hour | number | 小时 (0-23) |
| volume | number | 该小时的交易量（单位：USD） |

## 使用示例

### 1. 获取7天的数据

```javascript
fetch('/api/trade/volume?days=7')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('交易量数据:', data.data);
    } else {
      console.error('获取失败:', data.message);
    }
  });
```

### 2. 获取指定起始日期的30天数据

```javascript
fetch('/api/trade/volume?days=30&startDate=2024-01-01')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 业务逻辑说明

### 数据生成规则

1. **日期范围**：从指定起始日期开始，向前推算指定天数
2. **小时分布**：每一天生成24小时的数据 (0-23点)
3. **交易量计算**：
   - 基础交易量：100万USD
   - 周末系数：0.6倍
   - 时段系数：
     - 亚洲时段 (0-8点)：1.2倍
     - 欧洲时段 (8-16点)：1.8倍
     - 美洲时段 (16-24点)：1.4倍
   - 随机波动：±30%

### 数据特点

- 模拟真实交易市场的时段活跃度差异
- 包含随机波动，使数据更真实
- 支持长期历史数据查询

## 错误码说明

| HTTP状态码 | 错误信息 | 说明 |
|------------|----------|------|
| 400 | 天数参数无效，必须在1-365之间 | days参数超出范围 |
| 500 | 服务器内部错误 | 服务器处理异常 |

## 性能考虑

- 建议缓存频繁查询的数据
- 对于大量历史数据，考虑分页返回
- API支持的最大查询范围：365天

## 版本信息

- 当前版本：1.0.0
- 最后更新：2024-01-15
