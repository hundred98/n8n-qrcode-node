import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class QRCodeCredentialManager implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'QR Code Credential Manager',
    name: 'qrcodeCredentialManager',
    icon: 'file:qrcode.svg',
    group: ['transform'],
    version: 1,
    description: 'Manage and generate QR codes for credentials and authentication',
    defaults: {
      name: 'QR Code Credential Manager',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Generate Credential QR',
            value: 'generate',
          },
          {
            name: 'Validate Credential',
            value: 'validate',
          },
          {
            name: 'Parse Credential Data',
            value: 'parse',
          },
        ],
        default: 'generate',
        description: 'Select the credential management operation',
      },
      {
        displayName: 'Credential Type',
        name: 'credentialType',
        type: 'options',
        options: [
          {
            name: 'WiFi',
            value: 'wifi',
          },
          {
            name: 'Contact',
            value: 'contact',
          },
          {
            name: 'Event',
            value: 'event',
          },
          {
            name: 'URL',
            value: 'url',
          },
          {
            name: 'Text',
            value: 'text',
          },
          {
            name: 'Custom JSON',
            value: 'json',
          },
        ],
        default: 'wifi',
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
        description: 'Type of credential to generate',
      },
      {
        displayName: 'WiFi Settings',
        name: 'wifiSettings',
        type: 'collection',
        placeholder: 'Add WiFi Setting',
        default: {},
        displayOptions: {
          show: {
            operation: ['generate'],
            credentialType: ['wifi'],
          },
        },
        options: [
          {
            displayName: 'SSID',
            name: 'ssid',
            type: 'string',
            required: true,
            default: '',
            description: 'WiFi network name',
          },
          {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            typeOptions: {
              password: true,
            },
            default: '',
            description: 'WiFi password',
          },
          {
            displayName: 'Encryption',
            name: 'encryption',
            type: 'options',
            options: [
              {
                name: 'WPA/WPA2',
                value: 'WPA',
              },
              {
                name: 'WEP',
                value: 'WEP',
              },
              {
                name: 'None',
                value: 'nopass',
              },
            ],
            default: 'WPA',
            description: 'WiFi encryption type',
          },
          {
            displayName: 'Hidden',
            name: 'hidden',
            type: 'boolean',
            default: false,
            description: 'Whether the network is hidden',
          },
        ],
      },
      {
        displayName: 'Contact Settings',
        name: 'contactSettings',
        type: 'collection',
        placeholder: 'Add Contact Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['generate'],
            credentialType: ['contact'],
          },
        },
        options: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Contact name',
          },
          {
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
            description: 'Phone number',
          },
          {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            default: '',
            description: 'Email address',
          },
          {
            displayName: 'Address',
            name: 'address',
            type: 'string',
            default: '',
            description: 'Physical address',
          },
          {
            displayName: 'Website',
            name: 'website',
            type: 'string',
            default: '',
            description: 'Website URL',
          },
        ],
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: ['generate'],
            credentialType: ['url'],
          },
        },
        description: 'URL to encode in QR code',
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
            operation: ['generate'],
            credentialType: ['text'],
          },
        },
        description: 'Text to encode in QR code',
      },
      {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        required: true,
        default: '{}',
        displayOptions: {
          show: {
            operation: ['generate'],
            credentialType: ['json'],
          },
        },
        description: 'JSON data to encode in QR code',
      },
      {
        displayName: 'QR Code Data',
        name: 'qrCodeData',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: ['validate', 'parse'],
          },
        },
        description: 'QR code data to validate or parse',
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'JSON',
            value: 'json',
          },
          {
            name: 'Formatted Text',
            value: 'text',
          },
        ],
        default: 'json',
        displayOptions: {
          show: {
            operation: ['validate', 'parse'],
          },
        },
        description: 'Format for the output data',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const operation = this.getNodeParameter('operation', itemIndex) as string;
        const result: any = {
          operation,
          timestamp: new Date().toISOString(),
        };

        if (operation === 'generate') {
          const credentialType = this.getNodeParameter('credentialType', itemIndex) as string;
          result.credentialType = credentialType;

          switch (credentialType) {
            case 'wifi': {
              const wifiSettings = this.getNodeParameter('wifiSettings', itemIndex) as any;
              result.data = {
                type: 'wifi',
                ssid: wifiSettings.ssid || '',
                password: wifiSettings.password || '',
                encryption: wifiSettings.encryption || 'WPA',
                hidden: wifiSettings.hidden || false,
              };
              result.qrContent = `WIFI:S:${wifiSettings.ssid};T:${wifiSettings.encryption};P:${wifiSettings.password};H:${wifiSettings.hidden};;`;
              break;
            }
            case 'contact': {
              const contactSettings = this.getNodeParameter('contactSettings', itemIndex) as any;
              result.data = {
                type: 'contact',
                name: contactSettings.name || '',
                phone: contactSettings.phone || '',
                email: contactSettings.email || '',
                address: contactSettings.address || '',
                website: contactSettings.website || '',
              };
              result.qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactSettings.name}\nTEL:${contactSettings.phone}\nEMAIL:${contactSettings.email}\nADR:${contactSettings.address}\nURL:${contactSettings.website}\nEND:VCARD`;
              break;
            }
            case 'url': {
              const url = this.getNodeParameter('url', itemIndex) as string;
              result.data = { type: 'url', url };
              result.qrContent = url;
              break;
            }
            case 'text': {
              const text = this.getNodeParameter('text', itemIndex) as string;
              result.data = { type: 'text', content: text };
              result.qrContent = text;
              break;
            }
            case 'json': {
              const jsonData = this.getNodeParameter('jsonData', itemIndex) as string;
              result.data = { type: 'json', content: JSON.parse(jsonData) };
              result.qrContent = jsonData;
              break;
            }
          }
        } else if (operation === 'validate' || operation === 'parse') {
          const qrCodeData = this.getNodeParameter('qrCodeData', itemIndex) as string;
          const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
          
          result.inputData = qrCodeData;
          
          // Simple validation/parsing logic
          try {
            // Try to parse as JSON
            const parsedData = JSON.parse(qrCodeData);
            result.parsedData = parsedData;
            result.isValid = true;
            result.dataType = 'json';
          } catch {
            // Check for common QR code formats
            if (qrCodeData.startsWith('WIFI:')) {
              result.dataType = 'wifi';
              result.isValid = true;
            } else if (qrCodeData.startsWith('BEGIN:VCARD')) {
              result.dataType = 'vcard';
              result.isValid = true;
            } else if (qrCodeData.startsWith('http://') || qrCodeData.startsWith('https://')) {
              result.dataType = 'url';
              result.isValid = true;
            } else {
              result.dataType = 'text';
              result.isValid = true;
            }
          }

          if (outputFormat === 'text') {
            result.formattedOutput = this.formatOutput(result);
          }
        }

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

  private formatOutput(result: any): string {
    if (result.operation === 'validate') {
      return `QR Code Validation Result:\n- Data Type: ${result.dataType}\n- Valid: ${result.isValid}\n- Timestamp: ${result.timestamp}`;
    } else if (result.operation === 'parse') {
      return `QR Code Parsed Data:\n- Type: ${result.dataType}\n- Content: ${JSON.stringify(result.parsedData || result.inputData, null, 2)}`;
    }
    return JSON.stringify(result, null, 2);
  }
}