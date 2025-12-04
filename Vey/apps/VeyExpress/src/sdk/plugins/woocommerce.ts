/**
 * WooCommerce Plugin Generator
 * WooCommerceプラグイン自動生成
 * 
 * Generates a complete WooCommerce plugin from the VeyExpress SDK
 */

import { PluginManifest, PluginConfiguration } from '../../types';

export interface WooCommercePluginConfig extends PluginConfiguration {
  pluginName: string;
  pluginSlug: string;
  version: string;
  author: string;
  authorURI?: string;
  description: string;
  textDomain?: string;
  domainPath?: string;
  requiresWP?: string;
  requiresWooCommerce?: string;
}

/**
 * Generate WooCommerce plugin
 */
export async function generateWooCommercePlugin(
  config: WooCommercePluginConfig
): Promise<{ manifest: PluginManifest; files: Record<string, string> }> {
  const manifest: PluginManifest = {
    platform: 'woocommerce',
    version: config.version,
    name: config.pluginName,
    slug: config.pluginSlug,
    ...config,
  };

  const files: Record<string, string> = {
    'veyexpress.php': generateMainPluginFile(config),
    'includes/class-veyexpress.php': generateMainClass(config),
    'includes/class-veyexpress-shipping.php': generateShippingClass(config),
    'includes/class-veyexpress-tracking.php': generateTrackingClass(config),
    'includes/class-veyexpress-admin.php': generateAdminClass(config),
    'includes/class-veyexpress-api.php': generateAPIClass(config),
    'admin/settings.php': generateSettingsPage(config),
    'admin/tracking-page.php': generateTrackingPage(config),
    'templates/tracking-info.php': generateTrackingTemplate(config),
    'assets/css/admin.css': generateAdminCSS(),
    'assets/js/admin.js': generateAdminJS(config),
    'languages/veyexpress.pot': generateTranslationTemplate(),
    'readme.txt': generateReadme(config),
    'README.md': generateREADME(config),
  };

  return { manifest, files };
}

/**
 * Generate main plugin file
 */
function generateMainPluginFile(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * Plugin Name: ${config.pluginName}
 * Plugin URI: https://veyexpress.com/woocommerce
 * Description: ${config.description}
 * Version: ${config.version}
 * Author: ${config.author}
 * Author URI: ${config.authorURI || 'https://veyexpress.com'}
 * Text Domain: ${config.textDomain || config.pluginSlug}
 * Domain Path: ${config.domainPath || '/languages'}
 * Requires at least: ${config.requiresWP || '5.0'}
 * Requires PHP: 7.4
 * WC requires at least: ${config.requiresWooCommerce || '5.0'}
 * WC tested up to: 8.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('VEYEXPRESS_VERSION', '${config.version}');
define('VEYEXPRESS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('VEYEXPRESS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VEYEXPRESS_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Check if WooCommerce is active
 */
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', 'veyexpress_wc_missing_notice');
    return;
}

function veyexpress_wc_missing_notice() {
    echo '<div class="error"><p><strong>VeyExpress</strong> requires WooCommerce to be installed and active.</p></div>';
}

/**
 * Initialize the plugin
 */
require_once VEYEXPRESS_PLUGIN_DIR . 'includes/class-veyexpress.php';

function veyexpress_init() {
    return VeyExpress::instance();
}

// Initialize plugin
add_action('plugins_loaded', 'veyexpress_init');

/**
 * Activation hook
 */
register_activation_hook(__FILE__, 'veyexpress_activate');
function veyexpress_activate() {
    // Create plugin tables if needed
    // Set default options
    if (!get_option('veyexpress_api_key')) {
        add_option('veyexpress_api_key', '');
    }
}

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, 'veyexpress_deactivate');
function veyexpress_deactivate() {
    // Cleanup if needed
}
`;
}

/**
 * Generate main class
 */
function generateMainClass(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * Main VeyExpress class
 */
class VeyExpress {
    protected static $_instance = null;
    
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    
    public function __construct() {
        $this->includes();
        $this->init_hooks();
    }
    
    private function includes() {
        require_once VEYEXPRESS_PLUGIN_DIR . 'includes/class-veyexpress-shipping.php';
        require_once VEYEXPRESS_PLUGIN_DIR . 'includes/class-veyexpress-tracking.php';
        require_once VEYEXPRESS_PLUGIN_DIR . 'includes/class-veyexpress-admin.php';
        require_once VEYEXPRESS_PLUGIN_DIR . 'includes/class-veyexpress-api.php';
    }
    
    private function init_hooks() {
        add_action('woocommerce_shipping_init', array($this, 'init_shipping_method'));
        add_filter('woocommerce_shipping_methods', array($this, 'add_shipping_method'));
        
        // Admin hooks
        if (is_admin()) {
            new VeyExpress_Admin();
        }
        
        // Frontend hooks
        add_action('woocommerce_order_details_after_order_table', array($this, 'display_tracking_info'));
    }
    
    public function init_shipping_method() {
        new VeyExpress_Shipping();
    }
    
    public function add_shipping_method($methods) {
        $methods['veyexpress'] = 'VeyExpress_Shipping';
        return $methods;
    }
    
    public function display_tracking_info($order) {
        $tracking_number = get_post_meta($order->get_id(), '_veyexpress_tracking_number', true);
        if ($tracking_number) {
            wc_get_template('tracking-info.php', array('tracking_number' => $tracking_number), '', VEYEXPRESS_PLUGIN_DIR . 'templates/');
        }
    }
    
    public function get_api_key() {
        return get_option('veyexpress_api_key', '');
    }
}
`;
}

/**
 * Generate shipping class
 */
function generateShippingClass(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * VeyExpress Shipping Method
 */
class VeyExpress_Shipping extends WC_Shipping_Method {
    public function __construct($instance_id = 0) {
        $this->id = 'veyexpress';
        $this->instance_id = absint($instance_id);
        $this->method_title = __('VeyExpress', 'veyexpress');
        $this->method_description = __('Ship with VeyExpress - 254 country support', 'veyexpress');
        $this->supports = array(
            'shipping-zones',
            'instance-settings',
            'instance-settings-modal',
        );
        
        $this->init();
    }
    
    public function init() {
        $this->init_form_fields();
        $this->init_settings();
        
        $this->enabled = $this->get_option('enabled');
        $this->title = $this->get_option('title');
        
        add_action('woocommerce_update_options_shipping_' . $this->id, array($this, 'process_admin_options'));
    }
    
    public function init_form_fields() {
        $this->instance_form_fields = array(
            'enabled' => array(
                'title' => __('Enable/Disable', 'veyexpress'),
                'type' => 'checkbox',
                'label' => __('Enable VeyExpress Shipping', 'veyexpress'),
                'default' => 'yes',
            ),
            'title' => array(
                'title' => __('Method Title', 'veyexpress'),
                'type' => 'text',
                'description' => __('This controls the title which the user sees during checkout.', 'veyexpress'),
                'default' => __('VeyExpress Shipping', 'veyexpress'),
                'desc_tip' => true,
            ),
        );
    }
    
    public function calculate_shipping($package = array()) {
        // Get shipping rates from VeyExpress API
        $api = new VeyExpress_API();
        $rates = $api->get_shipping_rates($package);
        
        if (!empty($rates)) {
            foreach ($rates as $rate_data) {
                $rate = array(
                    'id' => $this->id . ':' . $rate_data['service_code'],
                    'label' => $rate_data['service_name'],
                    'cost' => $rate_data['cost'],
                    'calc_tax' => 'per_item',
                    'meta_data' => array(
                        'carrier' => $rate_data['carrier'],
                        'service_level' => $rate_data['service_level'],
                        'estimated_days' => $rate_data['estimated_days'],
                    ),
                );
                
                $this->add_rate($rate);
            }
        }
    }
}
`;
}

/**
 * Generate tracking class
 */
function generateTrackingClass(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * VeyExpress Tracking
 */
class VeyExpress_Tracking {
    public function get_tracking_info($tracking_number) {
        $api = new VeyExpress_API();
        return $api->track_shipment($tracking_number);
    }
    
    public function add_tracking_to_order($order_id, $tracking_number, $carrier = '') {
        update_post_meta($order_id, '_veyexpress_tracking_number', $tracking_number);
        update_post_meta($order_id, '_veyexpress_carrier', $carrier);
        
        // Send tracking email to customer
        $order = wc_get_order($order_id);
        $this->send_tracking_email($order, $tracking_number);
    }
    
    private function send_tracking_email($order, $tracking_number) {
        $to = $order->get_billing_email();
        $subject = __('Your order has been shipped', 'veyexpress');
        $message = sprintf(
            __('Your order #%s has been shipped. Tracking number: %s', 'veyexpress'),
            $order->get_order_number(),
            $tracking_number
        );
        
        wp_mail($to, $subject, $message);
    }
}
`;
}

/**
 * Generate admin class
 */
function generateAdminClass(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * VeyExpress Admin
 */
class VeyExpress_Admin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('VeyExpress', 'veyexpress'),
            __('VeyExpress', 'veyexpress'),
            'manage_woocommerce',
            'veyexpress',
            array($this, 'settings_page'),
            'dashicons-location',
            56
        );
        
        add_submenu_page(
            'veyexpress',
            __('Tracking', 'veyexpress'),
            __('Tracking', 'veyexpress'),
            'manage_woocommerce',
            'veyexpress-tracking',
            array($this, 'tracking_page')
        );
    }
    
    public function register_settings() {
        register_setting('veyexpress_settings', 'veyexpress_api_key');
        register_setting('veyexpress_settings', 'veyexpress_environment');
    }
    
    public function settings_page() {
        require_once VEYEXPRESS_PLUGIN_DIR . 'admin/settings.php';
    }
    
    public function tracking_page() {
        require_once VEYEXPRESS_PLUGIN_DIR . 'admin/tracking-page.php';
    }
    
    public function enqueue_scripts($hook) {
        if (strpos($hook, 'veyexpress') !== false) {
            wp_enqueue_style('veyexpress-admin', VEYEXPRESS_PLUGIN_URL . 'assets/css/admin.css', array(), VEYEXPRESS_VERSION);
            wp_enqueue_script('veyexpress-admin', VEYEXPRESS_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), VEYEXPRESS_VERSION, true);
        }
    }
}
`;
}

/**
 * Generate API class
 */
function generateAPIClass(config: WooCommercePluginConfig): string {
  return `<?php
/**
 * VeyExpress API Client
 */
class VeyExpress_API {
    private $api_key;
    private $api_url = 'https://api.veyexpress.com/v1';
    
    public function __construct() {
        $this->api_key = get_option('veyexpress_api_key', '');
    }
    
    public function get_shipping_rates($package) {
        $endpoint = '/shipping/rates';
        $data = array(
            'origin' => $this->get_origin_address(),
            'destination' => $package['destination'],
            'package' => array(
                'weight' => WC()->cart->get_cart_contents_weight(),
                'value' => WC()->cart->get_cart_contents_total(),
            ),
        );
        
        return $this->request('POST', $endpoint, $data);
    }
    
    public function track_shipment($tracking_number) {
        $endpoint = '/tracking/' . $tracking_number;
        return $this->request('GET', $endpoint);
    }
    
    private function request($method, $endpoint, $data = array()) {
        $url = $this->api_url . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ),
            'timeout' => 30,
        );
        
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    private function get_origin_address() {
        return array(
            'country' => WC()->countries->get_base_country(),
            'state' => WC()->countries->get_base_state(),
            'city' => WC()->countries->get_base_city(),
            'postcode' => WC()->countries->get_base_postcode(),
        );
    }
}
`;
}

/**
 * Generate settings page
 */
function generateSettingsPage(config: WooCommercePluginConfig): string {
  return `<?php
if (!defined('ABSPATH')) exit;
?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    <form method="post" action="options.php">
        <?php
        settings_fields('veyexpress_settings');
        do_settings_sections('veyexpress_settings');
        ?>
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('API Key', 'veyexpress'); ?></th>
                <td>
                    <input type="text" name="veyexpress_api_key" value="<?php echo esc_attr(get_option('veyexpress_api_key')); ?>" class="regular-text" />
                    <p class="description"><?php _e('Enter your VeyExpress API key', 'veyexpress'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Environment', 'veyexpress'); ?></th>
                <td>
                    <select name="veyexpress_environment">
                        <option value="production" <?php selected(get_option('veyexpress_environment'), 'production'); ?>>Production</option>
                        <option value="sandbox" <?php selected(get_option('veyexpress_environment'), 'sandbox'); ?>>Sandbox</option>
                    </select>
                </td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>
`;
}

/**
 * Generate tracking page
 */
function generateTrackingPage(config: WooCommercePluginConfig): string {
  return `<?php
if (!defined('ABSPATH')) exit;
?>
<div class="wrap">
    <h1><?php _e('Tracking', 'veyexpress'); ?></h1>
    <div id="veyexpress-tracking-dashboard">
        <!-- Tracking dashboard content -->
    </div>
</div>
`;
}

/**
 * Generate tracking template
 */
function generateTrackingTemplate(config: WooCommercePluginConfig): string {
  return `<?php
if (!defined('ABSPATH')) exit;
?>
<div class="veyexpress-tracking-info">
    <h3><?php _e('Tracking Information', 'veyexpress'); ?></h3>
    <p><?php _e('Tracking Number:', 'veyexpress'); ?> <strong><?php echo esc_html($tracking_number); ?></strong></p>
    <a href="https://track.veyexpress.com/<?php echo esc_attr($tracking_number); ?>" target="_blank" class="button">
        <?php _e('Track Package', 'veyexpress'); ?>
    </a>
</div>
`;
}

/**
 * Generate admin CSS
 */
function generateAdminCSS(): string {
  return `.veyexpress-tracking-info { margin: 20px 0; padding: 15px; background: #f8f9fa; border: 1px solid #ddd; }`;
}

/**
 * Generate admin JS
 */
function generateAdminJS(config: WooCommercePluginConfig): string {
  return `jQuery(document).ready(function($) { console.log('VeyExpress Admin loaded'); });`;
}

/**
 * Generate translation template
 */
function generateTranslationTemplate(): string {
  return `# Translation template for VeyExpress WooCommerce Plugin`;
}

/**
 * Generate readme.txt for WordPress.org
 */
function generateReadme(config: WooCommercePluginConfig): string {
  return `=== ${config.pluginName} ===
Contributors: veyexpress
Tags: shipping, woocommerce, logistics, tracking
Requires at least: ${config.requiresWP || '5.0'}
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: ${config.version}
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

${config.description}

== Description ==

VeyExpress provides comprehensive shipping solutions with 254-country support.

== Installation ==

1. Upload the plugin files to the \`/wp-content/plugins/veyexpress\` directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the VeyExpress settings page to configure the plugin
4. Enter your API key

== Changelog ==

= ${config.version} =
* Initial release
`;
}

/**
 * Generate README.md
 */
function generateREADME(config: WooCommercePluginConfig): string {
  return `# ${config.pluginName}

${config.description}

## Installation

1. Download the plugin
2. Upload to WordPress
3. Activate
4. Configure API key

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
  generateWooCommercePlugin,
};
