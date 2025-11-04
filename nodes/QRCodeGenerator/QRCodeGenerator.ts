import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export class QRCodeGenerator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'QR Code Generator',
    name: 'qrcodeGenerator',
    icon: 'file:qrcode.svg',
    group: ['transform'],
    version: 1,
    description: 'Generate QR codes with various customization options',
    defaults: {
      name: 'QR Code Generator',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Input Type',
        name: 'inputType',
        type: 'options',
        options: [
          {
            name: 'Text',
            value: 'text',
          },
          {
            name: 'JSON',
            value: 'json',
          },
        ],
        default: 'text',
        description: 'Choose the type of input data',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            inputType: ['text'],
          },
        },
        description: 'The text or URL to encode in the QR code',
      },
      {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        required: true,
        default: '{}',
        displayOptions: {
          show: {
            inputType: ['json'],
          },
        },
        description: 'The JSON data to encode in the QR code',
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'PNG',
            value: 'png',
          },
          {
            name: 'SVG',
            value: 'svg',
          },
          {
            name: 'Base64',
            value: 'base64',
          },
          {
            name: 'File Path',
            value: 'filePath',
          },
        ],
        default: 'png',
        description: 'Choose the output format for the QR code',
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'number',
        default: 256,
        description: 'Size of the QR code in pixels',
        typeOptions: {
          minValue: 32,
          maxValue: 2048,
        },
      },
      {
        displayName: 'Foreground Color',
        name: 'foregroundColor',
        type: 'color',
        default: '#000000',
        description: 'Foreground color of the QR code',
      },
      {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'color',
        default: '#ffffff',
        description: 'Background color of the QR code',
      },
      {
        displayName: 'Margin',
        name: 'margin',
        type: 'number',
        default: 4,
        description: 'Margin around the QR code',
        typeOptions: {
          minValue: 0,
          maxValue: 20,
        },
      },
      {
        displayName: 'Error Correction Level',
        name: 'errorCorrectionLevel',
        type: 'options',
        options: [
          {
            name: 'L (Low - 7%)',
            value: 'L',
          },
          {
            name: 'M (Medium - 15%)',
            value: 'M',
          },
          {
            name: 'Q (Quartile - 25%)',
            value: 'Q',
          },
          {
            name: 'H (High - 30%)',
            value: 'H',
          },
        ],
        default: 'M',
        description: 'Error correction level',
      },
      {
        displayName: 'File Path',
        name: 'filePath',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            outputFormat: ['filePath'],
          },
        },
        description: 'Path to save the QR code image file',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const inputType = this.getNodeParameter('inputType', itemIndex) as string;
        const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
        const size = this.getNodeParameter('size', itemIndex) as number;
        const margin = this.getNodeParameter('margin', itemIndex) as number;
        const errorCorrectionLevel = this.getNodeParameter('errorCorrectionLevel', itemIndex) as string;
        const foregroundColor = this.getNodeParameter('foregroundColor', itemIndex) as string;
        const backgroundColor = this.getNodeParameter('backgroundColor', itemIndex) as string;

        let dataToEncode: string;
        if (inputType === 'text') {
          dataToEncode = this.getNodeParameter('text', itemIndex) as string;
        } else {
          const jsonData = this.getNodeParameter('jsonData', itemIndex) as string;
          dataToEncode = jsonData;
        }

        const qrOptions = {
          width: size,
          margin: margin,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: errorCorrectionLevel as any,
        };

        let result: any = {};

        if (outputFormat === 'base64') {
          const base64Data = await QRCode.toDataURL(dataToEncode, qrOptions);
          result.qrCode = base64Data;
        } else if (outputFormat === 'svg') {
          const svgData = await QRCode.toString(dataToEncode, {
            ...qrOptions,
            type: 'svg',
          });
          result.qrCode = svgData;
        } else if (outputFormat === 'filePath') {
          const filePath = this.getNodeParameter('filePath', itemIndex) as string;
          
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          await QRCode.toFile(filePath, dataToEncode, qrOptions);
          result.filePath = filePath;
          result.qrCode = fs.readFileSync(filePath, 'base64');
        } else {
          const base64Data = await QRCode.toDataURL(dataToEncode, {
            ...qrOptions,
            type: 'image/png' as any,
          });
          result.qrCode = base64Data;
        }

        result.format = outputFormat;
        result.size = size;
        result.contentType = inputType;
        result.creationTime = new Date().toISOString();

        returnData.push({
          json: {
            ...(items[itemIndex]?.json || {}),
            ...result,
          },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
      }
    }

    return [returnData];
  }
}