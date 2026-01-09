const App = {
    setup() {

        const state = Vue.reactive({
            searchAttribute: '',
            searchError: '',
            isSearching: false,

            resolvedAttributeType: '', // IMEI1 | IMEI2 | ServiceNo | Unknown

            resolvedAttributes: {
                imei1: '',
                imei2: '',
                serviceNo: ''
            },

            transactionHistory: [] // GRN / Sale / Transfer / Return / Scrap
        });
//        const services = {
//            getAttributesData: async (value) => {
//                const response = await AxiosManager.post("/GoodsReceive/searchAttribute?InputValue=" + value);
//                return response;
//            }
//,
        //        }
        const services = {
            getAttributesData: async (value) => {
                return await AxiosManager.post("/GoodsReceive/searchAttribute",
                    {
                        inputValue: value
                    }
                );
            }
        };

        
        const handler = {
            handleSearch: async () => {
                state.searchError = '';
                state.transactionHistory = [];
                state.resolvedAttributes = {
                    imei1: '',
                    imei2: '',
                    serviceNo: ''
                };
                state.resolvedAttributeType = '';

                const value = state.searchAttribute.trim();
                if (!value) {
                    state.searchError = 'Search attribute is required';
                    return;
                }

                try {
                    state.isSearching = true;

                    const response = await services.getAttributesData(value);
                    const data = response?.data?.content;

                    if (!data) {
                        state.searchError = 'No matching inventory found';
                        return;
                    }

                    // ✅ Backend decides attribute type
                    state.resolvedAttributeType = data.resolvedAttributeType || '';

                    // ✅ Bind attributes
                    state.resolvedAttributes.imei1 = data.attributes?.imeI1 || '';
                    state.resolvedAttributes.imei2 = data.attributes?.imeI2 || '';
                    state.resolvedAttributes.serviceNo = data.attributes?.serviceNo || '';

                    // ✅ Bind history
                    state.transactionHistory = data.history || [];

                } catch (err) {
                    console.error('❌ Inventory resolve failed', err);
                    state.searchError = err?.response?.data || 'Failed to resolve inventory';
                } finally {
                    state.isSearching = false;
                }
            }
        };


        return {
            state,
            handler
        };
    }
};

Vue.createApp(App).mount('#app');
