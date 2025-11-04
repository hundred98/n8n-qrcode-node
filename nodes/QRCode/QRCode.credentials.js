const { ICredentialType, INodeProperties } = require('n8n-workflow');

class QRCodeApi {
	constructor() {
		// 不需要构造函数
	}
}

// 正确实现 ICredentialType 接口
QRCodeApi.prototype.name = 'qrcodeApi';
QRCodeApi.prototype.displayName = 'QR Code API';
QRCodeApi.prototype.documentationUrl = '';
QRCodeApi.prototype.properties = [
	{
		displayName: 'Access Key',
		name: 'accessKey',
		type: 'string',
		default: '',
		description: 'Access key for QR Code API',
	},
	{
		displayName: 'Secret Key',
		name: 'secretKey',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'Secret key for QR Code API',
	},
	{
		displayName: 'API Endpoint',
		name: 'endpoint',
		type: 'string',
		default: 'https://api.qrcode.com',
		description: 'API endpoint for QR Code service',
	},
];

module.exports = {
	QRCodeApi: QRCodeApi
};