import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class QRCodeGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QR Code',
		name: 'qrcodeGroup',
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
			// 操作类型（区分三个子节点功能）
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate a QR code from text or data'
					},
					{
						name: 'Read',
						value: 'read',
						description: 'Read and decode QR code from image'
					},
					{
						name: 'Credential Management',
						value: 'credentials',
						description: 'Manage QR code credentials'
					}
				],
				default: 'generate',
				description: 'Select the QR code operation'
			},

			// Generate QR Code 专属参数
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
				typeOptions: {
					minValue: 32,
					maxValue: 2048
				}
			},

			// Read QR Code 专属参数
			{
				displayName: 'Input Source',
				name: 'inputSource',
				type: 'options',
				options: [
					{ name: 'File Path', value: 'filePath' },
					{ name: 'Base64', value: 'base64' },
					{ name: 'URL', value: 'url' }
				],
				default: 'filePath',
				displayOptions: {
					show: {
						operation: ['read']
					}
				},
				description: 'Choose the source of the QR code image'
			},
			{
				displayName: 'File Path',
				name: 'filePath',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['read'],
						inputSource: ['filePath']
					}
				},
				description: 'Path to the QR code image file'
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['read'],
						inputSource: ['url']
					}
				},
				description: 'URL of the QR code image'
			},
			{
				displayName: 'Base64 Data',
				name: 'base64Data',
				type: 'string',
				typeOptions: {
					rows: 4
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['read'],
						inputSource: ['base64']
					}
				},
				description: 'Base64 encoded QR code image data'
			},

			// Credential Management 专属参数
			{
				displayName: 'Credential Action',
				name: 'credentialAction',
				type: 'options',
				options: [
					{ name: 'Generate Credential QR', value: 'generate' },
					{ name: 'Validate Credential', value: 'validate' }
				],
				default: 'generate',
				displayOptions: {
					show: {
						operation: ['credentials']
					}
				},
				description: 'Select credential management action'
			},
			{
				displayName: 'Credential Data',
				name: 'credentialData',
				type: 'json',
				required: true,
				default: '{}',
				displayOptions: {
					show: {
						operation: ['credentials'],
						credentialAction: ['generate']
					}
				},
				description: 'Credential data to encode in QR code'
			}
		]
	};
}