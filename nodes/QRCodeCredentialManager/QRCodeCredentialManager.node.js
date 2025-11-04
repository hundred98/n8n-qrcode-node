const { NodeOperationError, INodeType } = require('n8n-workflow');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class QRCodeCredentialManager extends INodeType {
  // 实现INodeType接口的description属性
  description = {
    displayName: 'QRCode Credential Manager',
    name: 'QRCodeCredentialManager',
    icon: 'file:qrcode.svg',
    group: ['QRCodeGroup'], // 关联到主节点组
    version: 1,
    description: 'Scan QR codes containing credentials and securely manage them',
    defaults: {
      name: 'QRCode Credential Manager',
      parent: 'QRCodeGroup' // 父节点组标识
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Input Source',
        name: 'inputSource',
        type: 'options',
        options: [
          { name: 'File Path', value: 'filePath' },
          { name: 'URL', value: 'url' },
          { name: 'Base64', value: 'base64' },
          { name: 'Text', value: 'text' }
        ],
        default: 'filePath',
        description: 'Choose the input source for the QR code image'
      },
      {
        displayName: 'File Path',
        name: 'filePath',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            inputSource: ['filePath']
          }
        },
        description: 'Path to the QR code image file'
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            inputSource: ['url']
          }
        },
        description: 'URL of the QR code image'
      },
      {
        displayName: 'Base64 Data',
        name: 'base64Data',
        type: 'string',
        required: true,
        default: '',
        typeOptions: {
          rows: 4
        },
        displayOptions: {
          show: {
            inputSource: ['base64']
          }
        },
        description: 'Base64 encoded QR code image data'
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        required: true,
        default: '',
        typeOptions: {
          rows: 4
        },
        displayOptions: {
          show: {
            inputSource: ['text']
          }
        },
        description: 'Text containing QR code image data'
      },
      {
        displayName: 'Credential Handling',
        name: 'credentialHandling',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Credential Type',
            name: 'credentialType',
            type: 'options',
            options: [
              { name: 'Auto Detect', value: 'auto' },
              { name: 'Basic Auth', value: 'basicAuth' },
              { name: 'API Key', value: 'apiKey' },
              { name: 'OAuth2', value: 'oauth2' },
              { name: 'Custom', value: 'custom' }
            ],
            default: 'auto',
            description: 'Select the credential type to extract'
          },
          {
            displayName: 'Output Format',
            name: 'outputFormat',
            type: 'options',
            options: [
              { name: 'JSON', value: 'json' },
              { name: 'n8n Credential Format', value: 'n8nFormat' }
            ],
            default: 'json',
            description: 'Format of the output credential data'
          },
          {
            displayName: 'Add Metadata',
            name: 'addMetadata',
            type: 'boolean',
            default: true,
            description: 'Add metadata to the output'
          }
        ]
      },
      {
        displayName: 'Advanced Options',
        name: 'advancedOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'QR Code Prefix',
            name: 'qrcodePrefix',
            type: 'string',
            default: 'n8n-credential:',
            description: 'Expected prefix in the QR code content'
          },
          {
            displayName: 'Max Image Width',
            name: 'maxWidth',
            type: 'number',
            default: 1000,
            description: 'Maximum width for image processing',
            minValue: 100,
            maxValue: 5000
          },
          {
            displayName: 'Max Image Height',
            name: 'maxHeight',
            type: 'number',
            default: 1000,
            description: 'Maximum height for image processing',
            minValue: 100,
            maxValue: 5000
          },
          {
            displayName: 'Strict Validation',
            name: 'strictValidation',
            type: 'boolean',
            default: false,
            description: 'Enable strict validation of the credential data'
          }
        ]
      }
    ]
  };

  async execute() {
    const items = this.getInputData();
    const returnData = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        // 获取输入参数
        const inputSource = this.getNodeParameter('inputSource', itemIndex);
        const credentialHandling = this.getNodeParameter('credentialHandling', itemIndex) || {};
        const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex) || {};
        
        // 读取图像数据
        let imageBuffer;
        
        switch (inputSource) {
          case 'filePath':
            const filePath = this.getNodeParameter('filePath', itemIndex);
            if (!fs.existsSync(filePath)) {
              throw new NodeOperationError(this.getNode(), `File not found: ${filePath}`, { itemIndex });
            }
            imageBuffer = fs.readFileSync(filePath);
            break;
            
          case 'url':
            const url = this.getNodeParameter('url', itemIndex);
            const https = require('https');
            const http = require('http');
            
            // 异步获取图像数据
            imageBuffer = await new Promise((resolve, reject) => {
              const client = url.startsWith('https') ? https : http;
              client.get(url, (response) => {
                const chunks = [];
                
                response.on('data', (chunk) => {
                  chunks.push(chunk);
                });
                
                response.on('end', () => {
                  resolve(Buffer.concat(chunks));
                });
                
                response.on('error', (error) => {
                  reject(error);
                });
              }).on('error', (error) => {
                reject(error);
              });
            });
            break;
            
          case 'base64':
            const base64Data = this.getNodeParameter('base64Data', itemIndex);
            // 处理可能的data URL前缀
            const cleanBase64 = base64Data.replace(/^data:image\/[^;]+;base64,/, '');
            imageBuffer = Buffer.from(cleanBase64, 'base64');
            break;
            
          case 'text':
            const text = this.getNodeParameter('text', itemIndex);
            // 处理可能的data URL前缀
            const cleanText = text.replace(/^data:image\/[^;]+;base64,/, '');
            imageBuffer = Buffer.from(cleanText, 'base64');
            break;
        }
        
        // 处理图像数据
        const imageMetadata = await sharp(imageBuffer).metadata();
        const width = Math.min(imageMetadata.width, advancedOptions.maxWidth || 1000);
        const height = Math.min(imageMetadata.height, advancedOptions.maxHeight || 1000);
        
        // 调整图像大小并转换为RGBA格式
        const resizedBuffer = await sharp(imageBuffer)
          .resize(width, height, { fit: 'inside' })
          .ensureAlpha()
          .raw()
          .toBuffer();
        
        // 解码QR码
        const decoded = jsQR(resizedBuffer, width, height);
        
        if (!decoded) {
          throw new NodeOperationError(this.getNode(), 'No QR code found in the image', { itemIndex });
        }
        
        // 获取QR码内容
        let qrContent = decoded.data;
        
        // 检查前缀
        const expectedPrefix = advancedOptions.qrcodePrefix || 'n8n-credential:';
        if (qrContent.startsWith(expectedPrefix)) {
          qrContent = qrContent.slice(expectedPrefix.length);
        } else if (advancedOptions.strictValidation) {
          throw new NodeOperationError(this.getNode(), `QR code content does not start with expected prefix: ${expectedPrefix}`, { itemIndex });
        }
        
        // 解析JSON数据
        let credentialData;
        try {
          credentialData = JSON.parse(qrContent);
        } catch (parseError) {
          throw new NodeOperationError(this.getNode(), `Failed to parse QR code content as JSON: ${parseError.message}`, { itemIndex });
        }
        
        // 根据凭证类型处理数据
        let processedCredential;
        const credentialType = credentialHandling.credentialType || 'auto';
        const outputFormat = credentialHandling.outputFormat || 'json';
        
        if (credentialType === 'auto') {
          // 自动检测凭证类型
          if (credentialData.username && credentialData.password) {
            processedCredential = this.processBasicAuth(credentialData, outputFormat);
          } else if (credentialData.apiKey) {
            processedCredential = this.processApiKey(credentialData, outputFormat);
          } else if (credentialData.accessToken || credentialData.refreshToken) {
            processedCredential = this.processOAuth2(credentialData, outputFormat);
          } else {
            processedCredential = credentialData; // 自定义凭证
          }
        } else {
          // 根据指定类型处理
          switch (credentialType) {
            case 'basicAuth':
              processedCredential = this.processBasicAuth(credentialData, outputFormat);
              break;
            case 'apiKey':
              processedCredential = this.processApiKey(credentialData, outputFormat);
              break;
            case 'oauth2':
              processedCredential = this.processOAuth2(credentialData, outputFormat);
              break;
            default:
              processedCredential = credentialData;
          }
        }
        
        // 添加元数据
        const output = {
          ...items[itemIndex].json,
          credential: processedCredential,
          rawData: decoded.data,
          credentialType: typeof processedCredential === 'object' && processedCredential.type ? processedCredential.type : credentialType,
          format: outputFormat,
          location: decoded.location ? {
            topRightCorner: decoded.location.topRightCorner,
            topLeftCorner: decoded.location.topLeftCorner,
            bottomRightCorner: decoded.location.bottomRightCorner,
            bottomLeftCorner: decoded.location.bottomLeftCorner
          } : null,
          binaryData: imageBuffer.toString('base64'),
          imageDimensions: {
            width: imageMetadata.width,
            height: imageMetadata.height
          },
          timestamp: new Date().toISOString()
        };
        
        // 如果需要添加更多元数据
        if (credentialHandling.addMetadata) {
          output.metadata = {
            source: inputSource,
            qrPrefixPresent: decoded.data.startsWith(expectedPrefix),
            validationLevel: advancedOptions.strictValidation ? 'strict' : 'relaxed',
            processingTime: new Date().toISOString()
          };
        }
        
        returnData.push({ json: output });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error, { itemIndex });
      }
    }
    
    return [returnData];
  }
  
  // 处理Basic Auth凭证
  processBasicAuth(data, format) {
    if (format === 'n8nFormat') {
      return {
        type: 'basicAuth',
        username: data.username || '',
        password: data.password || ''
      };
    }
    return {
      username: data.username || '',
      password: data.password || ''
    };
  }
  
  // 处理API Key凭证
  processApiKey(data, format) {
    if (format === 'n8nFormat') {
      return {
        type: 'apiKey',
        apiKey: data.apiKey || '',
        name: data.name || 'API Key'
      };
    }
    return {
      apiKey: data.apiKey || '',
      name: data.name || 'API Key'
    };
  }
  
  // 处理OAuth2凭证
  processOAuth2(data, format) {
    if (format === 'n8nFormat') {
      return {
        type: 'oauth2',
        accessToken: data.accessToken || '',
        refreshToken: data.refreshToken || '',
        expiresIn: data.expiresIn || 0
      };
    }
    return {
      accessToken: data.accessToken || '',
      refreshToken: data.refreshToken || '',
      expiresIn: data.expiresIn || 0
    };
  }
}

// 添加nodeType属性
QRCodeCredentialManager.nodeType = 'n8n-nodes-base.QRCodeCredentialManager';

// 导出为具有类名属性的对象
module.exports = {
  QRCodeCredentialManager
};