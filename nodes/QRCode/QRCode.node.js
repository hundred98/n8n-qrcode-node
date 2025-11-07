const { Node } = require('n8n-workflow');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

class QRCodeNode extends Node {
	constructor() {
		super();
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
							name: 'QR Code Data Bridge',
							value: 'dataBridge',
							description: 'Bridge for transferring data through QR codes'
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
							operation: ['read', 'dataBridge']
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
							operation: ['read', 'dataBridge'],
							dataSource: ['binaryField']
						}
					},
					description: 'Name of the binary field containing the QR code image with data'
				},
				{
					displayName: 'Image URL',
					name: 'imageUrl',
					type: 'string',
					required: true,
					default: '',
					displayOptions: {
						show: {
							operation: ['read', 'dataBridge'],
							dataSource: ['url']
						}
					},
					description: 'URL of the QR code image containing data'
				},
				{
					displayName: 'Output Format',
					name: 'outputFormat',
					type: 'options',
					options: [
						{ name: 'Text', value: 'text' },
						{ name: 'JSON', value: 'json' }
					],
					default: 'json',
					displayOptions: {
						show: {
							operation: ['read']
						}
					},
					description: 'Choose the output format for the data'
				},				
				{
					displayName: 'QR Key',
					name: 'qrKey',
					type: 'string',
					required: false,
					default: '',
					displayOptions: {
						show: {
							operation: ['dataBridge']
						}
					},
					description: 'QR key for verification. Data will only be output if this matches the qrKey in the QR code'
				},
				{
					displayName: 'Output Format',
					name: 'outputFormat',
					type: 'options',
					options: [
						{ name: 'Text', value: 'text' },
						{ name: 'JSON', value: 'json' }
					],
					default: 'json',
					displayOptions: {
						show: {
							operation: ['dataBridge']
						}
					},
					description: 'Choose the output format for the data'
				}
			]
		};

		this.methods = {
			listSearch: {
				async dataTableSearch(opts) {
					// 返回预定义的静态列表
					// 在实际应用中，这里应该连接到n8n的数据表API来获取真实数据
					const results = [
						{
							name: 'QR Code Data',
							value: 'qrcode_data'
						}
					];
					
					// 如果有搜索过滤器，则根据名称过滤结果
					if (opts && opts.filter) {
						return results.filter(item => 
							item.name.toLowerCase().includes(opts.filter.toLowerCase())
						);
					}
					
					return results;
				}
			}
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
				const outputFormat = this.getNodeParameter('outputFormat', i, 'json');
				
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
							// 根据输出格式返回数据
							if (outputFormat === 'text') {
								// 尝试将数据解析为JSON对象
								let parsedData = code.data;
								try {
									parsedData = JSON.parse(code.data);
								} catch (parseError) {
									// 如果解析失败，保持原始字符串
								}
								returnItems.push({
									json: {
										success: true,
										format: 'text',
										data: parsedData
									}
								});
							} else {
								// 尝试将数据解析为JSON
								let parsedData;
								try {
									parsedData = JSON.parse(code.data);
									returnItems.push({
										json: {
											success: true,
											...parsedData
										}
									});
								} catch (parseError) {
									// 如果不是有效的JSON，则返回文本格式
									returnItems.push({
										json: {
											success: true,
											format: 'text',
											data: code.data
										}
									});
								}
							}
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
			} else if (operation === 'dataBridge') {
				const dataSource = this.getNodeParameter('dataSource', i);
				const qrKey = this.getNodeParameter('qrKey', i, '');
				const outputFormat = this.getNodeParameter('outputFormat', i, 'json');
				
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
					// 解析二维码中的数据
					let qrData;
					try {
						qrData = JSON.parse(code.data);
					} catch (parseError) {
						// 如果不是有效的JSON，就当作普通文本处理
						qrData = {
							success: true,
							format: 'text',
							data: code.data
						};
						
						// 如果设置了qrKey但二维码不是JSON格式，则验证失败
						if (qrKey) {
							returnItems.push({
								json: {
									success: false,
									error: 'QR code data is not in JSON format, but qrKey verification is required'
								}
							});
							continue;
						}
						
						returnItems.push({
							json: qrData
						});
						continue;
					}
					
					// 验证qrKey字段
					if (qrKey) {
						// 如果节点设置了qrKey但二维码中没有qrKey字段，则验证失败
						if (!qrData.qrKey) {
							returnItems.push({
								json: {
									success: false,
									error: 'QR code does not contain qrKey field for verification'
								}
							});
							continue;
						}
						
						// 如果qrKey不匹配，则验证失败
						if (qrData.qrKey !== qrKey) {
							returnItems.push({
								json: {
									success: false,
									error: 'qrKey verification failed'
								}
							});
							continue;
						}
					}
					
					// 删除qrKey字段，不输出到结果中
					delete qrData.qrKey;
					
					// 根据输出格式返回数据
					if (outputFormat === 'text') {
						returnItems.push({
							json: {
								success: true,
								format: 'text',
								data: qrData
							}
						});
					} else {
						// JSON format
						returnItems.push({
							json: {
								success: true,
								...qrData
							}
						});
					}
				} else {
					throw new Error('No QR code found in image');
				}
			} else if (operation === 'appSecrets') {
				const dataSource = this.getNodeParameter('dataSource', i);
				const qrKey = this.getNodeParameter('qrKey', i, '');
				const outputFormat = this.getNodeParameter('outputFormat', i, 'json');
				
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
					// 解析二维码中的数据
					let qrData;
					try {
						qrData = JSON.parse(code.data);
					} catch (parseError) {
						// 如果不是有效的JSON
						if (qrKey) {
							// 如果设置了qrKey但二维码不是JSON格式，则验证失败
							returnItems.push({
								json: {
									success: false,
									error: 'QR code data is not in JSON format, but qrKey verification is required',
									rawData: code.data
								}
							});
							continue;
						} else {
							// 如果没有设置qrKey，直接返回原始数据
							returnItems.push({
								json: {
									success: true,
									format: 'text',
									data: code.data
								}
							});
							continue;
						}
					}
					
					// 处理JSON数据
					if (qrKey) {
						// 如果节点设置了qrKey
						if (!qrData.hasOwnProperty('qrKey')) {
							// 如果二维码中没有qrKey字段，则验证失败
							returnItems.push({
								json: {
									success: false,
									error: 'QR code does not contain qrKey field for verification',
									data: qrData
								}
							});
							continue;
						}
						
						// 如果qrKey不匹配，则验证失败
						if (qrData.qrKey !== qrKey) {
							returnItems.push({
								json: {
									success: false,
									error: 'qrKey verification failed',
									expected: qrKey,
									actual: qrData.qrKey
								}
							});
							continue;
						}
						
						// 验证通过，删除qrKey字段
						delete qrData.qrKey;
					} else {
						// 如果没有设置qrKey，但数据中有qrKey字段，也删除它
						if (qrData.hasOwnProperty('qrKey')) {
							delete qrData.qrKey;
						}
					}
					
					// 根据输出格式返回数据
					if (outputFormat === 'text') {
						returnItems.push({
							json: {
								success: true,
								format: 'json',
								data: qrData
							}
						});
					} else {
						// JSON format
						returnItems.push({
							json: {
								success: true,
								...qrData
							}
						});
					}
				} else {
					returnItems.push({
						json: {
							success: false,
							error: 'No QR code found in image'
						}
					});
				}
			}
		}

		return this.prepareOutputData(returnItems);
	}
}

module.exports = { QRCode: QRCodeNode };