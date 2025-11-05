const { INodeType, INodeTypeDescription } = require('n8n-workflow');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');

class QRCodeNode {
	constructor() {
		this.description = {
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
							name: 'App Secrets Guide',
							value: 'appSecrets',
							description: 'Guide for storing application secrets in n8n data table'
						}
					],
					default: 'generate',
					description: 'Select the QR code operation'
				},
				// Generate QR Code 参数
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
				},
				// Read QR Code 参数
				{
					displayName: 'Image Data',
					name: 'imageData',
					type: 'string',
					required: true,
					default: '',
					displayOptions: {
						show: {
							operation: ['read']
						}
					},
					description: 'Base64 encoded image data to read QR code from'
				},
				{
					displayName: 'Image Format',
					name: 'imageFormat',
					type: 'options',
					options: [
						{ name: 'PNG', value: 'png' },
						{ name: 'JPEG', value: 'jpeg' },
						{ name: 'WebP', value: 'webp' }
					],
					default: 'png',
					displayOptions: {
						show: {
							operation: ['read']
						}
					},
					description: 'Format of the input image'
				},
				// App Secrets Management 参数
				{
					displayName: 'App Secret Action',
					name: 'secretAction',
					type: 'options',
					options: [
						{ name: 'Create', value: 'create' },
						{ name: 'Delete', value: 'delete' },
						{ name: 'List', value: 'list' }
					],
					default: 'list',
					displayOptions: {
						show: {
							operation: ['appSecrets']
						}
					},
					description: 'Action to perform on application secrets'
				},
				{
					displayName: 'App Secret Name',
					name: 'secretName',
					type: 'string',
					default: '',
					displayOptions: {
						hide: {
							secretAction: ['list']
						},
						show: {
							operation: ['appSecrets']
						}
					},
					description: 'Name of the application secret'
				},
				{
					displayName: 'App Secret Value',
					name: 'secretValue',
					type: 'string',
					typeOptions: {
						password: true
					},
					default: '',
					displayOptions: {
						hide: {
							secretAction: ['list', 'delete']
						},
						show: {
							operation: ['appSecrets']
						}
					},
					description: 'Value of the application secret'
				},
				{
					displayName: 'Data Table ID',
					name: 'dataTableId',
					type: 'string',
					default: '',
					displayOptions: {
						show: {
							operation: ['appSecrets']
						}
					},
					description: 'ID of the n8n data table to use for application secret storage'
				}
			]
		};
	}

	async execute() {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0);
		
		const returnItems = [];
		
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

					returnItems.push({
						json: {
							qrCode: qrCode,
							format: outputFormat,
							size: size,
							data: data
						}
					});

				} catch (error) {
					throw new Error(`Failed to generate QR code: ${error.message}`);
				}
			} else if (operation === 'read') {
				const imageData = this.getNodeParameter('imageData', i);
				const imageFormat = this.getNodeParameter('imageFormat', i);
				
				try {
					// 移除可能的数据URI前缀
					let base64Data = imageData;
					if (imageData.startsWith('data:image')) {
						base64Data = imageData.split(',')[1];
					}
					
					// 将base64转换为buffer
					const imageBuffer = Buffer.from(base64Data, 'base64');
					
					// 使用sharp处理图像
					const { data, info } = await sharp(imageBuffer)
						.raw()
						.ensureAlpha()
						.toBuffer({ resolveWithObject: true });
						
					// 使用jsQR读取二维码
					const code = jsQR(data, info.width, info.height);
					
					if (code) {
						returnItems.push({
							json: {
								success: true,
								data: code.data,
								binaryData: code.binaryData,
								location: {
									top: code.location.topLeftCorner.y,
									right: code.location.topRightCorner.x,
									bottom: code.location.bottomLeftCorner.y,
									left: code.location.topLeftCorner.x
								}
							}
						});
					} else {
						returnItems.push({
							json: {
								success: false,
								error: 'No QR code found in image'
							}
						});
					}
				} catch (error) {
					throw new Error(`Failed to read QR code: ${error.message}`);
				}
			} else if (operation === 'appSecrets') {
				// 准备与n8n data table集成
				// 这里需要通过HTTP请求与data table API交互
				const secretAction = this.getNodeParameter('secretAction', i);
				const dataTableId = this.getNodeParameter('dataTableId', i);
				
				if (!dataTableId) {
					throw new Error('Data Table ID is required for application secret management');
				}
				
				// 提供与data table集成的指引信息
				returnItems.push({
					json: {
						action: secretAction,
						dataTableId: dataTableId,
						message: `To manage application secrets, connect this node to an HTTP Request node configured to interact with n8n data table API.`,
						instructions: {
							create: "Use POST request to data table API with app secret name and value",
							delete: "Use DELETE request to data table API with app secret name",
							list: "Use GET request to data table API to retrieve all app secrets"
						},
						timestamp: new Date().toISOString()
					}
				});
			}
		}

		return this.prepareOutputData(returnItems);
	}
}

module.exports = {
	QRCode: QRCodeNode
};