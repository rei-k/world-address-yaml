/**
 * Magento Extension Generator
 * Magentoエクステンション自動生成
 * 
 * Generates a complete Magento 2 extension from the VeyExpress SDK
 */

import { PluginManifest, PluginConfiguration } from '../../types';

export interface MagentoExtensionConfig extends PluginConfiguration {
  moduleName: string; // e.g., "VeyExpress_Shipping"
  version: string;
  author: string;
  description: string;
  sequence?: string[]; // Module dependencies
}

/**
 * Generate Magento 2 extension
 */
export async function generateMagentoExtension(
  config: MagentoExtensionConfig
): Promise<{ manifest: PluginManifest; files: Record<string, string> }> {
  const [vendor, module] = config.moduleName.split('_');
  
  const manifest: PluginManifest = {
    platform: 'magento',
    version: config.version,
    name: config.moduleName,
    ...config,
  };

  const files: Record<string, string> = {
    'registration.php': generateRegistrationFile(vendor, module),
    'etc/module.xml': generateModuleXML(config),
    'etc/config.xml': generateConfigXML(config),
    'etc/adminhtml/system.xml': generateSystemXML(config),
    'etc/di.xml': generateDIXML(config),
    'Model/Carrier.php': generateCarrierModel(vendor, module, config),
    'Model/Config.php': generateConfigModel(vendor, module, config),
    'Model/Api/Client.php': generateAPIClient(vendor, module, config),
    'Block/Adminhtml/System/Config/ApiKey.php': generateApiKeyBlock(vendor, module, config),
    'Controller/Adminhtml/Tracking/Index.php': generateTrackingController(vendor, module, config),
    'view/frontend/layout/sales_order_view.xml': generateOrderViewLayout(),
    'view/frontend/templates/tracking.phtml': generateTrackingTemplate(),
    'composer.json': generateComposerJSON(vendor, module, config),
    'README.md': generateREADME(config),
  };

  return { manifest, files };
}

/**
 * Generate registration.php
 */
function generateRegistrationFile(vendor: string, module: string): string {
  return `<?php
/**
 * VeyExpress Magento Extension
 */
\\Magento\\Framework\\Component\\ComponentRegistrar::register(
    \\Magento\\Framework\\Component\\ComponentRegistrar::MODULE,
    '${vendor}_${module}',
    __DIR__
);
`;
}

/**
 * Generate module.xml
 */
function generateModuleXML(config: MagentoExtensionConfig): string {
  const [vendor, module] = config.moduleName.split('_');
  const sequence = config.sequence || ['Magento_Shipping', 'Magento_Sales'];
  
  return `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="${vendor}_${module}" setup_version="${config.version}">
        <sequence>
            ${sequence.map(dep => `<module name="${dep}"/>`).join('\n            ')}
        </sequence>
    </module>
</config>
`;
}

/**
 * Generate config.xml
 */
function generateConfigXML(config: MagentoExtensionConfig): string {
  const [vendor, module] = config.moduleName.split('_');
  
  return `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Store:etc/config.xsd">
    <default>
        <carriers>
            <veyexpress>
                <active>1</active>
                <model>${vendor}\\${module}\\Model\\Carrier</model>
                <title>VeyExpress Shipping</title>
                <name>VeyExpress</name>
                <api_url>https://api.veyexpress.com/v1</api_url>
                <sort_order>100</sort_order>
                <sallowspecific>0</sallowspecific>
            </veyexpress>
        </carriers>
    </default>
</config>
`;
}

/**
 * Generate system.xml for admin configuration
 */
function generateSystemXML(config: MagentoExtensionConfig): string {
  return `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Config:etc/system_file.xsd">
    <system>
        <section id="carriers">
            <group id="veyexpress" translate="label" type="text" sortOrder="100" showInDefault="1" showInWebsite="1" showInStore="1">
                <label>VeyExpress Shipping</label>
                <field id="active" translate="label" type="select" sortOrder="10" showInDefault="1" showInWebsite="1" showInStore="0">
                    <label>Enabled</label>
                    <source_model>Magento\\Config\\Model\\Config\\Source\\Yesno</source_model>
                </field>
                <field id="api_key" translate="label" type="obscure" sortOrder="20" showInDefault="1" showInWebsite="1" showInStore="0">
                    <label>API Key</label>
                    <backend_model>Magento\\Config\\Model\\Config\\Backend\\Encrypted</backend_model>
                </field>
                <field id="environment" translate="label" type="select" sortOrder="30" showInDefault="1" showInWebsite="1" showInStore="0">
                    <label>Environment</label>
                    <source_model>Magento\\Config\\Model\\Config\\Source\\Yesno</source_model>
                    <comment>Production or Sandbox</comment>
                </field>
                <field id="title" translate="label" type="text" sortOrder="40" showInDefault="1" showInWebsite="1" showInStore="1">
                    <label>Title</label>
                </field>
                <field id="sort_order" translate="label" type="text" sortOrder="100" showInDefault="1" showInWebsite="1" showInStore="0">
                    <label>Sort Order</label>
                </field>
            </group>
        </section>
    </system>
</config>
`;
}

/**
 * Generate di.xml for dependency injection
 */
function generateDIXML(config: MagentoExtensionConfig): string {
  const [vendor, module] = config.moduleName.split('_');
  
  return `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">
    <type name="${vendor}\\${module}\\Model\\Carrier">
        <arguments>
            <argument name="config" xsi:type="object">${vendor}\\${module}\\Model\\Config</argument>
        </arguments>
    </type>
</config>
`;
}

/**
 * Generate Carrier model
 */
function generateCarrierModel(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return `<?php
namespace ${vendor}\\${module}\\Model;

use Magento\\Quote\\Model\\Quote\\Address\\RateRequest;
use Magento\\Shipping\\Model\\Carrier\\AbstractCarrier;
use Magento\\Shipping\\Model\\Carrier\\CarrierInterface;

class Carrier extends AbstractCarrier implements CarrierInterface
{
    protected $_code = 'veyexpress';
    
    protected $rateResultFactory;
    protected $rateMethodFactory;
    protected $apiClient;
    
    public function __construct(
        \\Magento\\Framework\\App\\Config\\ScopeConfigInterface $scopeConfig,
        \\Magento\\Quote\\Model\\Quote\\Address\\RateResult\\ErrorFactory $rateErrorFactory,
        \\Psr\\Log\\LoggerInterface $logger,
        \\Magento\\Shipping\\Model\\Rate\\ResultFactory $rateResultFactory,
        \\Magento\\Quote\\Model\\Quote\\Address\\RateResult\\MethodFactory $rateMethodFactory,
        ${vendor}\\${module}\\Model\\Api\\Client $apiClient,
        array $data = []
    ) {
        parent::__construct($scopeConfig, $rateErrorFactory, $logger, $data);
        $this->rateResultFactory = $rateResultFactory;
        $this->rateMethodFactory = $rateMethodFactory;
        $this->apiClient = $apiClient;
    }
    
    public function collectRates(RateRequest $request)
    {
        if (!$this->getConfigFlag('active')) {
            return false;
        }
        
        $result = $this->rateResultFactory->create();
        
        // Get rates from VeyExpress API
        $rates = $this->apiClient->getShippingRates($request);
        
        foreach ($rates as $rateData) {
            $method = $this->rateMethodFactory->create();
            $method->setCarrier($this->_code);
            $method->setCarrierTitle($this->getConfigData('title'));
            $method->setMethod($rateData['service_code']);
            $method->setMethodTitle($rateData['service_name']);
            $method->setPrice($rateData['cost']);
            $method->setCost($rateData['cost']);
            
            $result->append($method);
        }
        
        return $result;
    }
    
    public function getAllowedMethods()
    {
        return ['veyexpress' => $this->getConfigData('title')];
    }
}
`;
}

/**
 * Generate Config model
 */
function generateConfigModel(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return `<?php
namespace ${vendor}\\${module}\\Model;

use Magento\\Framework\\App\\Config\\ScopeConfigInterface;
use Magento\\Store\\Model\\ScopeInterface;

class Config
{
    const XML_PATH_API_KEY = 'carriers/veyexpress/api_key';
    const XML_PATH_ENVIRONMENT = 'carriers/veyexpress/environment';
    const XML_PATH_API_URL = 'carriers/veyexpress/api_url';
    
    protected $scopeConfig;
    
    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->scopeConfig = $scopeConfig;
    }
    
    public function getApiKey($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_API_KEY,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }
    
    public function getApiUrl($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_API_URL,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }
    
    public function isProduction($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_ENVIRONMENT,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) === 'production';
    }
}
`;
}

/**
 * Generate API Client
 */
function generateAPIClient(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return `<?php
namespace ${vendor}\\${module}\\Model\\Api;

use Magento\\Framework\\HTTP\\Client\\Curl;
use ${vendor}\\${module}\\Model\\Config;

class Client
{
    protected $curl;
    protected $config;
    
    public function __construct(Curl $curl, Config $config)
    {
        $this->curl = $curl;
        $this->config = $config;
    }
    
    public function getShippingRates($request)
    {
        $apiKey = $this->config->getApiKey();
        $apiUrl = $this->config->getApiUrl();
        
        $this->curl->addHeader('Authorization', 'Bearer ' . $apiKey);
        $this->curl->addHeader('Content-Type', 'application/json');
        
        $data = [
            'origin' => $this->getOriginAddress($request),
            'destination' => $this->getDestinationAddress($request),
            'package' => $this->getPackageData($request),
        ];
        
        $this->curl->post($apiUrl . '/shipping/rates', json_encode($data));
        $response = $this->curl->getBody();
        
        return json_decode($response, true);
    }
    
    public function trackShipment($trackingNumber)
    {
        $apiKey = $this->config->getApiKey();
        $apiUrl = $this->config->getApiUrl();
        
        $this->curl->addHeader('Authorization', 'Bearer ' . $apiKey);
        $this->curl->get($apiUrl . '/tracking/' . $trackingNumber);
        
        $response = $this->curl->getBody();
        return json_decode($response, true);
    }
    
    protected function getOriginAddress($request)
    {
        return [
            'country' => $request->getOrigCountryId(),
            'state' => $request->getOrigRegionCode(),
            'city' => $request->getOrigCity(),
            'postcode' => $request->getOrigPostcode(),
        ];
    }
    
    protected function getDestinationAddress($request)
    {
        return [
            'country' => $request->getDestCountryId(),
            'state' => $request->getDestRegionCode(),
            'city' => $request->getDestCity(),
            'postcode' => $request->getDestPostcode(),
        ];
    }
    
    protected function getPackageData($request)
    {
        return [
            'weight' => $request->getPackageWeight(),
            'value' => $request->getPackageValue(),
        ];
    }
}
`;
}

/**
 * Generate API Key block for admin
 */
function generateApiKeyBlock(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return `<?php
namespace ${vendor}\\${module}\\Block\\Adminhtml\\System\\Config;

use Magento\\Config\\Block\\System\\Config\\Form\\Field;

class ApiKey extends Field
{
    protected function _getElementHtml(\\Magento\\Framework\\Data\\Form\\Element\\AbstractElement $element)
    {
        $element->setData('comment', 'Get your API key from VeyExpress dashboard');
        return parent::_getElementHtml($element);
    }
}
`;
}

/**
 * Generate Tracking controller
 */
function generateTrackingController(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return `<?php
namespace ${vendor}\\${module}\\Controller\\Adminhtml\\Tracking;

use Magento\\Backend\\App\\Action;

class Index extends Action
{
    protected $resultPageFactory;
    
    public function __construct(
        Action\\Context $context,
        \\Magento\\Framework\\View\\Result\\PageFactory $resultPageFactory
    ) {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
    }
    
    public function execute()
    {
        $resultPage = $this->resultPageFactory->create();
        $resultPage->getConfig()->getTitle()->prepend(__('VeyExpress Tracking'));
        return $resultPage;
    }
}
`;
}

/**
 * Generate order view layout
 */
function generateOrderViewLayout(): string {
  return `<?xml version="1.0"?>
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <referenceContainer name="order.info.container">
            <block class="Magento\\Framework\\View\\Element\\Template" name="veyexpress.tracking" template="VeyExpress_Shipping::tracking.phtml" />
        </referenceContainer>
    </body>
</page>
`;
}

/**
 * Generate tracking template
 */
function generateTrackingTemplate(): string {
  return `<?php
/** @var \\Magento\\Framework\\View\\Element\\Template $block */
?>
<div class="veyexpress-tracking">
    <h3><?= __('Tracking Information') ?></h3>
    <!-- Tracking info will be displayed here -->
</div>
`;
}

/**
 * Generate composer.json
 */
function generateComposerJSON(vendor: string, module: string, config: MagentoExtensionConfig): string {
  return JSON.stringify({
    name: `${vendor.toLowerCase()}/${module.toLowerCase()}`,
    description: config.description,
    version: config.version,
    type: 'magento2-module',
    license: 'MIT',
    authors: [{
      name: config.author,
      email: 'support@veyexpress.com',
    }],
    require: {
      'php': '~7.4.0|~8.1.0',
      'magento/framework': '*',
      'magento/module-shipping': '*',
      'magento/module-sales': '*',
    },
    autoload: {
      files: ['registration.php'],
      psr4: {
        [`${vendor}\\${module}\\`]: '',
      },
    },
  }, null, 2);
}

/**
 * Generate README.md
 */
function generateREADME(config: MagentoExtensionConfig): string {
  return `# ${config.moduleName}

${config.description}

## Installation

\`\`\`bash
composer require ${config.moduleName.toLowerCase().replace('_', '/')}
php bin/magento module:enable ${config.moduleName}
php bin/magento setup:upgrade
php bin/magento cache:clean
\`\`\`

## Configuration

1. Go to Stores > Configuration > Sales > Shipping Methods
2. Find VeyExpress Shipping
3. Enter your API key
4. Configure settings

## Features

- 254-country support
- Real-time shipping rates
- Package tracking
- Multi-carrier integration

## Support

Visit https://veyexpress.com/support
`;
}

export default {
  generateMagentoExtension,
};
