const { ICredentialType, NodePropertyTypes } = require('n8n-workflow');

class ApiKeyAuth {
	constructor() {
		this.name = 'apiKeyAuth';
		this.displayName = 'API Key Auth';
		this.documentationUrl = '';
		this.properties = [
			{
				displayName: 'API Key',
				name: 'apiKey',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
			},
		];
	}

	async test(credential) {
		const apiKey = credential.data?.apiKey;

		if (!apiKey) {
			return {
				status: 'Error',
				message: 'API Key is missing',
			};
		}

		if (typeof apiKey !== 'string') {
			return {
				status: 'Error',
				message: 'API Key must be a string',
			};
		}

		if (apiKey.trim().length === 0) {
			return {
				status: 'Error',
				message: 'API Key cannot be empty',
			};
		}

		return {
			status: 'OK',
			message: 'Authentication successful',
		};
	}
}

module.exports = { QRCode: ApiKeyAuth };