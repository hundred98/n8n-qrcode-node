// 测试脚本 - 验证n8n节点包的基本功能
const QRCodeNode = require('./nodes/QRCode/QRCode.node.js').node;

console.log('=== n8n QR Code 节点包测试 ===\n');

// 测试节点实例化
try {
    const qrCodeNode = new QRCodeNode();
    console.log('✓ QR Code 节点创建成功');
    console.log('  显示名称:', qrCodeNode.description.displayName);
    console.log('  版本:', qrCodeNode.description.version);
    console.log('  输入数量:', qrCodeNode.description.inputs.length);
    console.log('  输出数量:', qrCodeNode.description.outputs.length);
    console.log('  参数数量:', qrCodeNode.description.properties.length);
    
    // 测试操作类型
    const operationProperty = qrCodeNode.description.properties.find(p => p.name === 'operation');
    if (operationProperty) {
        console.log('  操作类型数量:', operationProperty.options.length);
        console.log('  操作类型:');
        operationProperty.options.forEach(option => {
            console.log('    -', option.name, '(', option.value, ')');
        });
    }
    
} catch (error) {
    console.log('✗ QR Code 节点创建失败:', error.message);
}

console.log('\n=== 测试完成 ===');
console.log('\n要测试节点在n8n中的功能，请执行以下步骤：');
console.log('1. 安装依赖: npm install');
console.log('2. 启动n8n: $env:N8N_CUSTOM_EXTENSIONS="E:\\code\\N8N\\NextFlow\\n8n-nodes-qrcode"; n8n start');
console.log('3. 在n8n界面中搜索 "QR Code" 节点');