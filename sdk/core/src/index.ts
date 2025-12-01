/**
 * @vey/core - World Address SDK Core
 *
 * Universal address format handling, validation, and formatting
 * With AI/Automation, POS Hardware, Logistics, and System features
 */

// Core Types
export type {
  Language,
  LocalName,
  IsoCodes,
  AddressField,
  OrderVariant,
  AddressFormat,
  AdministrativeDivision,
  AdministrativeDivisions,
  Validation,
  AddressExamples,
  CountryStatus,
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  VeyConfig,
  WebhookEventType,
  WebhookPayload,
  RegionHierarchy,
} from './types';

// Client
export { VeyClient, createVeyClient } from './client';

// Validator
export {
  validateAddress,
  getRequiredFields,
  getFieldOrder,
} from './validator';

// Formatter
export {
  formatAddress,
  formatShippingLabel,
  getPostalCodeExample,
  getPostalCodeRegex,
} from './formatter';
export type { FormatOptions } from './formatter';

// Loader
export { createDataLoader, dataLoader } from './loader';
export type { DataLoaderConfig } from './loader';

// AI/Automation Types (Gemini Integration)
export type {
  // OCR
  OCRRequest,
  OCRTextBlock,
  OCRAddressResult,
  OCRResponse,
  // HS Code
  HSCodeRequest,
  HSCodeSuggestion,
  HSCodeResponse,
  // Dangerous Goods
  HazardClass,
  DangerousGoodsRequest,
  DetectedHazard,
  DangerousGoodsResponse,
  // Translation
  SupportedLanguage,
  TranslationRequest,
  TranslationResponse,
  SpeechToTextRequest,
  SpeechToTextResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
  // Address Verification
  AddressVerificationRequest,
  AddressIssue,
  GeocodingResult,
  AddressVerificationResponse,
  // Invoice Generation
  InvoiceItem,
  InvoiceRequest,
  GeneratedInvoice,
  InvoiceResponse,
  // AI Service
  AIServiceConfig,
  AIService,
} from './ai';

// POS Hardware & IoT Types
export type {
  // Weight Scale
  WeightUnit,
  BluetoothConnectionState,
  WeightScaleDevice,
  WeightMeasurement,
  WeightScaleConfig,
  WeightScaleEventHandlers,
  WeightScaleService,
  // AR Measurement
  DimensionUnit,
  PackageDimensions,
  ARMeasurementResult,
  ARMeasurementConfig,
  ARMeasurementService,
  // Payment Terminal
  PaymentMethodType,
  PaymentStatus,
  TerminalType,
  PaymentTerminalDevice,
  PaymentRequest,
  PaymentResult,
  RefundRequest,
  RefundResult,
  PaymentTerminalEventHandlers,
  PaymentTerminalService,
  // Passport Scanner
  TravelDocumentType,
  GenderCode,
  MRZData,
  PassportScanResult,
  PassportScannerConfig,
  PassportScannerService,
  // Label Printer
  PrinterConnectionType,
  LabelSize,
  PrinterDevice,
  BarcodeType,
  LabelElement,
  TextElement,
  BarcodeElement,
  ImageElement,
  ShippingLabelData,
  PrintJobRequest,
  PrintJobResult,
  LabelPrinterEventHandlers,
  LabelPrinterService,
} from './hardware';

// Logistics & Shipping Types
export type {
  // Carriers
  CarrierCode,
  ServiceLevel,
  CarrierService,
  // Rate Comparison
  PackageInfo,
  RateQuoteRequest,
  RateBreakdown,
  RateQuote,
  RateComparisonResponse,
  // ETA Prediction
  PredictionFactors,
  DeliveryPrediction,
  ETAPredictionRequest,
  ETAPredictionResponse,
  // Multi-Piece Shipments
  ShipmentPiece,
  MultiPieceShipment,
  MultiPieceRequest,
  MultiPieceResponse,
  // Pickup Scheduling
  PickupWindow,
  PickupRequest,
  PickupConfirmation,
  PickupResponse,
  // Carbon Offset
  CarbonOffsetRequest,
  CarbonOffsetResult,
  CarbonOffsetResponse,
  // Alternative Delivery
  DeliveryLocationType,
  DeliveryLocation,
  AlternativeLocationRequest,
  AlternativeLocationResponse,
  DeliveryPreference,
  // Service
  LogisticsConfig,
  LogisticsService,
} from './logistics';

// Customer Engagement Types
export type {
  // Notifications
  NotificationChannel,
  NotificationEventType,
  NotificationRecipient,
  NotificationContent,
  NotificationRequest,
  NotificationResult,
  NotificationResponse,
  LINEConfig,
  WhatsAppConfig,
  // Digital Receipts
  ReceiptItem,
  ReceiptTaxBreakdown,
  DigitalReceipt,
  ReceiptFormatOptions,
  ReceiptDeliveryOptions,
  DigitalReceiptResponse,
  // Member Features
  MemberTier,
  MemberProfile,
  SavedAddress,
  AddressBook,
  ShipmentHistoryEntry,
  MemberDashboard,
  // Duplicate Shipment
  DuplicateShipmentRequest,
  DuplicateShipmentResponse,
  ShipmentQRData,
  // Digital Signage
  SignageContentType,
  SignageContent,
  SignagePlaylist,
  SignageConfig,
  SignageEventHandlers,
  // Service
  CustomerEngagementConfig,
  CustomerEngagementService,
} from './engagement';

// Dashboard & Analytics Types
export type {
  // Heatmap
  GeoDataPoint,
  HeatmapConfig,
  HeatmapData,
  // Inventory
  InventoryItemType,
  InventoryItem,
  InventoryAlert,
  InventoryUsage,
  InventoryReport,
  // Staff Performance
  StaffMember,
  StaffPerformanceMetrics,
  StaffPerformanceError,
  StaffLeaderboard,
  // Profit Margin
  CostBreakdown,
  RevenueBreakdown,
  ShipmentProfitAnalysis,
  ProfitMarginReport,
  // Fraud Detection
  FraudRiskLevel,
  FraudIndicator,
  FraudAlert,
  FraudScreeningRequest,
  FraudScreeningResponse,
  FraudRulesConfig,
  // Service
  DashboardConfig,
  DashboardService,
} from './dashboard';

// System & Reliability Types
export type {
  // Offline Mode
  SyncStatus,
  OfflineEntityType,
  PendingSyncItem,
  SyncConflict,
  SyncResult,
  OfflineStorageStats,
  OfflineModeConfig,
  OfflineModeEventHandlers,
  OfflineModeService,
  // Kiosk Mode
  KioskRestriction,
  KioskSession,
  KioskModeConfig,
  KioskModeEventHandlers,
  KioskModeService,
  // Audit Log
  AuditActionType,
  AuditEntityType,
  AuditLogEntry,
  AuditLogQuery,
  AuditLogQueryResult,
  AuditLogExportFormat,
  AuditLogRetentionPolicy,
  AuditLogConfig,
  AuditLogService,
  // System
  SystemHealthStatus,
  SystemService,
} from './system';
