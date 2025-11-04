const { NodeOperationError } = require('n8n-workflow');

class TestNode {
  description = {
    displayName: 'Test Node',
    name: 'testNode',
    icon: 'file:qrcode.svg',
    group: ['transform'],
    version: 1,
    description: 'Test node to check if n8n can recognize nodes',
    defaults: {
      name: 'Test Node'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Test Field',
        name: 'testField',
        type: 'string',
        default: 'test',
        description: 'A test field'
      }
    ]
  };

  async execute() {
    const items = this.getInputData();
    return [items];
  }
}

module.exports = { TestNode };