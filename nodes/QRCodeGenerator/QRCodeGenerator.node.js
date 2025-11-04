const { NodeOperationError, NodeConnectionType } = require('n8n-workflow');
const QRCode = require('qrcode');

class QRCodeGenerator {
    constructor() {
        this.description = {
            displayName: 'QR Code Generator',
            name: 'qrcodeGenerator',
            icon: 'file:qrcode.svg',
            group: ['transform'],
            version: 1,
            description: 'Generate QR codes from text or URLs',
            defaults: {
                name: 'QR Code Generator',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Text',
                    name: 'text',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'The text or URL to encode in the QR code',
                },
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'PNG Base64',
                            value: 'png',
                        },
                        {
                            name: 'SVG',
                            value: 'svg',
                        },
                    ],
                    default: 'png',
                    description: 'The format of the generated QR code',
                },
                {
                    displayName: 'Size',
                    name: 'size',
                    type: 'number',
                    default: 200,
                    description: 'The size of the QR code in pixels',
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const text = this.getNodeParameter('text', itemIndex);
                const outputFormat = this.getNodeParameter('outputFormat', itemIndex);
                const size = this.getNodeParameter('size', itemIndex);

                let qrCodeData;
                
                if (outputFormat === 'svg') {
                    qrCodeData = await QRCode.toString(text, {
                        type: 'svg',
                        width: size,
                        margin: 1,
                    });
                } else {
                    qrCodeData = await QRCode.toDataURL(text, {
                        width: size,
                        margin: 1,
                    });
                }

                const output = {
                    ...items[itemIndex].json,
                    qrCode: qrCodeData,
                    format: outputFormat,
                    size: size,
                    timestamp: new Date().toISOString(),
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

module.exports = { node: QRCodeGenerator };