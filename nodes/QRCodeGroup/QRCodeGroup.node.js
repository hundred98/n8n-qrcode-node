const { INodeType, INodeTypeDescription } = require('n8n-workflow');

class QRCodeGroup extends INodeType {
  description = {
    displayName: 'QRCode Toolkit',
    name: 'QRCodeGroup',
    icon: 'file:qrcode.svg',
    group: ['integrations'],
    version: 1,
    description: 'QRCode generation, reading and credential management toolkit',
    defaults: {
      name: 'QRCode Toolkit',
    },
    // 主节点组无需输入输出，仅作为容器
    inputs: [],
    outputs: [],
    properties: [], // 无参数配置
  };
  
  async execute() {
    // 组节点不执行实际操作
    return [];
  }
}

// 导出为具有类名属性的对象
module.exports = {
  QRCodeGroup
};