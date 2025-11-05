# n8n 二维码节点使用说明

本文档详细介绍如何使用n8n二维码节点包中的三个核心节点。

## 1. QRCodeGenerator 节点

### 功能概述
生成二维码图像，支持多种输入类型和输出格式。

### 配置参数

#### 基础配置
- **Input Type**: 选择输入类型（Text 或 JSON）
- **Text**: 要编码的文本或URL
- **JSON Data**: 要编码的JSON数据
- **Output Format**: 输出格式（PNG、SVG、Base64、文件路径）
- **Size**: 二维码大小（像素）
- **Foreground Color**: 前景色
- **Background Color**: 背景色
- **Margin**: 边距大小
- **Error Correction Level**: 错误纠正级别

#### 高级配置
- **Add Logo**: 是否添加中心Logo
- **Logo Path**: Logo图片路径
- **Logo Size Percentage**: Logo大小占比
- **Quality**: 图像质量

### 输出结果
- `qrCode`: 生成的二维码（Base64或SVG）
- `filePath`: 保存的文件路径（如果选择文件输出）
- `format`: 输出格式
- `size`: 二维码大小
- `contentType`: 内容类型
- `creationTime`: 创建时间

## 2. QRCodeReader 节点

### 功能概述
从图像中读取和解析二维码内容。

### 配置参数

#### 输入配置
- **Input Source**: 输入源（文件路径、URL、Base64）
- **File Path**: 图像文件路径
- **URL**: 图像URL
- **Base64 Data**: Base64编码的图像数据

#### 高级配置
- **Try Parse as JSON**: 是否尝试将内容解析为JSON
- **Max Width**: 图像处理的最大宽度
- **Enhance Image**: 是否增强图像以提高检测率

### 输出结果
- `content`: 二维码内容
- `contentType`: 内容类型（text或json）
- `analyzedType`: 分析的内容类型（url、email、phone、vcard、wifi、n8n-app-secret等）
- `parsedContent`: 解析后的JSON对象（如果内容是JSON）
- `location`: 二维码在图像中的位置
- `timestamp`: 解析时间

## 3. 应用秘钥管理器功能

### 功能概述
提供与n8n data table API集成的指引，用于存储和管理应用秘钥信息。

### 重要说明
- 该功能提供与n8n data table API集成的指引
- 用户可以通过HTTP Request节点与data table API交互，实现秘钥的创建、删除和查询操作

### 配置参数

#### 输入配置
- **Input Source**: 输入源（文件路径、URL、Base64、已解析文本）

#### 安全配置
- **Secret Prefix**: 应用秘钥标识前缀（建议：n8n-app-secret:）
- **Encryption Key**: 用于解密的密钥（可选）
- **Verify Signature**: 是否验证数字签名
- **Max Expiry Time**: 二维码最大有效期（分钟）

#### 操作配置
- **Replace Existing Secrets**: 是否允许替换现有应用秘钥
- **Require Confirmation**: 是否需要确认（概念性，实际使用时需在后续节点中实现）
- **Detailed Logging**: 是否记录详细日志

### 输出结果
- `success`: 操作是否成功
- `action`: 执行的操作（create或update）
- `secretName`: 应用秘钥名称
- `secretType`: 应用秘钥类型
- `timestamp`: 操作时间
- `message`: 操作消息

### 使用流程示例

1. 使用QRCodeReader节点解析包含应用秘钥信息的二维码
2. 连接到HTTP Request节点，配置如下：
   - URL: n8n data table API地址
   - Method: 根据需要选择POST或DELETE
   - Body: 包含应用秘钥信息的JSON数据
3. 对于更新操作：
   - 可以直接使用PUT方法更新现有记录
   - 或先DELETE再POST创建新记录

## 应用秘钥二维码格式

包含应用秘钥信息的二维码应遵循以下格式：

```
n8n-app-secret:{"type":"n8n-app-secret","version":"1.0","appName":"应用名称","secretName":"秘钥名称","secretType":"秘钥类型","secretValue":"秘钥值","version":"秘钥版本","timestamp":1623456789000,"nonce":"随机字符串"}
```

**字段说明：**
- **type**: 固定为 "n8n-app-secret"，标识这是应用秘钥二维码
- **version**: 格式版本号，当前为 "1.0"
- **appName**: 应用名称，必填
- **secretName**: 秘钥名称，必填，用于标识具体的秘钥
- **secretType**: 秘钥类型，必填（API_KEY/ACCESS_TOKEN/CREDENTIAL等）
- **secretValue**: 秘钥实际值，必填
- **secretVersion**: 秘钥版本号，用于版本控制
- **timestamp**: 时间戳（毫秒），用于验证二维码的时效性
- **nonce**: 随机字符串，用于防止重放攻击

**节点处理逻辑：**
节点将根据以下规则自动判断操作类型：
1. 检查data table中是否存在具有相同**appName**、**secretName**、**secretType**和**version**的记录
2. 如果存在相同记录，则执行更新操作，更新secretValue和updatedAt字段
3. 如果不存在相同记录，则执行创建操作，添加一条新记录

## 安全最佳实践

1. 始终设置适当的过期时间
2. 对于敏感凭据，使用加密功能
3. 启用签名验证以确保数据完整性
4. 在生产环境中，实施适当的访问控制
5. 记录所有应用秘钥操作的审计日志

## 故障排除

### 常见问题

1. **二维码无法解析**
   - 确保图像清晰
   - 尝试启用"Enhance Image"选项
   - 检查图像是否包含有效的二维码

2. **应用秘钥操作失败**
   - 检查用户是否有访问data table API的权限
   - 确保应用秘钥名称和类型正确
   - 检查HTTP请求配置是否正确

3. **加密错误**
   - 确保加密密钥正确
   - 检查加密数据格式是否正确

如有其他问题，请查看详细日志获取更多信息。