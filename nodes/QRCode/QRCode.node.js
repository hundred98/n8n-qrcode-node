const { INodeType, INodeTypeDescription } = require('n8n-workflow');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const https = require('https');
const http = require('http');




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
							name: 'App Secrets Manager',
							value: 'appSecrets',
							description: 'Manager for handling application secrets through QR codes and data table API'
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
					typeOptions: {
						editor: 'code',
						language: 'json',
						rows: 6
					},
					required: true,
					default: '{}',
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
						{ name: 'JPG', value: 'jpg' },
						{ name: 'SVG', value: 'svg' }
					],
					default: 'png',
					displayOptions: {
						show: {
							operation: ['generate']
						}
					},
					description: 'Choose the output format for the barcode'
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
				{
					displayName: 'Error Correction Level',
					name: 'errorCorrectionLevel',
					type: 'options',
					options: [
						{ name: 'L (Low - 7%)', value: 'L', description: 'Low error correction (7% of codewords can be restored)' },
						{ name: 'M (Medium - 15%)', value: 'M', description: 'Medium error correction (15% of codewords can be restored)' },
						{ name: 'Q (Quartile - 25%)', value: 'Q', description: 'Quartile error correction (25% of codewords can be restored)' },
						{ name: 'H (High - 30%)', value: 'H', description: 'High error correction (30% of codewords can be restored)' }
					],
					default: 'M',
					displayOptions: {
						show: {
							operation: ['generate']
						}
					},
					description: 'Amount of redundancy built into the QR code for error correction'
				},
				// Read QR Code 参数
				{
					displayName: 'Data Source',
					name: 'dataSource',
					type: 'options',
					options: [
						{ name: 'Binary Field', value: 'binaryField' },
						{ name: 'URL', value: 'url' }
					],
					default: 'binaryField',
					displayOptions: {
						show: {
							operation: ['read']
						}
					},
					description: 'Select the source of the QR code image'
				},
				{
					displayName: 'Input Binary Field Name',
					name: 'inputBinaryField',
					type: 'string',
					required: true,
					default: 'data',
					displayOptions: {
						show: {
							operation: ['read'],
							dataSource: ['binaryField']
						}
					},
					description: 'Name of the binary field containing the input image'
				},
				{
					displayName: 'Image URL',
					name: 'imageUrl',
					type: 'string',
					required: true,
					default: '',
					displayOptions: {
						show: {
							operation: ['read'],
							dataSource: ['url']
						}
					},
					description: 'URL of the image containing the QR code'
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
					const errorCorrectionLevel = this.getNodeParameter('errorCorrectionLevel', i, 'M');

				
				let data;
				if (inputType === 'text') {
					data = this.getNodeParameter('text', i);
				} else {
					data = JSON.stringify(this.getNodeParameter('jsonData', i));
				}

				try {
					let binaryData;
					let mimeType;

					// 默认使用QRCode库生成QR码
					const options = {
						width: size,
						height: size,
						errorCorrectionLevel: errorCorrectionLevel
					};

					if (outputFormat === 'png' || outputFormat === 'jpg') {
						// 生成Buffer格式数据
						binaryData = await QRCode.toBuffer(data, {
							...options,
							type: outputFormat
						});
						mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
					} else if (outputFormat === 'svg') {
						// SVG格式作为字符串
						const svgString = await QRCode.toString(data, { type: 'svg', ...options });
						binaryData = Buffer.from(svgString);
						mimeType = 'image/svg+xml';
					}

					// 创建二进制输出项
					const binaryPropertyName = 'barcode';
					const binaryItem = {
						json: {
							format: outputFormat,
							codeType: 'qrcode',
							size: size,
							data: data
						},
						binary: {}
					};
					
					// 生成文件名
					function generateFileName(extension) {
						const part1 = generateRandomString(13, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
						const part2 = generateRandomString(14, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
						return `${part1}-${part2}.${extension}`;
					}

					function generateRandomString(length, chars) {
						let result = '';
						for (let i = 0; i < length; i++) {
							result += chars.charAt(Math.floor(Math.random() * chars.length));
						}
						return result;
					}

					// 计算文件大小信息
					let fileSize;
					const bytes = binaryData.length;
					if (bytes < 1024) {
						fileSize = `${bytes} bytes`;
					} else if (bytes < 1024 * 1024) {
						fileSize = `${(bytes / 1024).toFixed(2)} KB`;
					} else {
						fileSize = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
					}

					// 获取文件扩展名
					let fileExtension;
					if (outputFormat === 'jpg') {
						fileExtension = 'jpg';
					} else if (outputFormat === 'svg') {
						fileExtension = 'svg';
					} else {
						fileExtension = 'png';
					}

					// 设置二进制数据，按照n8n标准格式
					binaryItem.binary[binaryPropertyName] = {
						data: binaryData.toString('base64'), // 转换为base64字符串
						mimeType: mimeType,
						fileName: generateFileName(fileExtension),
						fileExtension: fileExtension,
						fileSize: fileSize
					};

					returnItems.push(binaryItem);

				} catch (error) {
					throw new Error(`Failed to generate QR code: ${error.message}`);
				}
			} else if (operation === 'read') {
				const dataSource = this.getNodeParameter('dataSource', i);
				
				try {
					// 根据数据源获取图像数据
					let imageBuffer = null;
					
					if (dataSource === 'binaryField') {
						// 从Binary Field获取数据
						const inputBinaryField = this.getNodeParameter('inputBinaryField', i);
						if (item.binary && item.binary[inputBinaryField]) {
							let base64Data = item.binary[inputBinaryField].data;
							
							// 移除可能的数据URI前缀
							if (base64Data.startsWith('data:image')) {
								base64Data = base64Data.split(',')[1];
							}
							
							// 将base64转换为buffer
							imageBuffer = Buffer.from(base64Data, 'base64');
						} else {
							throw new Error(`Binary field '${inputBinaryField}' not found in input data`);
						}
					} else if (dataSource === 'url') {
					// 从URL获取数据
					const imageUrl = this.getNodeParameter('imageUrl', i);
					// 使用Promise封装HTTP请求
					imageBuffer = await new Promise((resolve, reject) => {
						const client = imageUrl.startsWith('https') ? https : http;
						client.get(imageUrl, (res) => {
							if (res.statusCode !== 200) {
								reject(new Error(`Failed to fetch image from URL: Status code ${res.statusCode}`));
								return;
							}
							
							const chunks = [];
							res.on('data', (chunk) => chunks.push(chunk));
							res.on('end', () => resolve(Buffer.concat(chunks)));
							res.on('error', reject);
						}).on('error', (err) => {
							reject(new Error(`Failed to fetch image from URL: ${err.message}`));
						});
					});
				}
					
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
								data: code.data
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
				// 待实现：实际的数据表API交互
				const secretAction = this.getNodeParameter('secretAction', i);
				const dataTableId = this.getNodeParameter('dataTableId', i);
				
				if (!dataTableId) {
					throw new Error('Data Table ID is required for application secret management');
				}
				
				// 根据不同操作处理应用秘钥
				if (secretAction === 'create') {
					const secretName = this.getNodeParameter('secretName', i);
					const secretValue = this.getNodeParameter('secretValue', i);

					if (!secretName || !secretValue) {
						throw new Error('Secret Name and Secret Value are required for create operation');
					}

					// 创建应用秘钥对象
					const secretData = {
						name: secretName,
						value: secretValue,
						type: 'app_secret',
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					}
					// 返回创建应用秘钥的请求信息
					returnItems.push({
						json: {
							action: 'create',
							secretName: secretName,
							secretData: secretData,
							note: '待实现：通过n8n data table API存储应用秘钥'
						}
					});

				} else if (secretAction === 'delete') {
					const secretName = this.getNodeParameter('secretName', i);

					if (!secretName) {
						throw new Error('Secret Name is required for delete operation');
					}

					// 返回删除应用秘钥的请求信息
					returnItems.push({
						json: {
							action: 'delete',
							secretName: secretName,
							note: '待实现：通过n8n data table API删除应用秘钥'
						}
					});

				} else if (secretAction === 'list') {
					// 返回列出应用秘钥的请求信息
					returnItems.push({
						json: {
							action: 'list',
							note: '待实现：通过n8n data table API列出应用秘钥'
						}
					});
				}
			}
		}

		return this.prepareOutputData(returnItems);
	}
}

module.exports = {
	QRCode: QRCodeNode
};