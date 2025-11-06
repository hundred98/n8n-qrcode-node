# n8n QR Code Node Package

## Function Overview

This is an n8n community node package that provides complete QR code generation and parsing functionality. It includes three main nodes:

- **QR Code Generator** - QR code generator
- **QR Code Reader** - QR code reader  
- **QR Code Data Bridge** - QR code data bridge

## Installation Instructions

### Method 1: Using N8N_CUSTOM_EXTENSIONS Environment Variable

1. Make sure project dependencies are installed:
```bash
cd n8n-nodes-qrcode
npm install
```

2. Set environment variable when starting n8n:
```bash
# Windows PowerShell
$env:N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-qrcode"; n8n start

# Linux/Mac
N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-qrcode" n8n start
```

### Method 2: Install directly into n8n

```bash
# In the n8n project directory
cd /path/to/n8n
npm install /path/to/n8n-nodes-qrcode
```

## Node Function Details

### 1. QR Code Generator

**Function**: Convert text and JSON data into QR codes

**Input Parameters**:
- **Input Type**: Input type (Text or JSON)
- **Text**: Text content to encode when Input Type is Text
- **JSON Data**: JSON data to encode when Input Type is JSON
- **Output Format**: Output format (PNG, JPG or SVG)
- **Size**: QR code size (32-2048 pixels)
- **Error Correction Level**: Error correction level (L-Low 7%, M-Medium 15%, Q-Quartile 25%, H-High 30%)

**Output**: JSON object containing QR code data and corresponding binary image data

#### Phase 2 and Later Features (Not Yet Implemented)
- **Color Customization**: Foreground and background color settings
- **Margin Adjustment**: Set the size of the blank area around the QR code
- **Logo Embedding**: Add brand logo or image in the center of the QR code
- **QR Code Style**: Circular dot patterns, square dot patterns, custom corner styles
- **Image Quality Settings**: Control output image compression quality

### 2. QR Code Reader

**Function**: Read and parse QR code content from images

**Input Parameters**:
- **Data Source**: Data source type (Binary Field or URL)
- **Input Binary Field Name**: Binary field name containing input image when Data Source is Binary Field
- **Image URL**: Image URL containing QR code when Data Source is URL

**Output**: JSON object containing parsing results, including success status and data field (if parsing is successful) or error field (if parsing fails)

#### Phase 2 and Later Features (Not Yet Implemented)
- **Batch Processing**: Process images containing multiple QR codes at once
- **Content Type Recognition**: Automatically identify data types in QR codes (URL, text, contact information, etc.)

### 3. QR Code Data Bridge

**Function**: Transfer arbitrary data through QR codes

**Input Parameters**: A QR code image containing the following content:
- **qrKey**: Data filled in by the user in the node. Data is only output when it matches the node's data, required
- Other data, valid key-value pairs for transmission. Keys and values can be customized, for example:
  "myName": "My Name",
  "myEmail": "my@email.com",
  "myPhone": "1234567890",
  "myAddress": "123 Main St, Anytown, CA 12345",
  "myWebsite": "https://www.example.com"

Example QR code text content:
```json
{
  "qrKey": "*********",
  "myName": "My Name",
  "myEmail": "my@email.com",
  "myPhone": "1234567890",
  "myAddress": "123 Main St, Anytown, CA 12345",
  "myWebsite": "https://www.example.com"
}
```

**Output**: Operation result success and JSON object of key-value pairs

#### Phase 2 and Later Features (Not Yet Implemented)
- **Content Encryption/Decryption**: Encrypt QR code content
- **Data Validation**: Check if parsed data conforms to expected format
- **QR Code Validity Check**: Verify that generated QR codes can be correctly scanned
- **QR Code Comparison**: Compare whether two QR codes contain the same content
- **Version and Type Management**: Storage and management of key versions and types (API_KEY/ACCESS_TOKEN/CREDENTIAL, etc.)

## Usage Scenario Examples

### Scenario 1: Secure API Key Transmission

Enterprise IT administrators need to securely distribute API keys to development team members:

1. Administrators use the QR Code Generator node to generate QR codes containing API keys:
   ```json
   {
     "qrKey": "admin2023",
     "apiKey": "sk-xxxxxxxxxxxxxxx",
     "service": "cloud-storage",
     "permissions": "read-write",
     "expiry": "2023-12-31"
   }
   ```

2. Developers use the QR Code Data Bridge node to read the QR code and enter the same qrKey in the node for verification:
   - API keys are only output when qrKey matches
   - Provides an additional security layer to prevent unauthorized access

### Scenario 2: Employee Information Entry

HR departments need to quickly enter new employee information into the system:

1. HR uses QR Code Generator to generate QR codes containing basic employee information:
   ```json
   {
     "employeeId": "EMP001234",
     "name": "Zhang San",
     "department": "Technology Department",
     "position": "Frontend Engineer",
     "email": "zhangsan@company.com",
     "startDate": "2023-06-01"
   }
   ```

2. IT department uses QR Code Reader node to scan the QR code and automatically populate employee system account information

### Scenario 3: Device Configuration Deployment

Operations teams need to deploy network configurations to multiple devices:

1. Operations engineers use QR Code Generator to create QR codes containing network configurations:
   ```json
   {
     "network": {
       "ssid": "CompanyWiFi",
       "password": "securePassword123",
       "security": "WPA2",
       "ipRange": "192.168.1.100-200"
     },
     "dns": ["8.8.8.8", "8.8.4.4"]
   }
   ```

2. Field technicians scan the QR code using mobile phones or tablets to obtain configuration information and apply it to devices

### Scenario 4: Meeting Information Sharing

Administrative staff need to share meeting room booking information:

1. Administrative staff use QR Code Generator to generate meeting information QR codes:
   ```json
   {
     "room": "Meeting Room A",
     "date": "2023-06-15",
     "time": "14:00-16:00",
     "topic": "Quarterly Business Review",
     "participants": ["Zhang San", "Li Si", "Wang Wu"],
     "materials": "https://drive.company.com/meeting-docs"
   }
   ```

2. Meeting participants scan the QR code to obtain complete meeting information

### Scenario 5: Product Traceability Tracking

Manufacturing companies need to track product supply chain information:

1. Production department uses QR Code Generator to generate traceability QR codes for each batch of products:
   ```json
   {
     "batchId": "BATCH20230601A",
     "productName": "Smart Watch",
     "productionDate": "2023-06-01",
     "components": {
       "screen": "OLED-2023",
       "battery": "Li-Ion-3000mAh",
       "processor": "Snapdragon-888"
     },
     "qualityCert": "ISO9001-2023"
   }
   ```

2. Quality inspection, logistics, and sales departments obtain complete product information by scanning QR codes

## Future Expansion Possibilities

1. **Dynamic QR Codes**: Support generating QR codes pointing to updatable content
2. **QR Code Beautification**: Provide more design options and custom styles
3. **Data Analysis**: Add scanning statistics and analysis functions (requires external services)
4. **Other Code Support**: Expand support for other codes such as barcodes