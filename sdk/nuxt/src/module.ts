import { defineNuxtModule, addPlugin, createResolver, addComponent, addImports } from '@nuxt/kit';

export interface ModuleOptions {
  apiKey?: string;
  apiEndpoint?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@vey/nuxt',
    configKey: 'vey',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    apiKey: '',
    apiEndpoint: ''
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Add runtime config
    nuxt.options.runtimeConfig.public.vey = {
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint
    };

    // Add plugin
    addPlugin(resolver.resolve('./runtime/plugin'));

    // Auto-import components
    addComponent({
      name: 'VeyAddressForm',
      filePath: resolver.resolve('./runtime/components/AddressForm.vue')
    });

    // Auto-import composables
    addImports({
      name: 'useVey',
      from: resolver.resolve('./runtime/composables/useVey')
    });

    addImports({
      name: 'useAddressValidation',
      from: resolver.resolve('./runtime/composables/useAddressValidation')
    });
  }
});
