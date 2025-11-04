const { INodeType, INodeTypeDescription } = require('n8n-workflow');
const QRCode = require('qrcode');

class QRCodeNode {
    constructor() {}
    
    description = {
        displayName: 'QR Code',
        name: 'qrcode',
        icon: 'file:qrcode.svg',
        group: ['transform'],
        version: 1,
        description: 'Generate and read QR codes with various options',
        defaults: {
            name: 'QR Code'
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
                        name: 'Generate QR Code',
                        value: 'generate',
                        description: 'Generate a QR code from text or data'
                    },
                    {
                        name: 'Read QR Code',
                        value: 'read',
                        description: 'Read and decode QR code from image'
                    },
                    {
                        name: 'Manage Credentials',
                        value: 'credentials',
                        description: 'Manage QR code credentials'
                    }
                ],
                default: 'generate',
                description: 'Select the QR code operation'
            },
            {
                displayName: 'Input Type',
                name: 'inputType',
                type: 'options',
                options: [
                    { name: 'Text', value: 'text' },
                    { name: 'JSON', value: 'json' }
                ],
                default: 'text',
                displayOptions: {
                    show: {
                        operation: ['generate']
                    }
                },
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
                        operation: ['generate'],
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
                        operation: ['generate'],
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
                    { name: 'Base64', value: 'base64' }
                ],
                default: 'png',
                displayOptions: {
                    show: {
                        operation: ['generate']
                    }
                },
                description: 'Choose the output format for the QR code'
            },
            {
                displayName: 'Size',
                name: 'size',
                type: 'number',
                default: 256,
                displayOptions: {
                    show: {
                        operation: ['generate']
                    }
                },
                description: 'Size of the QR code in pixels',
                minValue: 32,
                maxValue: 2048
            }
        ]
    };

    async execute() {
        const items = this.getInputData();
        const operation = this.getNodeParameter('operation', 0);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            if (operation === 'generate') {
                const inputType = this.getNodeParameter('inputType', i);
                const outputFormat = this.getNodeParameter('outputFormat', i);
                const size = this.getNodeParameter('size', i);
                
                let data;
                if (inputType === 'text') {
                    data = this.getNodeParameter('text', i);
                } else {
                    data = JSON.stringify(this.getNodeParameter('jsonData', i));
                }

                try {
                    const options = {
                        width: size,
                        height: size
                    };

                    let qrCode;
                    if (outputFormat === 'png') {
                        qrCode = await QRCode.toDataURL(data, options);
                    } else if (outputFormat === 'svg') {
                        qrCode = await QRCode.toString(data, { type: 'svg', ...options });
                    } else {
                        qrCode = await QRCode.toDataURL(data, options);
                    }

                    item.json.qrCode = qrCode;
                    item.json.format = outputFormat;
                    item.json.size = size;
                    item.json.data = data;

                } catch (error) {
                    throw new Error(`Failed to generate QR code: ${error.message}`);
                }
            }
        }

        return this.prepareOutputData(items);
    }
}

module.exports = {
    node: QRCodeNode
};