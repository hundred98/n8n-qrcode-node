const { QRCodeGenerator } = require('./nodes/QRCodeGenerator/QRCodeGenerator.node.js');
const { QRCodeReader } = require('./nodes/QRCodeReader/QRCodeReader.node.js');
const { QRCodeCredentialManager } = require('./nodes/QRCodeCredentialManager/QRCodeCredentialManager.node.js');
const { QRCodeGroup } = require('./nodes/QRCodeGroup/QRCodeGroup.node.js');

module.exports = {
  nodes: [
    QRCodeGroup,
    QRCodeGenerator,
    QRCodeReader,
    QRCodeCredentialManager
  ],
  credentials: []
};