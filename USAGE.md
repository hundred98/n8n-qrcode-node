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
- `analyzedType`: 分析的内容类型（url、email、phone、vcard、wifi、n8n-credential等）
- `parsedContent`: 解析后的JSON对象（如果内容是JSON）
- `location`: 二维码在图像中的位置
- `timestamp`: 解析时间

## 3. QRCodeCredentialManager 节点

### 功能概述
安全地从二维码中读取凭据信息并准备存储到n8n凭据系统。

### 重要说明
- 该节点本身不直接创建或更新n8n凭据
- 需要将该节点的输出连接到**n8n节点**（设置resource参数为"credential"）来执行实际的凭据操作
- 由于n8n API限制，更新凭据需要先删除再创建

### 配置参数

#### 输入配置
- **Input Source**: 输入源（文件路径、URL、Base64、已解析文本）

#### 安全配置
- **Credential Prefix**: 凭据标识前缀（默认：n8n-credential:）
- **Encryption Key**: 用于解密的密钥（可选）
- **Verify Signature**: 是否验证数字签名
- **Max Expiry Time**: 二维码最大有效期（分钟）

#### 操作配置
- **Replace Existing Credentials**: 是否允许替换现有凭据
- **Require Confirmation**: 是否需要确认（概念性，实际使用时需在后续节点中实现）
- **Detailed Logging**: 是否记录详细日志

### 输出结果
- `success`: 操作是否成功
- `action`: 执行的操作（create或update）
- `credentialName`: 凭据名称
- `credentialType`: 凭据类型
- `timestamp`: 操作时间
- `message`: 操作消息

### 使用流程示例

1. 使用QRCodeReader或QRCodeCredentialManager解析包含凭据的二维码
2. 连接到n8n节点，配置如下：
   - Resource: credential
   - Operation: 根据需要选择create或delete
3. 对于更新操作：
   - 先使用delete操作删除现有凭据
   - 再使用create操作创建新凭据

## 凭据二维码格式

包含凭据信息的二维码应遵循以下格式：

```
n8n-credential:{"type":"n8n-credential","version":"1.0","credentialName":"myApiCredential","credentialType":"apiKey","data":{"apiKey":"..."},"timestamp":1623456789000,"nonce":"random-string"}
```

## 安全最佳实践

1. 始终设置适当的过期时间
2. 对于敏感凭据，使用加密功能
3. 启用签名验证以确保数据完整性
4. 在生产环境中，实施适当的访问控制
5. 记录所有凭据操作的审计日志

## 故障排除

### 常见问题

1. **二维码无法解析**
   - 确保图像清晰
   - 尝试启用"Enhance Image"选项
   - 检查图像是否包含有效的二维码

2. **凭据操作失败**
   - 检查用户是否有创建/删除凭据的权限
   - 确保凭据名称和类型正确
   - 对于更新操作，确保先删除再创建的流程正确实现

3. **加密错误**
   - 确保加密密钥正确
   - 检查加密数据格式是否正确

如有其他问题，请查看详细日志获取更多信息。