// 使用require方式导入以避免TypeScript类型检查错误
const { QRCode } = require('./nodes/QRCode/QRCode.node.js');

export { QRCode };

export const nodes = [
  QRCode,
];