import { QRCodeGenerator } from './nodes/QRCodeGenerator/QRCodeGenerator';
import { QRCodeReader } from './nodes/QRCodeReader/QRCodeReader';
import { QRCodeCredentialManager } from './nodes/QRCodeCredentialManager/QRCodeCredentialManager';
import { QRCodeGroup } from './nodes/QRCodeGroup/QRCodeGroup';

export { QRCodeGenerator, QRCodeReader, QRCodeCredentialManager, QRCodeGroup };

export const nodes = [
  QRCodeGenerator,
  QRCodeReader,
  QRCodeCredentialManager,
  QRCodeGroup,
];