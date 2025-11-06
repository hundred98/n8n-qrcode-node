# n8n QR Code 节点包
[English Documentation](README.md)
## 功能概述

这是一个n8n社区节点包，提供完整的二维码生成和解析功能。包含三个主要节点：

- **QR Code Generator** - 二维码生成器
- **QR Code Reader** - 二维码读取器  
- **QR Code Data Bridge** - (二维码数据桥)

## 安装说明

### 方法一：使用N8N_CUSTOM_EXTENSIONS环境变量

1. 确保项目已安装依赖：
```bash
cd n8n-nodes-qrcode
npm install
```

2. 启动n8n时设置环境变量：
```bash
# Windows PowerShell
$env:N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-qrcode"; n8n start

# Linux/Mac
N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-qrcode" n8n start
```

### 方法二：直接安装到n8n

```bash
# 在n8n项目目录中
cd /path/to/n8n
npm install /path/to/n8n-nodes-qrcode
```

## 节点功能详情

### 1. QR Code Generator (二维码生成器)

**功能**：将文本、JSON数据转换为二维码

**输入参数**：
- **Input Type**：输入类型（Text 或 JSON）
- **Text**：当Input Type为Text时，要编码的文本内容
- **JSON Data**：当Input Type为JSON时，要编码的JSON数据
- **Output Format**：输出格式（PNG、JPG或SVG）
- **Size**：二维码尺寸（32-2048像素）
- **Error Correction Level**：错误纠正级别（L-低7%、M-中15%、Q-较高25%、H-高30%）

**输出**：包含二维码数据的JSON对象和对应的二进制图像数据

#### 二期及以后功能（尚未实现）
- **颜色定制**：前景色和背景色设置
- **边距调整**：设置二维码四周空白区域大小
- **Logo嵌入**：在二维码中心添加品牌Logo或图像
- **二维码样式**：圆形图案点、方形图案点、自定义角标样式
- **图片质量设置**：控制输出图片的压缩质量

### 2. QR Code Reader (二维码读取器)

**功能**：从图像中读取和解析二维码内容

**输入参数**：
- **Data Source**：数据源类型（Binary Field 或 URL）
- **Input Binary Field Name**：当Data Source为Binary Field时，包含输入图像的二进制字段名称
- **Image URL**：当Data Source为URL时，包含二维码的图像URL

**输出**：包含解析结果的JSON对象，包含success状态和data字段（如果解析成功）或error字段（如果解析失败）

#### 二期及以后功能（尚未实现）
- **批量处理**：一次处理包含多个二维码的图片
- **内容类型识别**：自动识别二维码中的数据类型（URL、文本、联系人信息等）

### 3. QR Code Data Bridge (二维码数据桥)

**功能**：通过二维码传输任意数据

**输入参数**：一张二维码图片，包含以下内容：
- **qrKey**: 用户填写在节点的数据，只有和节点的数据匹配，才输出成功和下面数据，必填
- 其他数据，传输的有效键值对，键值对的键和值可以自定义，比如：
  "myName": "My Name",
  "myEmail": "my@email.com",
  "myPhone": "1234567890",
  "myAddress": "123 Main St, Anytown, CA 12345",
  "myWebsite": "https://www.example.com"

例如输入的二维码是Text内容如下：
```
{
  "qrKey": "*********",
  "myName": "My Name",
  "myEmail": "my@email.com",
  "myPhone": "1234567890",
  "myAddress": "123 Main St, Anytown, CA 12345",
  "myWebsite": "https://www.example.com"
}

```

**输出**：操作结果success和键值对的JSON对象

#### 二期及以后功能（尚未实现）
- **内容加密/解密**：对二维码内容进行加密处理
- **数据验证**：检查解析后的数据是否符合预期格式
- **二维码有效性检查**：验证生成的二维码是否可被正确扫描
- **二维码对比**：比较两个二维码是否包含相同内容
- **版本和类型管理**：秘钥版本和类型（API_KEY/ACCESS_TOKEN/CREDENTIAL等）存储与管理

## 使用场景示例

### 场景1：安全传输API密钥

企业IT管理员需要将API密钥安全地分发给开发团队成员：

1. 管理员使用QR Code Generator节点生成包含API密钥的二维码：
   ```json
   {
     "qrKey": "admin2023",
     "apiKey": "sk-xxxxxxxxxxxxxxx",
     "service": "cloud-storage",
     "permissions": "read-write",
     "expiry": "2023-12-31"
   }
   ```

2. 开发人员使用QR Code Data Bridge节点读取二维码，并在节点中输入相同的qrKey进行验证：
   - 只有当qrKey匹配时，API密钥才会被输出
   - 提供了额外的安全层，防止未经授权的访问

### 场景2：员工信息录入

HR部门需要快速将新员工信息录入系统：

1. HR使用QR Code Generator生成包含员工基本信息的二维码：
   ```json
   {
     "employeeId": "EMP001234",
     "name": "张三",
     "department": "技术部",
     "position": "前端工程师",
     "email": "zhangsan@company.com",
     "startDate": "2023-06-01"
   }
   ```

2. IT部门使用QR Code Reader节点扫描二维码，自动填充员工系统账户信息

### 场景3：设备配置部署

运维团队需要将网络配置部署到多台设备：

1. 运维工程师使用QR Code Generator创建包含网络配置的二维码：
   ```json
   {
     "network": {
       "ssid": "CompanyWiFi",
       "password": "securePassword123",
       "security": "WPA2",
       "ipRange": "192.168.1.100-200"
     },
     "dns": ["8.8.8.8", "8.8.4.4"]
   }
   ```

2. 现场技术人员使用手机或平板扫描二维码，获取配置信息并应用到设备

### 场景4：会议信息共享

行政人员需要分享会议室预订信息：

1. 行政人员使用QR Code Generator生成会议信息二维码：
   ```json
   {
     "room": "A会议室",
     "date": "2023-06-15",
     "time": "14:00-16:00",
     "topic": "季度业务回顾",
     "participants": ["张三", "李四", "王五"],
     "materials": "https://drive.company.com/meeting-docs"
   }
   ```

2. 参会人员扫描二维码即可获取完整会议信息

### 场景5：产品溯源追踪

制造业企业需要追踪产品供应链信息：

1. 生产部门使用QR Code Generator为每批产品生成溯源二维码：
   ```json
   {
     "batchId": "BATCH20230601A",
     "productName": "智能手表",
     "productionDate": "2023-06-01",
     "components": {
       "screen": "OLED-2023",
       "battery": "Li-Ion-3000mAh",
       "processor": "Snapdragon-888"
     },
     "qualityCert": "ISO9001-2023"
   }
   ```

2. 质检、物流、销售各环节通过扫描二维码获取产品完整信息

## 后续扩展可能性

1. **动态二维码**：支持生成指向可更新内容的二维码
2. **二维码美化**：提供更多的设计选项和自定义样式
3. **数据分析**：添加扫描统计和分析功能（需外部服务）
4. **其他码制支持**：扩展支持条形码等其他码制
