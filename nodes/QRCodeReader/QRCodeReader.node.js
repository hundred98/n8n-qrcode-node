const { NodeOperationError, INodeType } = require('n8n-workflow');
const fs = require('fs');
const path = require('path');
const jsQR = require('jsqr');
const sharp = require('sharp');

class QRCodeReader extends INodeType {
  // 实现INodeType接口的description属性
  description = {
    displayName: 'QRCode Reader',
    name: 'QRCodeReader',
    icon: 'file:qrcode.svg',
    group: ['QRCodeGroup'], // 关联到主节点组
    version: 1,
    description: 'Read and decode QR codes from images',
    defaults: {
      name: 'QRCode Reader',
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
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          { name: 'Raw Text', value: 'raw' },
          { name: 'JSON', value: 'json' }
        ],
        default: 'raw',
        description: 'Choose how to format the decoded output'
      },
      {
        displayName: 'Advanced Options',
        name: 'advancedOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Try to Parse JSON',
            name: 'tryParseJson',
            type: 'boolean',
            default: false,
            description: 'Attempt to parse the decoded text as JSON'
          },
          {
            displayName: 'Max Width',
            name: 'maxWidth',
            type: 'number',
            default: 1000,
            description: 'Maximum width for image processing',
            minValue: 100,
            maxValue: 5000
          },
          {
            displayName: 'Max Height',
            name: 'maxHeight',
            type: 'number',
            default: 1000,
            description: 'Maximum height for image processing',
            minValue: 100,
            maxValue: 5000
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
        const outputFormat = this.getNodeParameter('outputFormat', itemIndex);
        const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex) || {};
        
        // 读取图像数据
        let imageData;
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
        
        let result;
        
        // 处理输出格式
        if (outputFormat === 'json' || advancedOptions.tryParseJson) {
          try {
            result = JSON.parse(decoded.data);
          } catch (parseError) {
            if (outputFormat === 'json') {
              throw new NodeOperationError(this.getNode(), `Failed to parse QR code data as JSON: ${parseError.message}`, { itemIndex });
            }
            // 如果只是尝试解析JSON而不是强制要求，回退到原始文本
            result = decoded.data;
          }
        } else {
          result = decoded.data;
        }
        
        // 添加元数据
        const output = {
          ...items[itemIndex].json,
          decoded: result,
          rawData: decoded.data,
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
}

// 添加nodeType属性
QRCodeReader.nodeType = 'n8n-nodes-base.QRCodeReader';

// 导出为具有类名属性的对象
module.exports = {
  QRCodeReader
};