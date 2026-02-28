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
            availableProducts: [],   // Filtered products for add-mode dropdown
            activeDetailRow: [],
             isAddMode : false

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
                // Use the wrapper 'secondaryGrid', not '.obj'
                const batchChanges = secondaryGrid.getBatchChanges ? secondaryGrid.getBatchChanges() : {
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
            //state.transferReleaseDate = '';
            state.description = '';
            //state.warehouseFromId = null;
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

        //const transferReleaseDatePicker = {
        //    obj: null,
        //    create: () => {
        //        transferReleaseDatePicker.obj = new ej.calendars.DatePicker({
        //            placeholder: 'Select Date',
        //            format: 'yyyy-MM-dd',
        //            value: state.transferReleaseDate ? new Date(state.transferReleaseDate) : null,
        //            change: (e) => {
        //                state.transferReleaseDate = e.value;
        //            }
        //        });
        //        transferReleaseDatePicker.obj.appendTo(transferReleaseDateRef.value);
        //    },
        //    refresh: () => {
        //        if (transferReleaseDatePicker.obj) {
        //            transferReleaseDatePicker.obj.value = state.transferReleaseDate ? new Date(state.transferReleaseDate) : null;
        //        }
        //    }
        //};

        const transferReleaseDatePicker = {
            obj: null,

            create: () => {
                const defaultDate = state.transferReleaseDate
                    ? new Date(state.transferReleaseDate)
                    : new Date();

                transferReleaseDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false   // 🔒 disabled
                });

                // ✅ CRITICAL: manually sync state
                state.transferReleaseDate = defaultDate;

                transferReleaseDatePicker.obj.appendTo(transferReleaseDateRef.value);
            },

            refresh: () => {
                if (transferReleaseDatePicker.obj) {
                    const date = state.transferReleaseDate
                        ? new Date(state.transferReleaseDate)
                        : new Date();

                    transferReleaseDatePicker.obj.value = date;

                    // ✅ keep state in sync
                    state.transferReleaseDate = date;
                }
            }
        };

        //Vue.watch(
        //    () => state.transferReleaseDate,
        //    (newVal, oldVal) => {
        //        transferReleaseDatePicker.refresh();
        //        state.errors.transferReleaseDate = '';
        //    }
        //);
        const setDefaultDate = () => {
            if (!state.transferReleaseDate) {
                state.transferReleaseDate = new Date();
            }

            if (transferReleaseDatePicker.obj) {
                transferReleaseDatePicker.obj.value = new Date(state.transferReleaseDate);
            }
        };


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
                        allowFiltering: false,   // optional since only one item
                        enabled: true,           // will disable after selection
                        //filtering: (e) => {
                        //    e.preventDefaultAction = true;
                        //    let query = new ej.data.Query();
                        //    if (e.text !== '') {
                        //        query = query.where('name', 'startsWith', e.text, true);
                        //    }
                        //    e.updateData(state.warehouseFromListLookupData, query);
                        //},

                        change: async (e) => {
                            try {
                                state.warehouseFromId = e.value;

                                const modelId = state.modelId;
                                const warehouseId = state.warehouseFromId;

                                await methods.populateSecondaryData(modelId, warehouseId);
                            } catch (error) {
                                console.error("Error fetching secondary data:", error);
                            }
                        }
                    });
                    warehouseFromListLookup.obj.appendTo(warehouseFromIdRef.value);

                    // ✅ Get current location
                    const currentWarehouseId = StorageManager.getLocation();

                    // ✅ Select it
                    state.warehouseFromId = currentWarehouseId;
                    warehouseFromListLookup.obj.value = currentWarehouseId;

                    // ✅ Disable dropdown
                    warehouseFromListLookup.obj.enabled = false;
                }
            },
            refresh: () => {
                if (warehouseFromListLookup.obj) {
                    warehouseFromListLookup.obj.value = state.warehouseFromId;
                    //if (warehouseFromListLookup.obj.value)
                    //    warehouseFromListLookup.obj.enabled = false;
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
                    const wareHouseId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/TransferOut/GetTransferOutList?wareHouseId=' + wareHouseId, {});
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
                    const wareHouseId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList?id=' + wareHouseId, {});
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
            getProductIdByPLU: async (pluCode) => {
                try {
                    const response = await AxiosManager.get(
                        `/Product/GetProductIdByPLU?plu=${pluCode}`,
                        {}
                    );
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            GetProductAttributesByProductId: async ({ imei1, imei2, serviceNo }, productId) => {
                try {
                    let location = StorageManager.getLocation();
                    let query = "/Product/GetProductStockByProductId?";
                    query += `imei1=${imei1}&`;
                    query += `imei2=${imei2}&`;
                    query += `serviceNo=${serviceNo}&`;
                    query += `productId=${productId}&`;
                    query += `locationId=${location}&`;

                    // remove last &
                    query = query.endsWith("&") ? query.slice(0, -1) : query;

                    const response = await AxiosManager.get(query, {});
                    return response;

                } catch (error) {
                    throw error;
                }
            }

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
                //state.warehouseFromListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
                state.warehouseFromListLookupData = response?.data?.content?.data.filter(warehouse => (warehouse.type === "Store" || warehouse.type === "Store&Sales")) || [];

            },
            populateWarehouseToListLookupData: async () => {
                debugger
                const response = await services.getWarehouseToListLookupData();
                const currentWarehouseId =StorageManager.getLocation();
; // already known in state

                //state.warehouseToListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
                //state.warehouseToListLookupData = response?.data?.content?.data.filter(warehouse => (warehouse.type === "Store" || warehouse.type === "Store&Sales")) || [];
                state.warehouseToListLookupData =
                    response?.data?.content?.data.filter(w =>
                        (w.type === "Store" || w.type === "Store&Sales") &&
                        w.id !== currentWarehouseId
                    ) || [];
                //const presentWarehouseId = StorageManager.getLocation();
                //state.warehouseToListLookupData = response?.data?.content?.data.filter(w => w.id !== presentWarehouseId) || [];
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
                // Use the wrapper 'secondaryGrid', not '.obj'
                // Use the wrapper 'secondaryGrid', not '.obj'
                const batchChanges = secondaryGrid.getBatchChanges ? secondaryGrid.getBatchChanges() : {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };
                    //let currentSecondaryData = state.id !== ""
                    //    ? [...state.secondaryData]
                    //    : [...batchChanges.changedRecords];

                    
                    let currentSecondaryData = [...state.secondaryData];

                    const matchRecord = (a, b) =>
                        (a.productId && b.productId && a.pluCode && b.pluCode && a.productId === b.productId && a.pluCode == b.pluCode) ||
                        (a.id && b.id && a.id === b.id);

                    // -------------------------------
                    // Apply updates
                    // -------------------------------
                    for (const changed of batchChanges.changedRecords || []) {
                        const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                        if (index !== -1) {
                            currentSecondaryData[index] = {
                                ...currentSecondaryData[index], ...changed, // Preserve/apply specific fields if needed (from validateForm)
                                detailEntries: changed.detailEntries ?? currentSecondaryData[index].detailEntries
                            };
                        }
                    }

                // Remove deleted items (filter instead of splice)
                    const deletedItems = batchChanges.deletedRecords || [];
                    if (deletedItems.length > 0) {
                        currentSecondaryData = currentSecondaryData.filter(item =>
                            !deletedItems.some(deleted => matchRecord(item, deleted))
                        );
                    }

                    //// Add new items
                    //if (batchChanges.addedRecords?.length) {
                    //    currentSecondaryData.push(...batchChanges.addedRecords);
                    //}

                    // -------------------------------
                    // Collect attributes & errors
                    // -------------------------------
                    let hasErrors = false;
                    currentSecondaryData.forEach(item => {
                        const { Attributes, errors } =
                            methods.collectDetailAttributes(item);

                        item.detailEntries = Attributes;   // ✅ backend payload
                        item.errors = errors;        // ✅ UI validation
                        if (errors && errors.length > 0) {
                            hasErrors = true;
                        }
                        if (hasErrors) {
                            //Swal.fire({
                            //    icon: "error",
                            //    title: "Validation Failed",
                            //    html: errors.join("<br>")
                            //});
                            //return;
                            throw new Error("ATTRIBUTE_VALIDATION_FAILED"); 
                        }
                    });
                    

                    // -------------------------------
                    // Valid items only
                    // -------------------------------
                    const validItems = currentSecondaryData
                        .filter(item => item.requestStock === undefined || item.requestStock >= 0)
                        .map(item => ({
                            ...item,
                            detailEntries: JSON.parse(JSON.stringify(item.detailEntries))
                        }));



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
                            debugger;
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
                secondaryGrid.clearBatchChanges();


            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
                }

            },
            openDetailModal: (rowIndex) => {

                if (rowIndex === -1 || !state.secondaryData[rowIndex]) {
                    console.error("Row not found.");
                    return;
                }

                state.currentDetailRowIndex = rowIndex;

                const originalRow = state.secondaryData[rowIndex];

                // Deep clone row
                state.activeDetailRow = JSON.parse(JSON.stringify(originalRow));
                const rowData = state.activeDetailRow;

                // -------------------------------
                // LOAD PRODUCT
                // -------------------------------
                const product = state.productListLookupData.find(p => p.id === rowData.productId);

                if (!product) {
                    Swal.fire("Error", "Product not found.", "error");
                    return;
                }

                // -------------------------------
                // CHECK QUANTITY
                // -------------------------------
                const qty = parseInt(rowData.requestStock || 0);

                if (!qty || qty <= 0) {
                    document.getElementById("detailFormArea").innerHTML = `
            <div class="alert alert-warning text-center p-2">
                <strong>No Quantity Entered.</strong><br/>
                Please enter received quantity first.
            </div>
        `;

                    Swal.fire({
                        icon: "error",
                        title: "Validation Error",
                        text: "Please enter received quantity before adding attributes."
                    });
                    return;
                }

                // -------------------------------
                // BUILD FIELD LIST (CASE SAFE)
                // -------------------------------
                const fields = [];

                if (product.imei1) fields.push("imei1");
                if (product.imei2) fields.push("imei2");
                if (product.serviceNo) fields.push("serviceNo");

                const existingDetails = rowData.detailEntries || [];

                // -------------------------------
                // BUILD TABLE
                // -------------------------------
                let html = `
        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    ${fields.map(f => `<th>${f.toUpperCase()}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

                for (let i = 0; i < qty; i++) {
                    html += `<tr>`;

                    fields.forEach(field => {
                        //const value = existingDetails[i]?.[field] || existingDetails[i]?.[field.toLowerCase()] || "";
                        const detailRow = existingDetails[i] || {};

                        const value = Object.keys(detailRow).find(
                            k => k.toLowerCase() === field.toLowerCase()
                        )
                            ? detailRow[
                            Object.keys(detailRow).find(
                                k => k.toLowerCase() === field.toLowerCase()
                            )
                            ]
                            : "";

                        html += `
                <td>
                    <input type="text"
                           class="form-control detail-input"
                           data-index="${i}"
                           data-field="${field}"
                           value="${value}">
                </td>
            `;
                    });

                    html += `</tr>`;
                }

                html += `
            </tbody>
        </table>
    `;

                document.getElementById("detailFormArea").innerHTML = html;

                methods.attachDetailInputEvents(product);

                // -------------------------------
                // OPEN MODAL
                // -------------------------------
                const modalEl = document.getElementById("detailModal");
                const modal = new bootstrap.Modal(modalEl);
                modal.show();

                // Save button
                document.getElementById("detailSaveBtn").onclick = (e) => {
                    e.preventDefault();
                    methods.saveDetailEntries();
                    modal.hide();
                };

                // Fix scroll restore
                modalEl.addEventListener("hidden.bs.modal", () => {
                    const mainModal = document.getElementById("MainModal");
                    if (mainModal && mainModal.classList.contains("show")) {
                        document.body.classList.add("modal-open");
                    }
                });
            },
    //        openDetailModal:  (RowIndex) => {
    //            debugger;


    //            if (RowIndex === -1) {
    //                console.error("Row not found for PO:", saleItemId);
    //                return;
    //            }

    //            //state.currentDetailSaleItemId = saleItemId;
    //            state.currentDetailRowIndex = RowIndex;

    //            const originalRow = state.secondaryData[RowIndex];

    //            // -------------------------------------------------------
    //            // -------------------------------------------------------
    //            state.activeDetailRow = JSON.parse(JSON.stringify(originalRow));

    //            const rowData = state.activeDetailRow;

    //            // -------------------------------------------------------
    //            // 3. LOAD PRODUCT
    //            // -------------------------------------------------------
    //            const product = state.productListLookupData.find(p => p.id === rowData.productId);
    //            if (!product) {
    //                Swal.fire("Error", "Product not found.", "error");
    //                return;
    //            }

    //            // -------------------------------------------------------
    //            // 4. CHECK RECEIVED QUANTITY FIRST
    //            // -------------------------------------------------------
    //            const qty = parseFloat(rowData.requestStock || 0);

    //            if (!qty || qty <= 0) {
    //                document.getElementById("detailFormArea").innerHTML = `
    //        <div class="alert alert-warning text-center p-2">
    //            <strong>No Quantity Entered.</strong><br/>
    //            Please enter Received Quantity first.
    //        </div>
    //    `;
    //                Swal.fire({
    //                    icon: "error",
    //                    title: "Validation Error",
    //                    text: "Please enter received quantity before adding attributes."
    //                });
    //                return;
    //            }

    //            // -------------------------------------------------------
    //            // 5. BUILD FIELDS BASED ON PRODUCT CONFIG
    //            // -------------------------------------------------------
    //            let fields = [];
    //            if (product.imei1) fields.push("imeI1");
    //            if (product.imei2) fields.push("imeI2");
    //            if (product.serviceNo) fields.push("serviceNo");

    //            const existingDetails = rowData.detailEntries || [];

    //            // -------------------------------------------------------
    //            // 6. BUILD HTML TABLE
    //            // -------------------------------------------------------
    //            let html = `
    //    <table class="table table-bordered table-sm">
    //        <thead>
    //            <tr>
    //                ${fields.map(f => `<th>${f}</th>`).join("")}
    //            </tr>
    //        </thead>
    //        <tbody>
    //`;

    //            for (let i = 0; i < qty; i++) {
    //                html += `<tr>`;
    //                fields.forEach(field => {
    //                    const val =
    //                        existingDetails[i] && existingDetails[i][field]
    //                            ? existingDetails[i][field]
    //                            : "";
    //                    html += `
    //            <td>
    //                <input type="text" 
    //                       class="form-control detail-input"
    //                       data-index="${i}"
    //                       data-field="${field}"
    //                       value="${val}">
    //            </td>
    //        `;
    //                });
    //                html += `</tr>`;
    //            }

    //            html += `
    //        </tbody>
    //    </table>
    //`;

    //            document.getElementById("detailFormArea").innerHTML = html;

    //             methods.attachDetailInputEvents(product);


    //            // -------------------------------------------------------
    //            // 7. OPEN MODAL
    //            // -------------------------------------------------------
    //            const modalEl = document.getElementById("detailModal");
    //            const modal = new bootstrap.Modal(modalEl);
    //            modal.show();

    //            // -------------------------------------------------------
    //            // 8. Save: Merge values back into original row
    //            // -------------------------------------------------------
    //            document.getElementById("detailSaveBtn").onclick = (e) => {
    //                e.preventDefault();
    //                methods.saveDetailEntries();
    //                modal.hide();
    //            };

    //            // -------------------------------------------------------
    //            // 9. FIX SCROLL ISSUE — Restore main modal scroll
    //            // -------------------------------------------------------
    //            modalEl.addEventListener("hidden.bs.modal", () => {
    //                const mainModal = document.getElementById("MainModal");
    //                if (mainModal.classList.contains("show")) {
    //                    document.body.classList.add("modal-open");
    //                }
    //            });
    //        },
            showInlineError: (input, message) => {
                let errorEl = input.nextElementSibling;

                if (!errorEl || !errorEl.classList.contains("imei-error")) {
                    errorEl = document.createElement("div");
                    errorEl.className = "imei-error";
                    input.after(errorEl);
                }

                errorEl.textContent = message;
            },

            clearInlineError: (input) => {
                const errorEl = input.nextElementSibling;
                if (errorEl && errorEl.classList.contains("imei-error")) {
                    errorEl.remove();
                }
            },
            injectDetailStyles: () => {
                if (document.getElementById("detail-inline-styles")) return;

                const style = document.createElement("style");
                style.id = "detail-inline-styles";
                style.innerHTML = `
                        .imei-error {
                            color: #dc3545;
                            font-size: 12px;
                            margin-top: 2px;
                        }

                        .auto-filled {
                            background-color: #e8f5e9 !important;
                            border-color: #28a745 !important;
                        }
                    `;

                document.head.appendChild(style);
            },

            attachDetailInputEvents: (product) => {

                // 🔥 Ensure styles exist
                methods.injectDetailStyles();

                const inputs = document.querySelectorAll(".detail-input");

                inputs.forEach(input => {

                    // ---------------------------
                    // KEYDOWN (restrict characters)
                    // ---------------------------
                    input.addEventListener("keydown", (e) => {
                        //const field = input.dataset.field
                        const field = input.dataset.field.toLowerCase();

                        const key = e.key;

                        if (field.toUpperCase() === "IMEI1" || field.toUpperCase() === "IMEI2") {
                            const isDigit =
                                /^\d$/.test(key) ||
                                ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key);

                            if (!isDigit) e.preventDefault();
                        } else {
                            const isValid =
                                /^[a-zA-Z0-9]$/.test(key) ||
                                ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key);

                            if (!isValid) e.preventDefault();
                        }
                    });

                    // ---------------------------
                    // KEYUP + CHANGE
                    // ---------------------------
                    const handler = async () => {
                         methods.handleDetailValueChange(input, product);
                    };

                    input.addEventListener("keyup", handler);
                    input.addEventListener("change", handler);
                });
            },

            //handleDetailValueChange:  async (input, product) => {
            //    const value = input.value.trim();
            //    const field = input.dataset.field;
            //    const index = parseInt(input.dataset.index, 10);

            //    // ---------------------------
            //    // IMEI VALIDATION
            //    // ---------------------------
            //    if (field.toUpperCase() === "IMEI1" || field.toUpperCase() === "IMEI2") {

            //        if (value.length > 0 && value.length < 15) {
            //            methods.showInlineError(input, `${field} must be 15 digits`);
            //            return;
            //        }

            //        if (value.length === 15 && !/^\d{15}$/.test(value)) {
            //            methods.showInlineError(input, `${field} must contain only digits`);
            //            return;
            //        }
            //    }

            //    if (!value) {
            //        methods.clearInlineError(input);
            //        return;
            //    }

            //    // ---------------------------
            //    // BUILD IDENTIFIER PAYLOAD
            //    // ---------------------------
            //    let imei1Value = '';
            //    let imei2Value = '';
            //    let serviceNoValue = '';

            //    if (field === "imeI1") imei1Value = value;
            //    if (field === "imeI2") imei2Value = value;
            //    if (field === "serviceNo") serviceNoValue = value;

            //    try {
            //        const response =await services.GetProductAttributesByProductId(
            //            {
            //                imei1: imei1Value,
            //                imei2: imei2Value,
            //                serviceNo: serviceNoValue
            //            },
            //            product.id
            //        );

            //        const data = response?.data?.content;

            //        // ❌ NO MATCH
            //        if (!data || !data.attributes || data.attributes.length === 0) {
            //            methods.showInlineError(input, "No matching stock found");
            //            return;
            //        }

            //        // ✅ EXACT MATCH (backend already filtered)
            //        const matched = data.attributes[0];

            //        // ---------------------------
            //        // ENSURE STATE
            //        // ---------------------------
            //        if (!state.activeDetailRow.detailEntries) {
            //            state.activeDetailRow.detailEntries = [];
            //        }
            //        if (!state.activeDetailRow.detailEntries[index]) {
            //            state.activeDetailRow.detailEntries[index] = {};
            //        }

            //        // Save current value
            //        state.activeDetailRow.detailEntries[index][field] = value;

            //        // ---------------------------
            //        // AUTO-BIND REMAINING FIELDS (NEW)
            //        // ---------------------------
            //         methods.autoBindRemainingFieldsFromApi(
            //            index,
            //            matched,
            //            field
            //        );

            //        methods.clearInlineError(input);

            //        //document.getElementById("detailSaveBtn").onclick = () => {
            //        //    methods.saveDetailEntries();
            //        //    modal.hide();
            //        //};


            //    } catch (error) {
            //        console.error("❌ IMEI lookup failed:", error);
            //        Swal.fire({
            //            icon: "error",
            //            title: "Error",
            //            text: "Failed to fetch product stock",
            //            timer: 2000
            //        });
            //    }
            //},


            //autoBindRemainingFieldsFromApi:  (index, matched, matchedField) => {

            //    const fieldMap = {
            //        imeI1: matched.imeI1,
            //        imeI2: matched.imeI2,
            //        serviceNo: matched.serviceNo
            //    };

            //    Object.keys(fieldMap).forEach(field => {

            //        if (field === matchedField) return;

            //        const val = fieldMap[field];
            //        if (!val) return;

            //        //if (state.activeDetailRow.detailEntries[index][field]) return;

            //        // Save to state
            //        state.activeDetailRow.detailEntries[index][field] = val;

            //        // Bind to UI
            //        const input = document.querySelector(
            //            `.detail-input[data-index="${index}"][data-field="${field}"]`
            //        );

            //        if (input) {
            //            input.value = val;
            //            //input.readOnly = true;
            //            input.classList.add("auto-filled");
            //        }
            //    });

            //    // Lock the entered field also
            //    const matchedInput = document.querySelector(
            //        `.detail-input[data-index="${index}"][data-field="${matchedField}"]`
            //    );

            //    if (matchedInput) {
            //        matchedInput.readOnly = true;
            //        matchedInput.classList.add("auto-filled");
            //    }
            //},
            handleDetailValueChange: async (input, product) => {
                debugger;
                const value = input.value.trim();
                //const field = input.dataset.field; // always camelCase now
                const field = input.dataset.field.toLowerCase(); // always camelCase now
                const index = parseInt(input.dataset.index, 10);

                // ---------------------------
                // IMEI VALIDATION (CASE SAFE)
                // ---------------------------
                if (field === "imei1" || field === "imei2") {

                    if (value.length > 0 && value.length < 15) {
                        methods.showInlineError(input, `${field.toUpperCase()} must be 15 digits`);
                        return;
                    }

                    if (value.length === 15 && !/^\d{15}$/.test(value)) {
                        methods.showInlineError(input, `${field.toUpperCase()} must contain only digits`);
                        return;
                    }
                }

                if (!value) {
                    methods.clearInlineError(input);
                    return;
                }

                // ---------------------------
                // BUILD IDENTIFIER PAYLOAD (CASE SAFE)
                // ---------------------------
                let imei1Value = "";
                let imei2Value = "";
                let serviceNoValue = "";

                if (field === "imei1") imei1Value = value;
                if (field === "imei2") imei2Value = value;
                if (field === "serviceNo") serviceNoValue = value;

                try {

                    const response = await services.GetProductAttributesByProductId(
                        {
                            imei1: imei1Value,
                            imei2: imei2Value,
                            serviceNo: serviceNoValue
                        },
                        product.id
                    );

                    const data = response?.data?.content;

                    // ❌ NO MATCH
                    if (!data || !data.attributes || data.attributes.length === 0) {
                        methods.showInlineError(input, "No matching stock found");
                        return;
                    }
                    debugger;

                    // ✅ MATCH FOUND
                    const matched = data.attributes[0];

                    // ---------------------------
                    // ENSURE STATE STRUCTURE
                    // ---------------------------
                    if (!state.activeDetailRow.detailEntries) {
                        state.activeDetailRow.detailEntries = [];
                    }

                    if (!state.activeDetailRow.detailEntries[index]) {
                        state.activeDetailRow.detailEntries[index] = {};
                    }

                    // Save entered value
                    state.activeDetailRow.detailEntries[index][field] = value;

                    // ---------------------------
                    // AUTO BIND REMAINING FIELDS
                    // ---------------------------
                    methods.autoBindRemainingFieldsFromApi(
                        index,
                        matched,
                        field
                    );

                    methods.clearInlineError(input);

                } catch (error) {

                    console.error("IMEI lookup failed:", error);

                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to fetch product stock",
                        timer: 2000
                    });
                }
            },
            autoBindRemainingFieldsFromApi: (index, matched, matchedField) => {

                // ---------------------------
                // SAFE FIELD MAP (camelCase only)
                // ---------------------------
                const fieldMap = {
                    imei1: matched.imei1 || matched.imeI1,
                    imei2: matched.imei2 || matched.imeI2,
                    serviceNo: matched.serviceNo
                };

                Object.keys(fieldMap).forEach(field => {

                    if (field === matchedField) return;

                    const val = fieldMap[field];
                    if (!val) return;

                    // Ensure state structure
                    if (!state.activeDetailRow.detailEntries[index]) {
                        state.activeDetailRow.detailEntries[index] = {};
                    }

                    // Save into state
                    state.activeDetailRow.detailEntries[index][field] = val;

                    // Bind to UI
                    const input = document.querySelector(
                        `.detail-input[data-index="${index}"][data-field="${field}"]`
                    );

                    if (input) {
                        input.value = val;
                        input.classList.add("auto-filled");
                    //    input.readOnly = true;
                    }
                });

                // ---------------------------
                // Lock matched input also
                // ---------------------------
                const matchedInput = document.querySelector(
                    `.detail-input[data-index="${index}"][data-field="${matchedField}"]`
                );

                if (matchedInput) {
                    //matchedInput.readOnly = true;
                    matchedInput.classList.add("auto-filled");
                }
            },
            //saveDetailEntries:  () => {


            //    const rowIndex = state.currentDetailRowIndex;
            //    let entries = [];
            //    const inputs = document.querySelectorAll(".detail-input");

            //    inputs.forEach(input => {
            //        const i = input.dataset.index;
            //        const f = input.dataset.field;

            //        if (!entries[i]) entries[i] = {};
            //        entries[i][f] = input.value;
            //    });

            //    state.secondaryData[rowIndex].detailEntries = entries;

            //    const rowData = state.secondaryData[rowIndex];

            //    if (rowData.detailEntries.length !== rowData.requestStock) {
            //        Swal.fire({
            //            icon: "error",
            //            title: "Requested stock not matching with Attributes length",
            //        });
            //        return;
            //    }
            //    secondaryGrid.refresh(state.secondaryData);

            //    console.log("Saved:", entries);
            //},
            saveDetailEntries: () => {

                const rowIndex = state.currentDetailRowIndex;
                if (rowIndex == null) return;

                const entries = [];
                const inputs = document.querySelectorAll(".detail-input");

                inputs.forEach(input => {
                    const index = parseInt(input.dataset.index);
                    //const field = input.dataset.field;
                    const field = input.dataset.field.toLowerCase();


                    if (!entries[index]) entries[index] = {};

                    entries[index][field] = input.value.trim();
                });

                const rowData = state.secondaryData[rowIndex];

                rowData.detailEntries = entries.filter(e => e); // remove empty gaps

                // -------------------------------
                // Validate quantity match
                // -------------------------------
                if (rowData.detailEntries.length !== parseInt(rowData.requestStock)) {
                    Swal.fire({
                        icon: "error",
                        title: "Quantity mismatch",
                        text: "Requested stock does not match attribute rows."
                    });
                    return;
                }

                secondaryGrid.refresh(state.secondaryData);

                console.log("Saved detail entries:", rowData.detailEntries);
            },
            collectDetailAttributes: (row) => {
                const Attributes = [];
                const errors = [];

                // -------------------------------
                // Find product metadata
                // -------------------------------
                const product = state.productListLookupData.find(p => p.id === row.productId);
                if (!product) {
                    errors.push(`Product not found for productId = ${row.productId}`);
                    return { Attributes, errors };
                }

                const requiresAttributes = product.imei1 || product.imei2 || product.serviceNo;

                // -------------------------------
                // Required attribute validation
                // -------------------------------
                if (requiresAttributes && (!row.detailEntries || row.detailEntries.length === 0)) {
                    errors.push(`Please enter required product attributes (IMEI / Service No)`);
                    return { Attributes, errors };
                }

                const localIMEI1 = new Set();
                const localIMEI2 = new Set();
                const localServiceNo = new Set();

                // -------------------------------
                // Iterate detailEntries
                // -------------------------------
                (row.detailEntries || []).forEach((entry, index) => {

                    //const imei1 = (entry.imeI1 || "").trim();
                    //const imei2 = (entry.imeI2 || "").trim();
                    //const serviceNo = (entry.serviceNo || "").trim();
                    const imei1 = (entry.imei1 || entry.imeI1 || null).trim();
                    const imei2 = (entry.imei2 || entry.imeI2 || null).trim();
                    const serviceNo = (entry.serviceno || entry.serviceNo || null).trim();
                    // -------------------------------
                    // REQUIRED FIELD VALIDATION
                    // -------------------------------
                    if (product.imei1 && !imei1)
                        errors.push(`IMEI1 missing at row ${index + 1}`);

                    if (product.imei2 && !imei2)
                        errors.push(`IMEI2 missing at row ${index + 1}`);

                    if (product.serviceNo && !serviceNo)
                        errors.push(`Service No missing at row ${index + 1}`);

                    // -------------------------------
                    // FORMAT VALIDATION
                    // -------------------------------
                    if (imei1 && !/^\d{15}$/.test(imei1))
                        errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);

                    if (imei2 && !/^\d{15}$/.test(imei2))
                        errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);

                    // -------------------------------
                    // IMEI1 ≠ IMEI2
                    // -------------------------------
                    if (imei1 && imei2 && imei1 === imei2)
                        errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);

                    // -------------------------------
                    // LOCAL DUPLICATE CHECK
                    // -------------------------------
                    if (imei1 && localIMEI1.has(imei1))
                        errors.push(`Duplicate IMEI1 (${imei1}) at row ${index + 1}`);

                    if (imei2 && localIMEI2.has(imei2))
                        errors.push(`Duplicate IMEI2 (${imei2}) at row ${index + 1}`);

                    if (serviceNo && localServiceNo.has(serviceNo))
                        errors.push(`Duplicate Service No (${serviceNo}) at row ${index + 1}`);

                    localIMEI1.add(imei1);
                    localIMEI2.add(imei2);
                    localServiceNo.add(serviceNo);

                    // -------------------------------
                    // ADD TO PAYLOAD
                    // -------------------------------
                    Attributes.push({
                        RowIndex: index,
                        IMEI1: imei1 || null,
                        IMEI2: imei2 || null,
                        ServiceNo: serviceNo || null
                    });
                });

                // -------------------------------
                // Quantity vs attributes validation
                // -------------------------------
                if (
                    requiresAttributes &&
                    row.requestStock != null &&
                    Attributes.length !== row.requestStock
                ) {
                    errors.push(
                        `Requested quantity (${row.requestStock}) does not match attributes count (${Attributes.length})`
                    );
                }

                return { Attributes, errors };
            },


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

                    let SecondaryDataresult;
                    try {
                        SecondaryDataresult = methods.prepareSecondaryDataForSubmission();
                    } catch (e) {
                        if (e.message === "ATTRIBUTE_VALIDATION_FAILED") {
                            Swal.fire({
                                icon: "error",
                                title: "Validation Failed",
                                html: "Submission stopped due to Attributes validation error"
                            });
                            return; // ⛔ HARD STOP
                        }
                        throw e; // unknown error
                    }

                    const { validItems, deletedItems } = SecondaryDataresult;

                    //const { validItems, deletedItems } = methods.prepareSecondaryDataForSubmission();
                    if (state.id === '') {
                        // **CREATE NEW TRANSFER OUT WITH ITEMS IN ONE REQUEST**
                        const itemsDto = validItems.map(item => ({
                            productId: item.productId,
                            movement: item.requestStock,
                             Details: item.detailEntries
                        //    Details: [...item.detailEntries]
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

                        if (response.data.code === 200) {
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
                            movement: item.requestStock,
                            Details: item.detailEntries,
                            //Details: [...item.detailEntries]

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
                            response.data = {};
                            response.data.code = response.code;
                        }
                    }

                    // **HANDLE RESPONSE**
                    if (response.data.code === 200) {
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
                            setTimeout(() => {
                                mainModal.obj.hide();
                                resetFormState();
                            }, 1500);

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
                state.warehouseFromId = StorageManager.getLocation();

                await SecurityManager.authorizePage(['TransferOuts']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);
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
                            state.isAddMode = true;
                            resetFormState();
                            state.secondaryData = [];
                            // Create new grid properly
                            if (secondaryGrid.obj == null) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.refresh();
                            }
                            //setDefaultDate();
                            state.showComplexDiv = true;
                            mainModal.obj.show();
                        }
                        
                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            state.isAddMode = false;

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
                            state.isAddMode = false;

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
                            state.isAddMode = false;

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
        let gridObj;
        const secondaryGrid = {
            obj: null,

            // 🔥 BATCH TRACKING
            manualBatchChanges: {
                addedRecords: [],
                changedRecords: [],
                deletedRecords: []
            },

            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource,
                    editSettings: {
                        allowEditing: true,
                        allowAdding: true,
                        allowDeleting: true,
                        showDeleteConfirmDialog: true,
                        mode: 'Normal',
                        allowEditOnDblClick: true
                    },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    created: function () {
                        gridObj = this;
                    },
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'productName', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: false,
                    showColumnMenu: false,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false },

                        // ============================================
                        // 🔥 PLU CODE COLUMN (FROM FIRST IMPLEMENTATION)
                        // ============================================
                        //{
                        //    field: "pluCode",
                        //    headerText: "PLU Code",
                        //    width: 140,
                        //    editType: "stringedit",
                        //    validationRules: { required: true },
                        //    edit: {
                        //        create: () => {
                        //            let pluElem = document.createElement("input");
                        //            return pluElem;
                        //        },
                        //        read: () => pluObj?.value,
                        //        destroy: () => pluObj?.destroy(),

                        //        write: (args) => {
                        //            pluObj = new ej.inputs.TextBox({
                        //                value: args.rowData.pluCode ?? "",
                        //                cssClass: 'plu-editor',
                        //                placeholder: "Enter 5+ characters"
                        //            });

                        //            pluObj.appendTo(args.element);
                        //            const inputElement = pluObj.element;

                        //            // 🔥 INPUT VALIDATION - Only alphanumeric
                        //            inputElement.addEventListener('keydown', (e) => {
                        //                const key = e.key;
                        //                const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
                        //                    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

                        //                if (!isValidKey) {
                        //                    e.preventDefault();
                        //                    console.log('❌ Invalid character blocked:', key);
                        //                }
                        //            });

                        //            // 🔥 KEYUP EVENT - Real-time validation
                        //            inputElement.addEventListener('keyup', async (e) => {
                        //                const enteredPLU = inputElement.value?.trim() ?? "";
                        //                console.log('⬆️ KEYUP Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                        //                if (enteredPLU.length < 5) {
                        //                    console.log('⏳ Waiting for more characters... (' + enteredPLU.length + '/5)');
                        //                    return;
                        //                }

                        //                try {
                        //                    console.log('📡 Calling API for PLU:', enteredPLU);
                        //                    const result = await services.getProductIdByPLU(enteredPLU);
                        //                    const productId = result?.data?.content?.productId;

                        //                    if (!productId) {
                        //                        Swal.fire({
                        //                            icon: 'warning',
                        //                            title: 'Invalid PLU',
                        //                            text: 'No product found for this PLU code',
                        //                            timer: 2000,
                        //                            showConfirmButton: false
                        //                        });
                        //                        console.log('❌ No product found for PLU:', enteredPLU);
                        //                        return;
                        //                    }

                        //                    console.log('✅ Product found - ID:', productId);
                        //                    args.rowData.productId = productId;

                        //                    // 🔥 UPDATE PRODUCT DROPDOWN
                        //                    if (productObj) {
                        //                        productObj.value = productId;
                        //                        productObj.dataBind();
                        //                        productObj.change({ value: productId });
                        //                        const GridData = gridObj.dataSource;
                        //                        // 🔎 check if same product already exists
                        //                        const existingRow = GridData.find(r => r.productId === productId);
                        //                        if (existingRow && existingRow.pluCode === enteredPLU) {
                        //                            // ✅ SAME ITEM  AGAIN
                        //                            existingRow.requestStock = (existingRow.requestStock || 1) + 1;
                        //                            gridObj.refresh();
                        //                            return; // ⛔ stop further processing
                        //                        }
                        //                        if (requestStockObj) {
                        //                            requestStockObj.value = 1;
                        //                        }
                        //                    }

                        //                    // 🔥 UPDATE TOTAL STOCK - CRITICAL FIX
                        //                    const stock = methods.getProductStock?.(productId) || 0;
                        //                    if (totalStockObj) {
                        //                        totalStockObj.value = stock;
                        //                        totalStockObj.readOnly = true;
                        //                        console.log('✅ Total Stock updated:', stock);
                        //                    }

                        //                } catch (error) {
                        //                    console.error('❌ KEYUP Error:', error);
                        //                    Swal.fire({
                        //                        icon: 'error',
                        //                        title: 'Error',
                        //                        text: 'Failed to fetch product details',
                        //                        timer: 2000
                        //                    });
                        //                }
                        //            });

                        //            // 🔥 CHANGE EVENT - Final validation
                        //            inputElement.addEventListener('change', async (e) => {
                        //                const enteredPLU = inputElement.value?.trim() ?? "";
                        //                console.log('📝 CHANGE Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                        //                if (!enteredPLU || enteredPLU.length < 5) {
                        //                    console.log('❌ PLU too short, skipping API call');
                        //                    return;
                        //                }

                        //                try {
                        //                    const result = await services.getProductIdByPLU(enteredPLU);
                        //                    const productId = result?.data?.content?.productId;

                        //                    if (!productId) {
                        //                        Swal.fire({
                        //                            icon: 'warning',
                        //                            title: 'Invalid PLU',
                        //                            text: 'No product found for this PLU code',
                        //                            timer: 2000,
                        //                            showConfirmButton: false
                        //                        });
                        //                        return;
                        //                    }

                        //                    args.rowData.productId = productId;
                        //                    if (productObj) {
                        //                        productObj.value = productId;
                        //                        productObj.dataBind();
                        //                        productObj.change({ value: productId });
                        //                        const GridData = gridObj.dataSource;
                        //                        // 🔎 check if same product already exists
                        //                        const existingRow = GridData.find(r => r.productId === productId);
                        //                        if (existingRow && existingRow.pluCode === enteredPLU) {
                        //                            // ✅ SAME ITEM  AGAIN
                        //                            existingRow.requestStock = (existingRow.requestStock || 1) + 1;
                        //                            gridObj.refresh();
                        //                            return; // ⛔ stop further processing
                        //                        }
                        //                        if (requestStockObj) {
                        //                            requestStockObj.value = 1;
                        //                        }


                        //                    }

                        //                } catch (error) {
                        //                    console.error('❌ CHANGE Error:', error);
                        //                }
                        //            });
                        //        }
                        //    }
                        //},
                        {
                            field: "pluCode",
                            headerText: "PLU Code",
                            width: 140,
                            editType: "stringedit",
                            validationRules: { required: true },
                            edit: {
                                create: () => {
                                    let pluElem = document.createElement("input");
                                    return pluElem;
                                },
                                read: () => pluObj?.value,
                                destroy: () => pluObj?.destroy(),

                                write: (args) => {
                                    pluObj = new ej.inputs.TextBox({
                                        value: args.rowData.pluCode ?? "",
                                        cssClass: 'plu-editor',
                                        placeholder: "Enter 5+ characters"
                                    });
                                    pluObj.appendTo(args.element);

                                    const inputElement = pluObj.element;
                                    let pluDebounce = null;
                                    let isProcessing = false;

                                    // ── HELPER A: Populate editor objects + rowData ──────────
                                    const applyProductToObjs = (productId, product, qty = 1) => {
                                        const stock = methods.getProductStock?.(productId) || 0;

                                        if (productObj) { productObj.value = productId; productObj.dataBind(); }
                                        if (totalStockObj) { totalStockObj.value = stock; totalStockObj.readOnly = true; }
                                        if (requestStockObj) requestStockObj.value = qty;

                                        args.rowData.productId = productId;
                                        args.rowData.requestStock = qty;
                                        args.rowData.totalStock = stock;
                                    };

                                    // ── HELPER B: Recalculate persisted row data ─────────────
                                    const recalcRowData = (rowData, productId, newQty) => {
                                        const stock = methods.getProductStock?.(productId) || 0;
                                        rowData.requestStock = newQty;
                                        rowData.totalStock = stock;
                                    };

                                    // ── HELPER C: Open attribute modal + auto-add next row ───
                                    const openAttributeModalWithAutoNext = async (rowData) => {
                                        debugger;
                                        //let rowIndex = state.secondaryData
                                        //    .findIndex(r => r === rowData || (r.id && r.id === rowData.id));
                                        let rowIndex = state.secondaryData.findIndex(r =>
                                           ( r.productId === rowData.productId &&
                                                r.pluCode === rowData.pluCode) || (r.id && r.id === rowData.id)
                                        );
                                        let injected = false;

                                        if (rowIndex === -1) {
                                            rowIndex = state.secondaryData.length;
                                            state.secondaryData.push(rowData);
                                            injected = true;
                                        }

                                        const detailModalEl = document.getElementById('detailModal');
                                        const autoAddNextRow = () => {
                                            console.log('🔄 Attribute modal closed → auto-adding next row');

                                            setTimeout(() => {
                                                if (!secondaryGrid.obj.isEdit) {
                                                    secondaryGrid.obj.addRecord();
                                                }
                                            }, 100);

                                            detailModalEl?.removeEventListener('hidden.bs.modal', autoAddNextRow);
                                        };

                                        detailModalEl?.addEventListener('hidden.bs.modal', autoAddNextRow);

                                        await methods.openDetailModal(rowIndex);

                                        if (injected && !rowData.id) {
                                            state.secondaryData.splice(rowIndex, 1);
                                        }
                                    };

                                    // ── CORE: processPLU ─────────────────────────────────────
                                    const processPLU = async (enteredPLU) => {
                                        if (isProcessing) return;
                                        if (!enteredPLU || enteredPLU.length < 5) return;

                                        isProcessing = true;
                                        console.log('🔍 Processing PLU:', enteredPLU);

                                        try {
                                            const result = await services.getProductIdByPLU(enteredPLU);
                                            const productId = result?.data?.content?.productId;

                                            if (!productId) {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Invalid PLU',
                                                    text: 'No product found for this PLU code',
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                });
                                                return;
                                            }

                                            const product = state.productListLookupData.find(p => p.id === productId);
                                            const hasAttributes = !!(product?.imei1 || product?.imei2 || product?.serviceNo);

                                            // ── Duplicate check ───────────────────────────────
                                            const allGridData = [
                                                ...state.secondaryData,
                                                ...secondaryGrid.manualBatchChanges.addedRecords
                                            ];
                                            const duplicateRow = allGridData.find(r => r.pluCode === enteredPLU);

                                            if (duplicateRow) {
                                                // ════════════════ DUPLICATE PATH ═════════════════
                                                console.log('♻️  Duplicate detected, incrementing quantity');

                                                secondaryGrid.obj.closeEdit();

                                                const newQty = (parseFloat(duplicateRow.requestStock) || 0) + 1;
                                                recalcRowData(duplicateRow, productId, newQty);

                                                const isAddedRecord = secondaryGrid.manualBatchChanges
                                                    .addedRecords.includes(duplicateRow);

                                                if (!isAddedRecord) {
                                                    const alreadyTracked = secondaryGrid.manualBatchChanges
                                                        .changedRecords.find(r => r.id === duplicateRow.id);
                                                    if (alreadyTracked) {
                                                        Object.assign(alreadyTracked, duplicateRow);
                                                    } else {
                                                        secondaryGrid.manualBatchChanges.changedRecords.push(duplicateRow);
                                                    }
                                                }

                                                secondaryGrid.obj.setProperties({
                                                    dataSource: [...secondaryGrid.obj.dataSource]
                                                });

                                                methods.refreshSummary?.();
                                                console.log(`✅ Duplicate PLU "${enteredPLU}" → requestStock = ${newQty}`);

                                                if (hasAttributes) {
                                                    await openAttributeModalWithAutoNext(duplicateRow);
                                                } else {
                                                    setTimeout(() => {
                                                        if (!secondaryGrid.obj.isEdit) {
                                                            secondaryGrid.obj.addRecord();
                                                        }
                                                    }, 100);
                                                }

                                            } else {
                                                // ═════════════ NEW PRODUCT PATH ══════════════════
                                                console.log('✨ New product, committing row');

                                                // 1. Force blur to sync value with Syncfusion Grid's validation
                                                inputElement.blur();
                                                inputElement.dispatchEvent(new Event('change', { bubbles: true }));

                                                // 2. Set rowData and apply to UI components
                                                args.rowData.pluCode = enteredPLU;
                                                applyProductToObjs(productId, product, 1);

                                                const committedRow = args.rowData;

                                                // 3. Delay to allow Syncfusion validation state to securely update
                                                setTimeout(() => {
                                                    // Commit the row 
                                                    secondaryGrid.obj.endEdit();
                                                    console.log(`✅ New PLU "${enteredPLU}" → row committed`);

                                                    // 4. Wait for grid's save cycle (actionComplete) to finish fully
                                                    setTimeout(() => {
                                                        if (hasAttributes) {
                                                            console.log('🎯 Opening attribute modal for first scan');
                                                            openAttributeModalWithAutoNext(committedRow);
                                                        } else {
                                                            // No attributes → add next row automatically
                                                            if (!secondaryGrid.obj.isEdit) {
                                                                secondaryGrid.obj.addRecord();
                                                            }
                                                        }
                                                    }, 400);
                                                }, 100);
                                            }
                                        } catch (error) {
                                            console.error('❌ PLU Processing Error:', error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'Failed to process PLU code. Please try again.',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });
                                        } finally {
                                            isProcessing = false;
                                        }
                                    };

                                    // ── EVENT: keydown (Enter → immediate, block invalid) ────
                                    inputElement.addEventListener('keydown', (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            clearTimeout(pluDebounce);
                                            processPLU(inputElement.value?.trim() ?? "");
                                            return;
                                        }

                                        const isValidKey = /^[a-zA-Z0-9]$/.test(e.key) ||
                                            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);

                                        if (!isValidKey) {
                                            e.preventDefault();
                                        }
                                    });

                                    // ── EVENT: keyup (300ms debounce for manual typing) ──────
                                    inputElement.addEventListener('keyup', (e) => {
                                        if (e.key === 'Enter') return;
                                        clearTimeout(pluDebounce);

                                        const enteredPLU = inputElement.value?.trim() ?? "";
                                        if (enteredPLU.length < 5) return;

                                        pluDebounce = setTimeout(() => processPLU(enteredPLU), 300);
                                    });
                                }
                            }
                        },

                        // ============================================
                        // 🔥 PRODUCT DROPDOWN COLUMN
                        // ============================================
                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 250,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            allowEditing: false,
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
                                    return productObj?.value;
                                },
                                destroy: function () {
                                    if (productObj) {
                                        productObj.destroy();
                                    }
                                },
                                write: function (args) {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        placeholder: 'Select a Product',
                                        floatLabelType: 'Never',
                                        enabled: false,

                                        change: function (e) {
                                            if (e.value) {
                                                console.log('📦 Product selected:', e.value);

                                                // 🔥 FETCH AND UPDATE TOTAL STOCK
                                                try {
                                                    const stock = methods.getProductStock?.(e.value) || 0;
                                                    console.log('Retrieved stock for product', e.value, ':', stock);

                                                    if (totalStockObj) {
                                                        totalStockObj.value = stock;
                                                        totalStockObj.readOnly = true;
                                                        console.log('✅ Total Stock updated to:', stock);
                                                    } else {
                                                        console.warn('⚠️ totalStockObj not initialized');
                                                    }
                                                } catch (error) {
                                                    console.error('❌ Error updating total stock:', error);
                                                }
                                            }
                                        }
                                    });
                                    productObj.appendTo(args.element);
                                }
                            }
                        },

                        // ============================================
                        // 🔥 TOTAL STOCK COLUMN (Read-only)
                        // ============================================
                        {
                            field: 'totalStock',
                            headerText: 'Total Stock',
                            width: 150,
                            type: 'number',
                            format: 'N0',
                            textAlign: 'Right',
                            allowEditing: false,
                            editType: 'numericedit',
                            edit: {
                                create: () => {
                                    const totalStockElem = document.createElement('input');
                                    return totalStockElem;
                                },
                                read: () => {
                                    return totalStockObj ? totalStockObj.value : 0;
                                },
                                destroy: function () {
                                    if (totalStockObj) {
                                        totalStockObj.destroy();
                                        totalStockObj = null;
                                    }
                                },
                                write: function (args) {
                                    const currentStock = args.rowData.productId
                                        ? (methods.getProductStock?.(args.rowData.productId) || 0)
                                        : 0;

                                    totalStockObj = new ej.inputs.NumericTextBox({
                                        value: currentStock,
                                        format: 'N0',
                                        readOnly: true,
                                        enabled: false,
                                        cssClass: 'e-readonly-column'
                                    });
                                    totalStockObj.appendTo(args.element);
                                }
                            }
                        },

                        // ============================================
                        // 🔥 REQUEST STOCK COLUMN (Editable)
                        // ============================================
                        {
                            field: 'requestStock',
                            headerText: 'Request Stock',
                            width: 200,
                            validationRules: {
                                required: true,
                                custom: [(args) => args['value'] > 0, 'Must be a positive number and not zero']
                            },
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            edit: {
                                create: () => {
                                    const requestStockElem = document.createElement('input');
                                    return requestStockElem;
                                },
                                read: () => {
                                    return requestStockObj ? requestStockObj.value : null;
                                },
                                destroy: function () {
                                    if (requestStockObj) {
                                        requestStockObj.destroy();
                                        requestStockObj = null;
                                    }
                                },
                                write: function (args) {
                                    requestStockObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.requestStock ?? 0,
                                        min: 1,
                                        format: 'N2'
                                    });
                                    requestStockObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'details',
                            headerText: 'Attributes',
                            width: 120,
                            disableHtmlEncode: false,

                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(p => p.id === data.productId);
                                if (!product) return '';
                                debugger;
                                const canShow =
                                    product.imei1 || product.imei2 || product.serviceNo;

                                if (!canShow) return '';   // hide link, not column

                                return `
        <a href="#" class="view-details"> Attributes </a>
    `;
                            }
                            ,

                            // Needed to allow HTML inside cell
                            allowEditing: false
                        },

                    ],
                    toolbar: [
                        'ExcelExport',
                        { type: 'Separator' },
                        'Add', 'Edit', 'Delete', 'Update', 'Cancel',
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () { },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
                        }
                    },
                    rowSelecting: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length) {
                            secondaryGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: (args) => {
                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj.excelExport();
                        }
                    },

                    // 🔥 BATCH CHANGE TRACKING
                    actionComplete: async (args) => {
                        // ROW ADDED
                        if (args.requestType === 'save' && args.action === 'add') {
                            // 🔥 VALIDATE PLU CODE BEFORE ADDING
                            if (!args.data.pluCode || args.data.pluCode.trim().length < 5) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Invalid PLU Code',
                                    text: 'PLU Code must be at least 5 characters',
                                    timer: 2000
                                });
                                // Remove the invalid row from tracking
                                secondaryGrid.manualBatchChanges.addedRecords =
                                    secondaryGrid.manualBatchChanges.addedRecords.filter(r => r.id !== args.data.id);
                                return;
                            }

                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
                            console.log('✅ Row Added to Batch:', args.data);
                            console.log('📋 Current Batch:', secondaryGrid.manualBatchChanges);
                        }

                        // ROW EDITED
                        if (args.requestType === 'save' && args.action === 'edit') {
                            // 🔥 VALIDATE PLU CODE BEFORE UPDATING
                            if (!args.data.pluCode || args.data.pluCode.trim().length < 5) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Invalid PLU Code',
                                    text: 'PLU Code must be at least 5 characters',
                                    timer: 2000
                                });
                                return;
                            }

                            const index = secondaryGrid.manualBatchChanges.changedRecords.findIndex(
                                r => r.id === args.data?.id
                            );
                            if (index > -1) {
                                secondaryGrid.manualBatchChanges.changedRecords[index] = args.data;
                            } else {
                                secondaryGrid.manualBatchChanges.changedRecords.push(args.data);
                            }
                            console.log('🔄 Row Modified in Batch:', args.data);
                            console.log('📋 Current Batch:', secondaryGrid.manualBatchChanges);
                        }

                        // ROW DELETED
                        if (args.requestType === 'delete') {
                            secondaryGrid.manualBatchChanges.deletedRecords.push(args.data[0]);
                            console.log('❌ Row Deleted from Batch:', args.data[0]);
                            console.log('📋 Current Batch:', secondaryGrid.manualBatchChanges);
                        }

                        if (args.requestType === 'add') {
                            // Wait for grid internal focus to finish
                            setTimeout(() => {
                                // Find the PLU input in the newly added row
                                const pluInput = document.querySelector('.e-addedrow .plu-editor input');

                                if (pluInput) {
                                    // Focus and place cursor at end
                                    pluInput.focus();
                                    const length = pluInput.value.length;
                                    pluInput.setSelectionRange(length, length);

                                    console.log('🎯 Cursor placed in PLU input');
                                }
                            }, 150); // small delay to override checkbox auto-focus
                        }


                        methods.refreshSummary?.();
                    },
                    queryCellInfo: (args) => {
                        if (args.column.field === 'details') {
                            debugger;
                            const link = args.cell.querySelector('.view-details');

                            if (link) {
                                link.addEventListener('click', (e) => {
                                    debugger;
                                    e.preventDefault();
                                    const rowIndex = e.currentTarget.closest('.e-row').rowIndex;
                                    methods.openDetailModal(rowIndex);
                                });
                            }
                        }
                    },
                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            getBatchChanges: () => {
                return secondaryGrid.manualBatchChanges;
            },

            clearBatchChanges: () => {
                secondaryGrid.manualBatchChanges = {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };
                console.log('✅ Batch changes cleared');
            },

            getBatchSummary: () => {
                return {
                    totalAdded: secondaryGrid.manualBatchChanges.addedRecords.length,
                    totalChanged: secondaryGrid.manualBatchChanges.changedRecords.length,
                    totalDeleted: secondaryGrid.manualBatchChanges.deletedRecords.length,
                    grandTotal: secondaryGrid.manualBatchChanges.addedRecords.length +
                        secondaryGrid.manualBatchChanges.changedRecords.length +
                        secondaryGrid.manualBatchChanges.deletedRecords.length
                };
            },

            refresh: () => {
                if (secondaryGrid.obj) {
                    secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
                }
            },//  CLEAR BATCH CHANGES (after successful save)
            destroy: () => {
                if (secondaryGrid.obj) {
                    secondaryGrid.obj.destroy();
                    secondaryGrid.obj = null;
                }
            }
        };

        //const secondaryGrid = {
        //    obj: null,
        //    productObj: null,
        //    totalStockObj: null,

        //    create: async (dataSource) => {
        //        const allowAdd = !dataSource || dataSource.length === 0;

        //        secondaryGrid.obj = new ej.grids.Grid({
        //            height: 400,
        //            dataSource: dataSource || [],
        //            editSettings: {
        //                allowEditing: true,
        //                allowAdding: allowAdd,
        //                allowDeleting: true,
        //                showDeleteConfirmDialog: false,
        //                mode: 'Batch'
        //            },
        //            allowFiltering: false,
        //            allowSorting: true,
        //            allowSelection: true,
        //            allowGrouping: false,
        //            allowTextWrap: true,
        //            allowResizing: true,
        //            allowPaging: false,
        //            allowExcelExport: true,
        //            filterSettings: { type: 'CheckBox' },
        //            sortSettings: { columns: [{ field: 'productId', direction: 'Ascending' }] },
        //            pageSettings: { currentPage: 1, pageSize: 50 },
        //            selectionSettings: { persistSelection: true, type: 'Single', mode: 'Row' },
        //            gridLines: 'Horizontal',
        //            showColumnMenu: false,
        //            autoFit: false,
        //            columns: [
        //                { type: 'checkbox', width: 60 },
        //                { field: 'id', headerText: 'Id', isPrimaryKey: true, visible: false },
                        
        //                {
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 250,
        //                    allowEditing: true,
        //                    validationRules: { required: true },
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        const product = state.productListLookupData.find(item => item.id === data[field]);
        //                        return product ? `${product.numberName}` : '';
        //                    },
        //                    editType: 'dropdownedit',
        //                    edit: {
        //                        create: () => {
        //                            const productElem = document.createElement('input');
        //                            return productElem;
        //                        },
        //                        read: () => {
        //                            return secondaryGrid.productObj?.value || null;
        //                        },
        //                        destroy: function () {
        //                            if (secondaryGrid.productObj) {
        //                                secondaryGrid.productObj.destroy();
        //                                secondaryGrid.productObj = null;
        //                            }
        //                        },
        //                        write: function (args) {
        //                            const currentDataSource = secondaryGrid.obj?.dataSource || [];
        //                            const isAddMode = currentDataSource.length === 0;
        //                            const productDataSource = isAddMode && state.availableProducts?.length > 0
        //                                ? state.availableProducts
        //                                : state.productListLookupData || [];

        //                            console.log('Creating dropdown with data source:', productDataSource.length, 'items');

        //                            secondaryGrid.productObj = new ej.dropdowns.DropDownList({
        //                                dataSource: productDataSource,
        //                                fields: { value: 'id', text: 'numberName' },
        //                                value: args.rowData.productId,
        //                                change: function (e) {
        //                                    const productId = e.value;
        //                                    console.log('Product changed:', productId);

        //                                    if (productId) {
        //                                        const stock = methods.getProductStock?.(productId) || 0;
        //                                        console.log('Retrieved stock:', stock);

        //                                        // Update rowData directly
        //                                        args.rowData.productId = productId;
        //                                        args.rowData.totalStock = stock;
        //                                        args.rowData.requestStock = 0;

        //                                        // Find the row element and update the NEXT td (totalStock column)
        //                                        const rowElement = args.row;
        //                                        const cellElements = rowElement.querySelectorAll('td');
        //                                        const tr = e.element.closest('tr.e-row');
        //                                        if (tr) {
        //                                            const rowInfo = secondaryGrid.obj.getRowInfo(tr);
        //                                            const rowIndex = rowInfo.rowIndex;
        //                                            const totalStock = methods.getProductStock(e.value);
        //                                            secondaryGrid.obj.updateCell(rowIndex, 'totalStock', totalStock);
        //                                        }

        //                                        // Update cellElements[3] which is the Total Stock column
        //                                        if (cellElements.length > 3) {

        //                                            cellElements[3].innerText = parseFloat(stock).toFixed(2);
        //                                        }

        //                                        console.log('Updated total stock:', stock);
        //                                    } else {
        //                                        args.rowData.productId = null;
        //                                        args.rowData.totalStock = 0;
        //                                        args.rowData.requestStock = 0;

        //                                        const rowElement = args.row;
        //                                        const cellElements = rowElement.querySelectorAll('td');

        //                                        if (cellElements.length > 3) {
        //                                            cellElements[3].innerText = '0.00';
        //                                        }
        //                                    }
        //                                },
        //                                placeholder: 'Select a Product',
        //                                floatLabelType: 'Never'
        //                            });
        //                            secondaryGrid.productObj.appendTo(args.element);
        //                        }
        //                    }
        //                },

        //                {
        //                    field: 'totalStock',
        //                    headerText: 'Total Stock',
        //                    width: 150,
        //                    textAlign: 'Right',
        //                    type: 'number',
        //                    format: 'N2',
        //                    allowEditing: false,
        //                    valueAccessor: (field, data) => {
        //                        const value = data[field];
        //                        if (value === null || value === undefined) return '0.00';
        //                        return parseFloat(value).toFixed(2);
        //                    },
        //                    editType: 'numericedit',
        //                    edit: {
        //                        create: () => {
        //                            const totalStockElem = document.createElement('input');
        //                            return totalStockElem;
        //                        },
        //                        read: () => {
        //                            return secondaryGrid.totalStockObj?.value || 0;
        //                        },
        //                        destroy: function () {
        //                            if (secondaryGrid.totalStockObj) {
        //                                secondaryGrid.totalStockObj.destroy();
        //                                secondaryGrid.totalStockObj = null;
        //                            }
        //                        },
        //                        write: function (args) {
        //                            secondaryGrid.totalStockObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.totalStock || 0,
        //                                format: 'N2',
        //                                decimals: 2,
        //                                enabled: false, // Make it read-only since it's auto-calculated
        //                                placeholder: '0.00',
        //                                floatLabelType: 'Never'
        //                            });
        //                            secondaryGrid.totalStockObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'requestStock',
        //                    headerText: 'Request Stock',
        //                    width: 180,
        //                    textAlign: 'Right',
        //                    type: 'number',
        //                    format: 'N2',
        //                    editType: 'numericedit',
        //                    validationRules: {
        //                        required: true,
        //                        min: 0,
        //                        custom: [
        //                            (args) => {
        //                                debugger
        //                                // Fix: Access row data dynamically in batch mode
        //                               const rowIndex = args.element.closest('.e-row').rowIndex;
        //                               const rowObject = secondaryGrid.obj.getRowsObject()[rowIndex];
        //                               const rowBatchData = rowObject.changes ?? rowObject.data;
        //                               return args['value'] <= (rowBatchData.totalStock || 0);                                                                   
                                        
        //                            },
        //                            'Request Stock cannot be greater than Total Stock'
        //                        ]
        //                    },
        //                    edit: {
        //                        params: {
        //                            decimals: 2,
        //                            min: 0,
        //                            step: 0.01,
        //                            validateDecimalOnType: true,
        //                            showSpinButton: true
        //                        }
        //                    }
        //                }
        //            ],
        //            toolbar: allowAdd ? [
        //                'Add',
        //                { type: 'Separator' },
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
        //            ] : [
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
        //            ],
        //            dataBound: () => {
        //                if (secondaryGrid.obj?.toolbarModule) {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
        //                    if (allowAdd) {
        //                        secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_add'], true);
        //                    }
        //                }
        //            },
        //            rowSelected: () => {
        //                if (secondaryGrid.obj?.toolbarModule) {
        //                    const hasSelection = secondaryGrid.obj.getSelectedRecords().length === 1;
        //                    secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], hasSelection);
        //                }
        //            },
        //            rowDeselected: () => {
        //                if (secondaryGrid.obj?.toolbarModule) {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
        //                }
        //            },
        //            rowSelecting: (args) => { },
        //            toolbarClick: (args) => {
        //                if (!args?.item) return;

        //                if (args.item.id === 'SecondaryGrid_excelexport') {
        //                    secondaryGrid.obj?.excelExport();
        //                }
        //                if (args.item.id === 'DeleteCustom') {
        //                    const selected = secondaryGrid.obj?.getSelectedRecords()[0];
        //                    if (selected) {
        //                        state.deletedItems = state.deletedItems || [];
        //                        state.deletedItems.push(selected);
        //                        secondaryGrid.obj?.deleteRecord();
        //                        methods.refreshSummary?.();
        //                    }
        //                }
        //            },
        //            actionBegin: (args) => {
        //                if (args.requestType === 'add') {
        //                    args.rowData = {
        //                        id: 'temp_' + Date.now(),
        //                        productId: null,
        //                        totalStock: 0,
        //                        requestStock: 0
        //                    };
        //                }
        //            },
        //            actionComplete: (args) => {
        //                if (args.requestType === 'save' || args.requestType === 'delete') {
        //                    methods.refreshSummary?.();
        //                }

        //                if (args.requestType === 'save') {
        //                    setTimeout(() => {
        //                        secondaryGrid.obj?.refresh();
        //                    }, 100);
        //                }
        //            },
        //            cellSave: (args) => {
        //                if (args.column.field === 'requestStock') {
        //                    const rowData = args.rowData || {};
        //                    const totalStock = parseFloat(rowData.totalStock) || 0;
        //                    const requestStock = parseFloat(args.value) || 0;

        //                    if (requestStock > totalStock) {
        //                        args.cancel = true;
        //                        alert('Request Stock cannot exceed Total Stock');
        //                    }
        //                }
        //            }
        //        });

        //        if (secondaryGridRef.value) {
        //            secondaryGrid.obj.appendTo(secondaryGridRef.value);
        //        }
        //    },

        //    refresh: (dataSource) => {
        //        const allowAdd = !dataSource || dataSource.length === 0;

        //        if (secondaryGrid.obj) {
        //            secondaryGrid.obj.setProperties({
        //                dataSource: dataSource || [],
        //                editSettings: {
        //                    ...secondaryGrid.obj.editSettings,
        //                    allowAdding: allowAdd
        //                }
        //            });

        //            secondaryGrid.obj.toolbar = allowAdd ? [
        //                'Add',
        //                { type: 'Separator' },
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
        //            ] : [
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
        //            ];

        //            secondaryGrid.obj.dataBind();
        //            secondaryGrid.obj.refresh();
        //        }
        //    },

        //    // Method to update total stock externally if needed
        //    updateTotalStock: (productId, stock) => {
        //        if (secondaryGrid.totalStockObj) {
        //            secondaryGrid.totalStockObj.value = stock;
        //        }

        //        // Also update any selected row data
        //        const selectedRecords = secondaryGrid.obj?.getSelectedRecords();
        //        if (selectedRecords && selectedRecords.length > 0) {
        //            const selectedRecord = selectedRecords[0];
        //            selectedRecord.totalStock = stock;
        //            secondaryGrid.obj?.refresh();
        //        }
        //    },

        //    destroy: () => {
        //        if (secondaryGrid.productObj) {
        //            secondaryGrid.productObj.destroy();
        //            secondaryGrid.productObj = null;
        //        }
        //        if (secondaryGrid.totalStockObj) {
        //            secondaryGrid.totalStockObj.destroy();
        //            secondaryGrid.totalStockObj = null;
        //        }
        //        if (secondaryGrid.obj && !secondaryGrid.obj.isDestroyed) {
        //            secondaryGrid.obj.destroy();
        //            secondaryGrid.obj = null;
        //        }
        //    }
        //};
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