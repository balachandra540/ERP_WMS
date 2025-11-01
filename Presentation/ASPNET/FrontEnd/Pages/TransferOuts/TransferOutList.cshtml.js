const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            warehouseFromListLookupData: [],
            warehouseToListLookupData: [],
            transferOutStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            transferReleaseDate: '',
            description: '',
            warehouseFromId: null,
            warehouseToId: null,
            status: null,
            errors: {
                transferReleaseDate: '',
                warehouseFromId: '',
                warehouseToId: '',
                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            allProductStocks: null,  // Map<string, decimal> for quick lookups
            availableProducts: []    // Filtered products for add-mode dropdown
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const transferReleaseDateRef = Vue.ref(null);
        const warehouseFromIdRef = Vue.ref(null);
        const warehouseToIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            debugger;
            // Reset all errors
            state.errors.transferReleaseDate = '';
            state.errors.warehouseFromId = '';
            state.errors.warehouseToId = '';
            state.errors.status = '';
            state.errors.description = '';

            let isValid = true;
            let hasValidRequestStock = false;

            // Header validation
            if (!state.transferReleaseDate) {
                state.errors.transferReleaseDate = 'Transfer Release Date is required.';
                isValid = false;
            }
            if (!state.warehouseFromId) {
                state.errors.warehouseFromId = 'Warehouse From is required.';
                isValid = false;
            }
            if (!state.warehouseToId) {
                state.errors.warehouseToId = 'Warehouse To is required.';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }

            // Secondary data validation (only at submit time, not in delete mode)
            if (!state.deleteMode && state.secondaryData.length > 0) {
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    changedRecords: [],
                    deletedRecords: [],
                    addedRecords: []
                };

                // Get current state of all secondary data
                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...batchChanges.changedRecords];

                // Apply batch changes to get final state
                for (let changed of (batchChanges.changedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (item.productId === changed.productId) ||
                        (item.id && item.id === changed.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
                    }
                }

                // Remove deleted items from validation
                for (let deleted of (batchChanges.deletedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (deleted.productId && item.productId === deleted.productId) ||
                        (deleted.id && item.id === deleted.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData.splice(index, 1);
                    }
                }

                // Add new items
                currentSecondaryData.push(...(batchChanges.addedRecords || []));

                // Validate requestStock quantities
                for (let item of currentSecondaryData) {
                    if (item.requestStock > 0) {
                        hasValidRequestStock = true;
                    } else if (item.requestStock < 0) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Validation Error',
                            text: 'Request Stock cannot be negative.',
                            confirmButtonText: 'OK'
                        });
                        isValid = false;
                        break;
                    }
                }

                // At least one item should have requestStock > 0
                if (isValid && !hasValidRequestStock) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'At least one item must have Request Stock greater than 0.',
                        confirmButtonText: 'OK'
                    });
                    isValid = false;
                }
            }

            return isValid;
        };
        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.transferReleaseDate = '';
            state.description = '';
            state.warehouseFromId = null;
            state.warehouseToId = null;
            state.status = null;
            state.errors = {
                transferReleaseDate: '',
                warehouseFromId: '',
                warehouseToId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
            state.allProductStocks = null;  // Clear cached stocks to avoid stale data
            state.availableProducts = [];   // Clear filtered products for next modal
            state.showComplexDiv = false;  // Hide complex UI on reset
            state.isSubmitting = false;    // Reset submission state
        };

        const transferReleaseDatePicker = {
            obj: null,
            create: () => {
                transferReleaseDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: state.transferReleaseDate ? new Date(state.transferReleaseDate) : null,
                    change: (e) => {
                        state.transferReleaseDate = e.value;
                    }
                });
                transferReleaseDatePicker.obj.appendTo(transferReleaseDateRef.value);
            },
            refresh: () => {
                if (transferReleaseDatePicker.obj) {
                    transferReleaseDatePicker.obj.value = state.transferReleaseDate ? new Date(state.transferReleaseDate) : null;
                }
            }
        };

        Vue.watch(
            () => state.transferReleaseDate,
            (newVal, oldVal) => {
                transferReleaseDatePicker.refresh();
                state.errors.transferReleaseDate = '';
            }
        );

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        const warehouseFromListLookup = {
            obj: null,
            create: () => {
                if (state.warehouseFromListLookupData && Array.isArray(state.warehouseFromListLookupData)) {
                    warehouseFromListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.warehouseFromListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Warehouse From',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.warehouseFromListLookupData, query);
                        },
                        change: async (e) => {
                            try {
                                // Update selected warehouse ID in state
                                state.warehouseFromId = e.value;

                                // Choose which ID to use for fetching
                                const modelId = state.modelId;
                                const warehouseId = state.warehouseFromId;

                                // Call populateSecondaryData with both parameters
                                await methods.populateSecondaryData(modelId, warehouseId);
                            } catch (error) {
                                console.error("Error fetching secondary data on warehouse change:", error);
                            }
                        }
                    });
                    warehouseFromListLookup.obj.appendTo(warehouseFromIdRef.value);
                }
            },
            refresh: () => {
                if (warehouseFromListLookup.obj) {
                    warehouseFromListLookup.obj.value = state.warehouseFromId
                }
            },
        };

        Vue.watch(
            () => state.warehouseFromId,
            (newVal, oldVal) => {
                warehouseFromListLookup.refresh();
                state.errors.warehouseFromId = '';
            }
        );

        const warehouseToListLookup = {
            obj: null,
            create: () => {
                if (state.warehouseToListLookupData && Array.isArray(state.warehouseToListLookupData)) {
                    warehouseToListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.warehouseToListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Warehouse To',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.warehouseToListLookupData, query);
                        },
                        change: (e) => {
                            state.warehouseToId = e.value;
                        }
                    });
                    warehouseToListLookup.obj.appendTo(warehouseToIdRef.value);
                }
            },
            refresh: () => {
                if (warehouseToListLookup.obj) {
                    warehouseToListLookup.obj.value = state.warehouseToId
                }
            },
        };

        Vue.watch(
            () => state.warehouseToId,
            (newVal, oldVal) => {
                warehouseToListLookup.refresh();
                state.errors.warehouseToId = '';
            }
        );

        const transferOutStatusListLookup = {
            obj: null,
            create: () => {
                if (state.transferOutStatusListLookupData && Array.isArray(state.transferOutStatusListLookupData)) {
                    transferOutStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.transferOutStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    transferOutStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (transferOutStatusListLookup.obj) {
                    transferOutStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                transferOutStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/TransferOut/GetTransferOutList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (transferReleaseDate, description, status, warehouseFromId, warehouseToId, createdById, items) => {
                try {
                    const response = await AxiosManager.post('/TransferOut/CreateTransferOut', {
                        transferReleaseDate,
                        description,
                        status,
                        warehouseFromId,
                        warehouseToId,
                        createdById,
                        items
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async function (
                id,
                transferReleaseDate,
                description,
                status,
                warehouseFromId,
                warehouseToId,
                updatedById,
                items,
                deletedItems
            ) {
                try {
                    // 🔍 DEBUG: Add these console logs FIRST
                    console.log('🔍 Items:', items);
                    console.log('🔍 DeletedItems:', deletedItems);
                    console.log('🔍 Items type:', Array.isArray(items));

                    const payload = {
                        id,
                        transferReleaseDate,
                        description,
                        status,
                        warehouseFromId,
                        warehouseToId,
                        updatedById,
                        items: items || [],           // ✅ Ensure it's never undefined
                        deletedItems: deletedItems || [] // ✅ Ensure it's never undefined
                    };

                    // 🔍 DEBUG: Log the final payload
                    console.log('🔍 Final Payload:', JSON.stringify(payload, null, 2));

                    const response = await AxiosManager.post(
                        '/TransferOut/UpdateTransferOut',
                        payload,
                        {
                            headers: {
                                'Content-Type': 'application/json' // ✅ Explicit header
                            }
                        }
                    );

                    return response.data;
                } catch (error) {
                    console.error('❌ Error in updateMainData:', error);
                    console.error('❌ Response data:', error.response?.data);
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/TransferOut/DeleteTransferOut', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getWarehouseFromListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getWarehouseToListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getTransferOutStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/TransferOut/GetTransferOutStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (modelId, warehouseId) => {
                debugger;
                try {
                    let response;

                    if (modelId) {
                        // Fetch data by transferOutId (moduleId)
                        response = await AxiosManager.get(`/InventoryTransaction/TransferOutGetInvenTransList?moduleId=${modelId}`);
                    } else if (warehouseId) {
                        // Fetch data by warehouseFromId
                        response = await AxiosManager.get(`/InventoryTransaction/FromWarehouseId?warehouseId=${warehouseId}`);
                    } else {
                        throw new Error("Either modelId or warehouseId must be provided.");
                    }

                    return response;
                } catch (error) {
                    console.error("Error in getSecondaryData:", error);
                    throw error;
                }
            },
            createSecondaryData: async (moduleId, productId, movement, createdById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferOutCreateInvenTrans', {
                        moduleId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferOutUpdateInvenTrans', {
                        id, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferOutDeleteInvenTrans', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Product/GetProductList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    transferReleaseDate: new Date(item.transferReleaseDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateWarehouseFromListLookupData: async () => {
                const response = await services.getWarehouseFromListLookupData();
                state.warehouseFromListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateWarehouseToListLookupData: async () => {
                const response = await services.getWarehouseToListLookupData();
                state.warehouseToListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateTransferOutStatusListLookupData: async () => {
                const response = await services.getTransferOutStatusListLookupData();
                state.transferOutStatusListLookupData = response?.data?.content?.data;
            },
            populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data
                    .filter(product => product.physical === true)
                    .map(product => ({
                        ...product,
                        numberName: `${product.number} - ${product.name}`
                    })) || [];
            },
            prepareSecondaryDataForSubmission: function () {
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };

                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...batchChanges.changedRecords];

                const matchRecord = (a, b) =>
                    (a.productId && b.productId && a.productId === b.productId) ||
                    (a.id && b.id && a.id === b.id);

                // Apply batch changes to get final state
                for (let changed of (batchChanges.changedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (item.productId === changed.productId) ||
                        (item.id && item.id === changed.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
                    }
                }

                // Remove deleted items (filter instead of splice)
                const deletedItems = batchChanges.deletedRecords || [];
                if (deletedItems.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deletedItems.some(deleted => matchRecord(item, deleted))
                    );
                }

                // Add new items
                if (batchChanges.addedRecords?.length) {
                    currentSecondaryData = [...currentSecondaryData, ...batchChanges.addedRecords];
                }

                // Final valid items (requestStock >= 0)
                const validItems = currentSecondaryData.filter(item =>
                    item.requestStock === undefined || item.requestStock >= 0
                );

                return { validItems, deletedItems };
            },
            populateSecondaryData: async (modelId, warehouseId) => {
                try {
                    if (modelId) {
                        // Load existing data (includes totalStock)
                        const response = await services.getSecondaryData(modelId, warehouseId);
                        state.secondaryData = response?.data?.content?.data?.map(item => ({
                            ...item,
                            createdAtUtc: new Date(item.createdAtUtc)
                        })) || [];
                    } else {
                        // New modal: Empty grid for manual adds
                        state.secondaryData = [];
                        // Pre-fetch all available stocks for lookups and filtered dropdown
                        if (warehouseId) {
                            const stockResponse = await services.getSecondaryData(null, warehouseId);
                            const stockData = stockResponse?.data?.content?.data || [];
                            state.allProductStocks = new Map(stockData.map(item => [item.productId, item.totalStock]));
                            // Filter products to only those with stock > 0
                            state.availableProducts = state.productListLookupData?.filter(
                                prod => state.allProductStocks?.has(prod.id)
                            ) || [];
                        } else {
                            state.allProductStocks = new Map();
                            state.availableProducts = [];
                        }
                    }

                    methods.refreshSummary();
                    secondaryGrid.refresh(state.secondaryData);  // Pass dataSource explicitly
                    state.showComplexDiv = true;

                } catch (error) {
                    console.error("Error populating secondary data:", error);
                    state.secondaryData = [];
                    state.allProductStocks = new Map();
                    state.availableProducts = [];
                    methods.refreshSummary();
                    secondaryGrid.refresh([]);
                    state.showComplexDiv = true;
                }
            },
            getProductStock: (productId) => {
                return state.allProductStocks?.get(productId) || 0;
            },
            //populateSecondaryData: async (modelId, warehouseId) => {
            //    try {
            //        // Prefer modelId if it exists, else use warehouseId
            //        const response = await services.getSecondaryData(modelId || null, warehouseId || null);

            //        state.secondaryData = response?.data?.content?.data?.map(item => ({
            //            ...item,
            //            createdAtUtc: new Date(item.createdAtUtc)
            //        })) || [];

            //        methods.refreshSummary();
            //        secondaryGrid.refresh();
            //        state.showComplexDiv = true;

            //    } catch (error) {
            //        console.error("Error populating secondary data:", error);
            //        state.secondaryData = [];
            //    }
            //},
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.transferReleaseDate = '';
                state.errors.warehouseFromId = '';
                state.errors.warehouseToId = '';
                state.errors.status = '';
            }
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    let response;
                    const userId = StorageManager.getUserId();
                    const { validItems, deletedItems } = methods.prepareSecondaryDataForSubmission();
                    if (state.id === '') {
                        // **CREATE NEW TRANSFER OUT WITH ITEMS IN ONE REQUEST**
                        const itemsDto = validItems.map(item => ({
                            productId: item.productId,
                            movement: item.requestStock
                        }));
                        response = await services.createMainData(
                            state.transferReleaseDate,
                            state.description,
                            state.status,
                            state.warehouseFromId,
                            state.warehouseToId,
                            userId,
                            itemsDto // Pass items as an additional parameter
                        );

                        if (response.code === 200) {
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            // No need for separate item creation calls; items are created in the single request
                        }
                    } else if (state.deleteMode) {
                        // **DELETE TRANSFER OUT**
                        response = await services.deleteMainData(state.id, userId);
                    } else {
                        // **UPDATE EXISTING TRANSFER OUT WITH ITEMS IN ONE REQUEST**
                        const itemsDto = validItems.map(item => ({
                            Id: item.id || null,  // Include ID for updates/deletes
                            productId: item.productId,
                            movement: item.requestStock
                        }));
                        const DeleteditemsDto = deletedItems.map(item => ({
                            Id: item.id || null  // Include ID for updates/deletes
                        }));

                        // Filter out deleted items (requestStock > 0; assume prepareSecondaryDataForSubmission handles this)
                        const filteredItemsDto = itemsDto.filter(item => item.movement > 0);

                        response = await services.updateMainData(
                            state.id,
                            state.transferReleaseDate,
                            state.description,
                            state.status,
                            state.warehouseFromId,
                            state.warehouseToId,
                            userId,
                            filteredItemsDto,  // Pass items for create/update/delete in single request
                            DeleteditemsDto
                        );

                        if (response.code === 200) {
                            // No need for separate secondary calls; all handled in single request
                        }
                    }

                    // **HANDLE RESPONSE**
                    if (response.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            // Refresh secondary data after successful save
                            await methods.populateSecondaryData();
                            secondaryGrid.refresh();

                            state.mainTitle = 'Edit Transfer Out';
                            state.showComplexDiv = true;
                            Swal.fire({
                                icon: 'success',
                                title: 'Save Successful',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Delete Successful',
                                text: 'Form will be closed...',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            setTimeout(() => {
                                mainModal.obj.hide();
                                resetFormState();
                            }, 2000);
                        }

                        // Clear deleted items after success
                        state.deletedItems = [];
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
                            text: response.data.message ?? 'Please check your data.',
                            confirmButtonText: 'Try Again'
                        });
                    }
                } catch (error) {
                    console.error('Submit error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'An Error Occurred',
                        text: error.response?.data?.message ?? 'Please try again.',
                        confirmButtonText: 'OK'
                    });
                } finally {
                    state.isSubmitting = false;
                }
            },
        };
        //const handler = {
        //    handleSubmit: async function () {
        //        try {
        //            state.isSubmitting = true;
        //            await new Promise(resolve => setTimeout(resolve, 300));

        //            if (!validateForm()) {
        //                return;
        //            }

        //            const response = state.id === ''
        //                ? await services.createMainData(state.transferReleaseDate, state.description, state.status, state.warehouseFromId, state.warehouseToId, StorageManager.getUserId())
        //                : state.deleteMode
        //                    ? await services.deleteMainData(state.id, StorageManager.getUserId())
        //                    : await services.updateMainData(state.id, state.transferReleaseDate, state.description, state.status, state.warehouseFromId, state.warehouseToId, StorageManager.getUserId());

        //            if (response.data.code === 200) {
        //                await methods.populateMainData();
        //                mainGrid.refresh();

        //                if (!state.deleteMode) {
        //                    state.mainTitle = 'Edit Transfer Out';
        //                    state.id = response?.data?.content?.data.id ?? '';
        //                    state.number = response?.data?.content?.data.number ?? '';
        //                    await methods.populateSecondaryData(state.id);
        //                    secondaryGrid.refresh();
        //                    state.showComplexDiv = true;

        //                    Swal.fire({
        //                        icon: 'success',
        //                        title: 'Save Successful',
        //                        timer: 2000,
        //                        showConfirmButton: false
        //                    });

        //                } else {
        //                    Swal.fire({
        //                        icon: 'success',
        //                        title: 'Delete Successful',
        //                        text: 'Form will be closed...',
        //                        timer: 2000,
        //                        showConfirmButton: false
        //                    });
        //                    setTimeout(() => {
        //                        mainModal.obj.hide();
        //                        resetFormState();
        //                    }, 2000);
        //                }

        //            } else {
        //                Swal.fire({
        //                    icon: 'error',
        //                    title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
        //                    text: response.data.message ?? 'Please check your data.',
        //                    confirmButtonText: 'Try Again'
        //                });
        //            }

        //        } catch (error) {
        //            Swal.fire({
        //                icon: 'error',
        //                title: 'An Error Occurred',
        //                text: error.response?.data?.message ?? 'Please try again.',
        //                confirmButtonText: 'OK'
        //            });
        //        } finally {
        //            state.isSubmitting = false;
        //        }
        //    },
        //};

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['TransferOuts']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateWarehouseFromListLookupData();
                await methods.populateWarehouseToListLookupData();
                await methods.populateTransferOutStatusListLookupData();
                numberText.create();
                transferReleaseDatePicker.create();
                warehouseFromListLookup.create();
                warehouseToListLookup.create();
                transferOutStatusListLookup.create();

                await secondaryGrid.create(state.secondaryData);
                await methods.populateProductListLookupData();

            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
        });

        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: '240px',
                    dataSource: dataSource,
                    allowFiltering: true,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: true,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: true,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'createdAtUtc', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: true,
                    showColumnMenu: true,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
                        },
                        { field: 'number', headerText: 'Number', width: 150, minWidth: 150 },
                        { field: 'transferReleaseDate', headerText: 'Release Date', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'warehouseFromName', headerText: 'Warehouse From', width: 150, minWidth: 150 },
                        { field: 'warehouseToName', headerText: 'Warehouse To', width: 150, minWidth: 150 },
                        { field: 'statusName', headerText: 'Status', width: 150, minWidth: 150 },
                        { field: 'createdAtUtc', headerText: 'Created At UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                        { text: 'Print PDF', tooltipText: 'Print PDF', id: 'PrintPDFCustom' },
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        mainGrid.obj.autoFitColumns(['number', 'transferReleaseDate', 'warehouseFromName', 'warehouseToName', 'statusName', 'createdAtUtc']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        }
                    },
                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length) {
                            mainGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: async (args) => {
                        if (args.item.id === 'MainGrid_excelexport') {
                            mainGrid.obj.excelExport();
                        }

                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'Add Transfer Out';
                            resetFormState();
                            state.showComplexDiv = false;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Transfer Out';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.transferReleaseDate = selectedRecord.transferReleaseDate ? new Date(selectedRecord.transferReleaseDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.warehouseFromId = selectedRecord.warehouseFromId ?? '';
                                state.warehouseToId = selectedRecord.warehouseToId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = true;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Transfer Out?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.transferReleaseDate = selectedRecord.transferReleaseDate ? new Date(selectedRecord.transferReleaseDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.warehouseFromId = selectedRecord.warehouseFromId ?? '';
                                state.warehouseToId = selectedRecord.warehouseToId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = false;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/TransferOuts/TransferOutPdf?id=' + (selectedRecord.id ?? ''), '_blank');
                            }
                        }
                    }
                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () => {
                mainGrid.obj.setProperties({ dataSource: state.mainData });
            }
        };     
                
        const secondaryGrid = {
            obj: null,
            productObj: null,
            totalStockObj: null,

            create: async (dataSource) => {
                const allowAdd = !dataSource || dataSource.length === 0;

                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource || [],
                    editSettings: {
                        allowEditing: true,
                        allowAdding: allowAdd,
                        allowDeleting: true,
                        showDeleteConfirmDialog: false,
                        mode: 'Batch'
                    },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'productId', direction: 'Ascending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50 },
                    selectionSettings: { persistSelection: true, type: 'Single', mode: 'Row' },
                    gridLines: 'Horizontal',
                    showColumnMenu: false,
                    autoFit: false,
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', headerText: 'Id', isPrimaryKey: true, visible: false },
                        
                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 250,
                            allowEditing: true,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            valueAccessor: (field, data, column) => {
                                const product = state.productListLookupData.find(item => item.id === data[field]);
                                return product ? `${product.numberName}` : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    const productElem = document.createElement('input');
                                    return productElem;
                                },
                                read: () => {
                                    return secondaryGrid.productObj?.value || null;
                                },
                                destroy: function () {
                                    if (secondaryGrid.productObj) {
                                        secondaryGrid.productObj.destroy();
                                        secondaryGrid.productObj = null;
                                    }
                                },
                                write: function (args) {
                                    const currentDataSource = secondaryGrid.obj?.dataSource || [];
                                    const isAddMode = currentDataSource.length === 0;
                                    const productDataSource = isAddMode && state.availableProducts?.length > 0
                                        ? state.availableProducts
                                        : state.productListLookupData || [];

                                    console.log('Creating dropdown with data source:', productDataSource.length, 'items');

                                    secondaryGrid.productObj = new ej.dropdowns.DropDownList({
                                        dataSource: productDataSource,
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        change: function (e) {
                                            const productId = e.value;
                                            console.log('Product changed:', productId);

                                            if (productId) {
                                                const stock = methods.getProductStock?.(productId) || 0;
                                                console.log('Retrieved stock:', stock);

                                                // Update rowData directly
                                                args.rowData.productId = productId;
                                                args.rowData.totalStock = stock;
                                                args.rowData.requestStock = 0;

                                                // Find the row element and update the NEXT td (totalStock column)
                                                const rowElement = args.row;
                                                const cellElements = rowElement.querySelectorAll('td');
                                                const tr = e.element.closest('tr.e-row');
                                                if (tr) {
                                                    const rowInfo = secondaryGrid.obj.getRowInfo(tr);
                                                    const rowIndex = rowInfo.rowIndex;
                                                    const totalStock = methods.getProductStock(e.value);
                                                    secondaryGrid.obj.updateCell(rowIndex, 'totalStock', totalStock);
                                                }

                                                // Update cellElements[3] which is the Total Stock column
                                                if (cellElements.length > 3) {

                                                    cellElements[3].innerText = parseFloat(stock).toFixed(2);
                                                }

                                                console.log('Updated total stock:', stock);
                                            } else {
                                                args.rowData.productId = null;
                                                args.rowData.totalStock = 0;
                                                args.rowData.requestStock = 0;

                                                const rowElement = args.row;
                                                const cellElements = rowElement.querySelectorAll('td');

                                                if (cellElements.length > 3) {
                                                    cellElements[3].innerText = '0.00';
                                                }
                                            }
                                        },
                                        placeholder: 'Select a Product',
                                        floatLabelType: 'Never'
                                    });
                                    secondaryGrid.productObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'totalStock',
                            headerText: 'Total Stock',
                            width: 150,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            allowEditing: false,
                            valueAccessor: (field, data) => {
                                const value = data[field];
                                if (value === null || value === undefined) return '0.00';
                                return parseFloat(value).toFixed(2);
                            },
                            editType: 'numericedit',
                            edit: {
                                create: () => {
                                    const totalStockElem = document.createElement('input');
                                    return totalStockElem;
                                },
                                read: () => {
                                    return secondaryGrid.totalStockObj?.value || 0;
                                },
                                destroy: function () {
                                    if (secondaryGrid.totalStockObj) {
                                        secondaryGrid.totalStockObj.destroy();
                                        secondaryGrid.totalStockObj = null;
                                    }
                                },
                                write: function (args) {
                                    secondaryGrid.totalStockObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.totalStock || 0,
                                        format: 'N2',
                                        decimals: 2,
                                        enabled: false, // Make it read-only since it's auto-calculated
                                        placeholder: '0.00',
                                        floatLabelType: 'Never'
                                    });
                                    secondaryGrid.totalStockObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'requestStock',
                            headerText: 'Request Stock',
                            width: 180,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            editType: 'numericedit',
                            validationRules: {
                                required: true,
                                min: 0,
                                custom: [
                                    (args) => {
                                        debugger
                                        // Fix: Access row data dynamically in batch mode
                                       const rowIndex = args.element.closest('.e-row').rowIndex;
                                       const rowObject = secondaryGrid.obj.getRowsObject()[rowIndex];
                                       const rowBatchData = rowObject.changes ?? rowObject.data;
                                       return args['value'] <= (rowBatchData.totalStock || 0);                                                                   
                                        
                                    },
                                    'Request Stock cannot be greater than Total Stock'
                                ]
                            },
                            edit: {
                                params: {
                                    decimals: 2,
                                    min: 0,
                                    step: 0.01,
                                    validateDecimalOnType: true,
                                    showSpinButton: true
                                }
                            }
                        }
                    ],
                    toolbar: allowAdd ? [
                        'Add',
                        { type: 'Separator' },
                        'ExcelExport',
                        { type: 'Separator' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ] : [
                        'ExcelExport',
                        { type: 'Separator' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ],
                    dataBound: () => {
                        if (secondaryGrid.obj?.toolbarModule) {
                            secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
                            if (allowAdd) {
                                secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_add'], true);
                            }
                        }
                    },
                    rowSelected: () => {
                        if (secondaryGrid.obj?.toolbarModule) {
                            const hasSelection = secondaryGrid.obj.getSelectedRecords().length === 1;
                            secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], hasSelection);
                        }
                    },
                    rowDeselected: () => {
                        if (secondaryGrid.obj?.toolbarModule) {
                            secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
                        }
                    },
                    rowSelecting: (args) => { },
                    toolbarClick: (args) => {
                        if (!args?.item) return;

                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj?.excelExport();
                        }
                        if (args.item.id === 'DeleteCustom') {
                            const selected = secondaryGrid.obj?.getSelectedRecords()[0];
                            if (selected) {
                                state.deletedItems = state.deletedItems || [];
                                state.deletedItems.push(selected);
                                secondaryGrid.obj?.deleteRecord();
                                methods.refreshSummary?.();
                            }
                        }
                    },
                    actionBegin: (args) => {
                        if (args.requestType === 'add') {
                            args.rowData = {
                                id: 'temp_' + Date.now(),
                                productId: null,
                                totalStock: 0,
                                requestStock: 0
                            };
                        }
                    },
                    actionComplete: (args) => {
                        if (args.requestType === 'save' || args.requestType === 'delete') {
                            methods.refreshSummary?.();
                        }

                        if (args.requestType === 'save') {
                            setTimeout(() => {
                                secondaryGrid.obj?.refresh();
                            }, 100);
                        }
                    },
                    cellSave: (args) => {
                        if (args.column.field === 'requestStock') {
                            const rowData = args.rowData || {};
                            const totalStock = parseFloat(rowData.totalStock) || 0;
                            const requestStock = parseFloat(args.value) || 0;

                            if (requestStock > totalStock) {
                                args.cancel = true;
                                alert('Request Stock cannot exceed Total Stock');
                            }
                        }
                    }
                });

                if (secondaryGridRef.value) {
                    secondaryGrid.obj.appendTo(secondaryGridRef.value);
                }
            },

            refresh: (dataSource) => {
                const allowAdd = !dataSource || dataSource.length === 0;

                if (secondaryGrid.obj) {
                    secondaryGrid.obj.setProperties({
                        dataSource: dataSource || [],
                        editSettings: {
                            ...secondaryGrid.obj.editSettings,
                            allowAdding: allowAdd
                        }
                    });

                    secondaryGrid.obj.toolbar = allowAdd ? [
                        'Add',
                        { type: 'Separator' },
                        'ExcelExport',
                        { type: 'Separator' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ] : [
                        'ExcelExport',
                        { type: 'Separator' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ];

                    secondaryGrid.obj.dataBind();
                    secondaryGrid.obj.refresh();
                }
            },

            // Method to update total stock externally if needed
            updateTotalStock: (productId, stock) => {
                if (secondaryGrid.totalStockObj) {
                    secondaryGrid.totalStockObj.value = stock;
                }

                // Also update any selected row data
                const selectedRecords = secondaryGrid.obj?.getSelectedRecords();
                if (selectedRecords && selectedRecords.length > 0) {
                    const selectedRecord = selectedRecords[0];
                    selectedRecord.totalStock = stock;
                    secondaryGrid.obj?.refresh();
                }
            },

            destroy: () => {
                if (secondaryGrid.productObj) {
                    secondaryGrid.productObj.destroy();
                    secondaryGrid.productObj = null;
                }
                if (secondaryGrid.totalStockObj) {
                    secondaryGrid.totalStockObj.destroy();
                    secondaryGrid.totalStockObj = null;
                }
                if (secondaryGrid.obj && !secondaryGrid.obj.isDestroyed) {
                    secondaryGrid.obj.destroy();
                    secondaryGrid.obj = null;
                }
            }
        };
        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        return {
            mainGridRef,
            mainModalRef,
            secondaryGridRef,
            numberRef,
            transferReleaseDateRef,
            warehouseFromIdRef,
            warehouseToIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');