const { NodeOperationError, NodeConnectionType } = require('n8n-workflow');
const fs = require('fs');
const jsQR = require('jsqr');
const sharp = require('sharp');

class QRCodeCredentialManager {
    constructor() {
        this.description = {
            displayName: 'QR Code Credential Manager',
            name: 'qrcodeCredentialManager',
            icon: 'file:qrcode.svg',
            group: ['transform'],
            version: 1,
            description: 'Manage credentials from QR codes',
            defaults: {
                name: 'QR Code Credential Manager',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Input Source',
                    name: 'inputSource',
                    type: 'options',
                    options: [
                        {
                            name: 'File Path',
                            value: 'filePath',
                        },
                        {
                            name: 'URL',
                            value: 'url',
                        },
                        {
                            name: 'Base64',
                            value: 'base64',
                        },
                    ],
                    default: 'filePath',
                    description: 'The source of the QR code image',
                },
                {
                    displayName: 'File Path',
                    name: 'filePath',
                    type: 'string',
                    default: '',
                    description: 'Path to the QR code image file',
                    displayOptions: {
                        show: {
                            inputSource: ['filePath'],
                        },
                    },
                },
                {
                    displayName: 'URL',
                    name: 'url',
                    type: 'string',
                    default: '',
                    description: 'URL of the QR code image',
                    displayOptions: {
                        show: {
                            inputSource: ['url'],
                        },
                    },
                },
                {
                    displayName: 'Base64 Data',
                    name: 'base64Data',
                    type: 'string',
                    default: '',
                    description: 'Base64 encoded QR code image data',
                    displayOptions: {
                        show: {
                            inputSource: ['base64'],
                        },
                    },
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const inputSource = this.getNodeParameter('inputSource', itemIndex);
                
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
                        const cleanBase64 = base64Data.replace(/^data:image\/[^;]+;base64,/, '');
                        imageBuffer = Buffer.from(cleanBase64, 'base64');
                        break;
                }
                
                // 处理图像数据
                const imageMetadata = await sharp(imageBuffer).metadata();
                const width = Math.min(imageMetadata.width, 1000);
                const height = Math.min(imageMetadata.height, 1000);
                
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
                
                // 解析凭证数据
                let credentialData;
                try {
                    credentialData = JSON.parse(decoded.data);
                } catch (parseError) {
                    throw new NodeOperationError(this.getNode(), `Failed to parse QR code content as JSON: ${parseError.message}`, { itemIndex });
                }
                
                const output = {
                    ...items[itemIndex].json,
                    credential: credentialData,
                    rawData: decoded.data,
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

module.exports = { node: QRCodeCredentialManager };