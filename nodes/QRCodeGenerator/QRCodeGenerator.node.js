const { NodeOperationError, INodeExecutionData, INodeType } = require('n8n-workflow');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Buffer } = require('buffer');

class QRCodeGenerator extends INodeType {
  // 实现INodeType接口的description属性
  description = {
    displayName: 'QRCode Generator',
    name: 'QRCodeGenerator',
    icon: 'file:qrcode.svg',
    group: ['QRCodeGroup'], // 关联到主节点组
    version: 1,
    description: 'Generate QR codes with various customization options',
    defaults: {
      name: 'QRCode Generator',
      parent: 'QRCodeGroup' // 父节点组标识
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Input Type',
        name: 'inputType',
        type: 'options',
        options: [
          { name: 'Text', value: 'text' },
          { name: 'JSON', value: 'json' }
        ],
        default: 'text',
        description: 'Choose the type of input data'
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            inputType: ['text']
          }
        },
        description: 'The text or URL to encode in the QR code'
      },
      {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        required: true,
        default: {},
        displayOptions: {
          show: {
            inputType: ['json']
          }
        },
        description: 'The JSON data to encode in the QR code'
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          { name: 'PNG', value: 'png' },
          { name: 'SVG', value: 'svg' },
          { name: 'Base64', value: 'base64' },
          { name: 'File Path', value: 'filePath' }
        ],
        default: 'png',
        description: 'Choose the output format for the QR code'
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'number',
        default: 256,
        description: 'Size of the QR code in pixels',
        minValue: 32,
        maxValue: 2048
      },
      {
        displayName: 'Foreground Color',
        name: 'foregroundColor',
        type: 'string',
        default: '#000000',
        description: 'Foreground color of the QR code'
      },
      {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'string',
        default: '#ffffff',
        description: 'Background color of the QR code'
      },
      {
        displayName: 'Margin',
        name: 'margin',
        type: 'number',
        default: 4,
        description: 'Margin around the QR code',
        minValue: 0,
        maxValue: 20
      },
      {
        displayName: 'Error Correction Level',
        name: 'errorCorrectionLevel',
        type: 'options',
        options: [
          { name: 'L (Low - 7%)', value: 'L' },
          { name: 'M (Medium - 15%)', value: 'M' },
          { name: 'Q (Quartile - 25%)', value: 'Q' },
          { name: 'H (High - 30%)', value: 'H' }
        ],
        default: 'M',
        description: 'Error correction level'
      },
      {
        displayName: 'File Path',
        name: 'filePath',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            outputFormat: ['filePath']
          }
        },
        description: 'Path to save the QR code image file'
      },
      {
        displayName: 'Advanced Options',
        name: 'advancedOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Add Logo',
            name: 'addLogo',
            type: 'boolean',
            default: false,
            description: 'Add a logo to the center of the QR code'
          },
          {
            displayName: 'Logo Path',
            name: 'logoPath',
            type: 'string',
            required: true,
            default: '',
            displayOptions: {
              show: {
                addLogo: [true]
              }
            },
            description: 'Path to the logo image file'
          },
          {
            displayName: 'Logo Size Percentage',
            name: 'logoSizePercentage',
            type: 'number',
            default: 20,
            description: 'Size of the logo as a percentage of the QR code size',
            minValue: 5,
            maxValue: 30,
            displayOptions: {
              show: {
                addLogo: [true]
              }
            }
          },
          {
            displayName: 'Quality',
            name: 'quality',
            type: 'number',
            default: 0.9,
            description: 'Image quality (0-1)',
            minValue: 0,
            maxValue: 1,
            step: 0.01
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
        const inputType = this.getNodeParameter('inputType', itemIndex);
        const outputFormat = this.getNodeParameter('outputFormat', itemIndex);
        const size = this.getNodeParameter('size', itemIndex);
        const margin = this.getNodeParameter('margin', itemIndex);
        const errorCorrectionLevel = this.getNodeParameter('errorCorrectionLevel', itemIndex);
        const foregroundColor = this.getNodeParameter('foregroundColor', itemIndex);
        const backgroundColor = this.getNodeParameter('backgroundColor', itemIndex);
        const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex) || {};
        
        // 处理输入数据
        let dataToEncode;
        if (inputType === 'text') {
          dataToEncode = this.getNodeParameter('text', itemIndex);
        } else if (inputType === 'json') {
          const jsonData = this.getNodeParameter('jsonData', itemIndex);
          dataToEncode = JSON.stringify(jsonData);
        }

        // QR码选项
        const qrOptions = {
          width: size,
          margin: margin,
          color: {
            dark: foregroundColor,
            light: backgroundColor
          },
          errorCorrectionLevel: errorCorrectionLevel
        };

        let result = {};

        // 根据输出格式生成QR码
        if (outputFormat === 'base64') {
          const base64Data = await QRCode.toDataURL(dataToEncode, qrOptions);
          result.qrCode = base64Data;
        } else if (outputFormat === 'svg') {
          const svgData = await QRCode.toString(dataToEncode, {
            ...qrOptions,
            type: 'svg'
          });
          result.qrCode = svgData;
        } else if (outputFormat === 'filePath') {
          const filePath = this.getNodeParameter('filePath', itemIndex);
          
          // 确保目录存在
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // 生成QR码到文件
          await QRCode.toFile(filePath, dataToEncode, qrOptions);

          // 如果启用了Logo，添加到QR码
          if (advancedOptions.addLogo && advancedOptions.logoPath) {
            try {
              // 计算Logo大小
              const logoSize = Math.floor(size * (advancedOptions.logoSizePercentage / 100));
              
              // 将Logo合成到QR码上
              await sharp(filePath)
                .composite([{
                  input: advancedOptions.logoPath,
                  gravity: 'center',
                  blend: 'over'
                }])
                .resize(size, size)
                .png({ quality: advancedOptions.quality || 0.9 })
                .toFile(filePath);
              
              result.hasLogo = true;
            } catch (logoError) {
              console.warn('Failed to add logo to QR code:', logoError);
              // 添加Logo失败时继续执行
            }
          }

          result.filePath = filePath;
          result.qrCode = fs.readFileSync(filePath, 'base64');
        } else { // 默认PNG
          const base64Data = await QRCode.toDataURL(dataToEncode, {
            ...qrOptions,
            type: 'png'
          });
          result.qrCode = base64Data;
        }

        // 添加元数据
        result.format = outputFormat;
        result.size = size;
        result.contentType = inputType;
        result.creationTime = new Date().toISOString();

        // 添加到返回数据
        returnData.push({
          json: {
            ...items[itemIndex].json,
            ...result
          }
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message }
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error, { itemIndex });
      }
    }

    return [returnData];
  }
}

// 添加nodeType属性
QRCodeGenerator.nodeType = 'n8n-nodes-base.QRCodeGenerator';

// 导出为具有类名属性的对象
module.exports = {
  QRCodeGenerator
};