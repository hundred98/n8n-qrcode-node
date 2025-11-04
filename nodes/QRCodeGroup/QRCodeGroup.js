const { NodeOperationError, NodeConnectionType } = require('n8n-workflow');

class QRCodeGroup {
    constructor() {
        this.description = {
            displayName: 'QR Code Toolkit',
            name: 'qrcodeGroup',
            icon: 'file:qrcode.svg',
            group: ['transform'],
            version: 1,
            description: 'QR code operations toolkit',
            defaults: {
                name: 'QR Code Toolkit',
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
                            name: 'Generate',
                            value: 'generate',
                        },
                        {
                            name: 'Read',
                            value: 'read',
                        },
                        {
                            name: 'Credential Manager',
                            value: 'credential',
                        },
                    ],
                    default: 'generate',
                    description: 'Select the QR code operation to perform',
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const result = {
                    operation: operation,
                    message: `QR Code ${operation} operation selected`,
                    timestamp: new Date().toISOString(),
                };
                
                returnData.push({
                    json: {
                        ...items[itemIndex].json,
                        ...result,
                    },
                });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                    });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error, { itemIndex });
            }
        }
        
        return [returnData];
    }
}

module.exports = { node: QRCodeGroup };