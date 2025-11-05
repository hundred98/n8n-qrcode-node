# n8n QR Code 节点包

## 功能概述

这是一个n8n社区节点包，提供完整的二维码生成和解析功能。包含三个主要节点：

- **QR Code Generator** - 二维码生成器
- **QR Code Reader** - 二维码读取器  
- **App Secrets Manager** - 应用秘钥管理器

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

### 3. App Secrets Manager (应用秘钥管理器)

**功能**：通过二维码和data table API管理应用秘钥，支持创建和更新应用秘钥的基本操作

**输入参数**：一张二维码图片，包含以下内容：
- **type**: 固定为 "n8n-app-secret"，标识这是应用秘钥二维码，必填
- **version**: 格式版本号，当前为 "1.0"，必填
- **appName**: 应用名称，必填
- **secretName**: 秘钥名称，必填，用于标识具体的秘钥
- **secretType**: 秘钥类型，必填（API_KEY/ACCESS_TOKEN/CREDENTIAL等）
- **secretValue**: 秘钥实际值，必填
- **secretVersion**: 秘钥版本号，用于版本控制
- **timestamp**: 时间戳（毫秒），用于验证二维码的时效性
- **nonce**: 随机字符串，用于防止重放攻击

**输出**：操作结果的JSON对象

其中Data Table表单的字段要求如下：
- id (字符串) - 应用秘钥的唯一标识符
- appName (字符串) - 应用名称
- secretName (字符串) - 秘钥名称
- secretValue (字符串) - 应用秘钥的实际值
- secretType (字符串) - 秘钥类型
- version (字符串) - 秘钥版本号
- createdAt (日期时间) - 秘钥创建时间
- updatedAt (日期时间) - 秘钥最后更新时间

#### 二期及以后功能（尚未实现）
- **内容加密/解密**：对二维码内容进行加密处理
- **数据验证**：检查解析后的数据是否符合预期格式
- **二维码有效性检查**：验证生成的二维码是否可被正确扫描
- **二维码对比**：比较两个二维码是否包含相同内容

## 使用场景示例

1. **营销自动化**：生成包含不同追踪参数的URL二维码
2. **数据共享**：将复杂数据编码为二维码以便快速传输
3. **工作流集成**：在自动化工作流中生成或解析二维码
4. **身份验证**：生成包含临时令牌的安全二维码
5. **信息采集**：扫描并解析包含结构化数据的二维码
6. **应用秘钥管理**：App Secrets Manager可作为QRCode节点的一个操作选项，用于通过n8n data table API管理应用秘钥，支持创建和更新应用秘钥的基本操作，确保应用秘钥的安全管理。

## 后续扩展可能性

1. **动态二维码**：支持生成指向可更新内容的二维码
2. **二维码美化**：提供更多的设计选项和自定义样式
3. **数据分析**：添加扫描统计和分析功能（需外部服务）
4. **其他码制支持**：扩展支持条形码等其他码制
