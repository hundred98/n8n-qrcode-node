const { QRCode } = require('./nodes/QRCode/QRCode.node.js');
const { QRCodeApi } = require('./nodes/QRCode/QRCode.credentials.js');

module.exports = {
	nodes: [QRCode],
	credentials: [QRCodeApi]
};