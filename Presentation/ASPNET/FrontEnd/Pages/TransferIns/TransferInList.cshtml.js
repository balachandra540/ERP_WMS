const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            transferOutListLookupData: [],
            transferInStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            transferReceiveDate: '',
            description: '',
            transferOutId: null,
            status: null,
            errors: {
                transferReceiveDate: '',
                transferOutId: '',
                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            isAddMode: false,
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const transferReceiveDateRef = Vue.ref(null);
        const transferOutIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.transferReceiveDate = '';
            state.errors.transferOutId = '';
            state.errors.status = '';

            let isValid = true;
            let hasValidRequestStock = false;

            if (!state.transferReceiveDate) {
                state.errors.transferReceiveDate = 'Receive date is required.';
                isValid = false;
            }
            if (!state.transferOutId) {
                state.errors.transferOutId = 'Transfer Out is required.';
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
                let currentSecondaryData = state.id !== "" && batchChanges.changedRecords.length > 0
                    ? [...batchChanges.changedRecords]
                    : [...state.secondaryData];    
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
                            text: 'Recieved  Stock cannot be negative.',
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
                        text: 'At least one item must have Recieved  Stock greater than 0.',
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
            //state.transferReceiveDate = '';
            state.description = '';
            state.transferOutId = null;
            state.status = null;
            state.errors = {
                transferReceiveDate: '',
                transferOutId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
        };

        //const transferReceiveDatePicker = {
        //    obj: null,
        //    create: () => {
        //        transferReceiveDatePicker.obj = new ej.calendars.DatePicker({
        //            placeholder: 'Select Date',
        //            format: 'yyyy-MM-dd',
        //            value: state.transferReceiveDate ? new Date(state.transferReceiveDate) : null,
        //            change: (e) => {
        //                state.transferReceiveDate = e.value;
        //            }
        //        });
        //        transferReceiveDatePicker.obj.appendTo(transferReceiveDateRef.value);
        //    },
        //    refresh: () => {
        //        if (transferReceiveDatePicker.obj) {
        //            transferReceiveDatePicker.obj.value = state.transferReceiveDate ? new Date(state.transferReceiveDate) : null;
        //        }
        //    }
        //};

        const transferReceiveDatePicker = {
            obj: null,

            create: () => {
                const defaultDate = state.transferReceiveDate
                    ? new Date(state.transferReceiveDate)
                    : new Date();

                transferReceiveDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false   // 🔒 disabled
                });

                // ✅ CRITICAL: manually sync state
                state.transferReceiveDate = defaultDate;

                transferReceiveDatePicker.obj.appendTo(transferReceiveDateRef.value);
            },

            refresh: () => {
                if (transferReceiveDatePicker.obj) {
                    const date = state.transferReceiveDate
                        ? new Date(state.transferReceiveDate)
                        : new Date();

                    transferReceiveDatePicker.obj.value = date;

                    // ✅ keep state in sync
                    state.transferReceiveDate = date;
                }
            }
        };
        const setDefaultDate = () => {
            if (!state.transferReceiveDate) {
                state.transferReceiveDate = new Date();
            }

            if (transferReceiveDatePicker.obj) {
                transferReceiveDatePicker.obj.value = new Date(state.transferReceiveDate);
            }
        };

        //Vue.watch(
        //    () => state.transferReceiveDate,
        //    (newVal, oldVal) => {
        //        transferReceiveDatePicker.refresh();
        //        state.errors.transferReceiveDate = '';
        //    }
        //);

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        const transferOutListLookup = {
            obj: null,
            create: () => {
                if (state.transferOutListLookupData && Array.isArray(state.transferOutListLookupData)) {
                    transferOutListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.transferOutListLookupData,
                        fields: { value: 'id', text: 'number' },
                        placeholder: 'Select Transfer Out',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('number', 'startsWith', e.text, true);
                            }
                            e.updateData(state.transferOutListLookupData, query);
                        },
                        change: (e) => {
                            state.transferOutId = e.value;
                            // Choose which ID to use for fetching
                            const modelId = state.modelId;
                            const transferOutId = state.transferOutId;

                            // Call populateSecondaryData with both parameters
                             methods.populateSecondaryData(modelId, transferOutId);

                        }
                    });
                    transferOutListLookup.obj.appendTo(transferOutIdRef.value);
                }
            },
            refresh: () => {
                if (transferOutListLookup.obj) {
                    transferOutListLookup.obj.value = state.transferOutId
                }
            },
        };

        Vue.watch(
            () => state.transferOutId,
            (newVal, oldVal) => {
                transferOutListLookup.refresh();
                state.errors.transferOutId = '';
            }
        );

        const transferInStatusListLookup = {
            obj: null,
            create: () => {
                if (state.transferInStatusListLookupData && Array.isArray(state.transferInStatusListLookupData)) {
                    transferInStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.transferInStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    transferInStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (transferInStatusListLookup.obj) {
                    transferInStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                transferInStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/TransferIn/GetTransferInList?locationId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (transferReceiveDate, description, status, transferOutId, createdById, items) => {
                try {
                    const response = await AxiosManager.post('/TransferIn/CreateTransferIn', {
                        transferReceiveDate, description, status, transferOutId, createdById, items
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, transferReceiveDate, description, status, transferOutId, updatedById,) => {
                try {
                    const response = await AxiosManager.post('/TransferIn/UpdateTransferIn', {
                        id, transferReceiveDate, description, status, transferOutId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async function (
                id,
                transferReceiveDate,
                description,
                status,
                transferOutId,
                updatedById,
                items,
                deletedItems
            ) {
                try {
                    // 🔍 DEBUG: Add these console logs FIRST
                    
                    const payload = {
                        id,
                        transferReceiveDate,
                        description,
                        status,
                        transferOutId,
                        updatedById,
                        items: items || [],           // ✅ Ensure it's never undefined
                        deletedItems: deletedItems || [] // ✅ Ensure it's never undefined
                    };

                    // 🔍 DEBUG: Log the final payload

                    const response = await AxiosManager.post(
                        '/TransferIn/UpdateTransferIn',
                        payload,
                        {
                            headers: {
                                'Content-Type': 'application/json' // ✅ Explicit header
                            }
                        }
                    );

                    return response.data;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/TransferIn/DeleteTransferIn', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getTransferOutListLookupData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/TransferOut/GetTransferOutList?wareHouseId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getTransferInStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/TransferIn/GetTransferInStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (modelId, transferOutId) => {
                try {
                    let response;

                    if (modelId) {
                        // 📦 Fetch Transfer-In data by modelId
                        response = await AxiosManager.get(`/InventoryTransaction/TransferInGetInvenTransList?moduleId=${modelId}`, {});
                    } else if (transferOutId) {
                        // 🚚 Fetch Transfer-Out data (confirmed only)
                        response = await AxiosManager.get(`/InventoryTransaction/TransferOutGetInvenTransList?moduleId=${transferOutId}&onlyConfirmed=true`, {});
                    } else {
                        throw new Error("❌ Either modelId or transferOutId must be provided.");
                    }

                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (moduleId, productId, movement, createdById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferInCreateInvenTrans', {
                        moduleId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferInUpdateInvenTrans', {
                        id, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/TransferInDeleteInvenTrans', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Product/GetProductList?WarehouseId =' + locationId, {});
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
                    transferReceiveDate: new Date(item.transferReceiveDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateTransferOutListLookupData: async () => {
                const response = await services.getTransferOutListLookupData();
                state.transferOutListLookupData = response?.data?.content?.data;
            },
            populateTransferInStatusListLookupData: async () => {
                const response = await services.getTransferInStatusListLookupData();
                state.transferInStatusListLookupData = response?.data?.content?.data;
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
            populateSecondaryData: async (transferInId, transferOutId) => {
                try {
                    // Prefer modelId if it exists, else use warehouseId
                    const response = await services.getSecondaryData(transferInId || null, transferOutId || null);

                    state.secondaryData = response?.data?.content?.data?.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    })) || [];

                    methods.refreshSummary();
                    secondaryGrid.refresh();
                    state.showComplexDiv = true;

                } catch (error) {
                    console.error("Error populating secondary data:", error);
                    state.secondaryData = [];
                }
            },
            prepareSecondaryDataForSubmission: function () {
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };

                //let currentSecondaryData = state.id !== "" && batchChanges.changedRecords.length > 0
                //    ? [...batchChanges.changedRecords]
                //    : [...state.secondaryData];
                let currentSecondaryData = [...state.secondaryData];

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
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.transferReceiveDate = '';
                state.errors.transferOutId = '';
                state.errors.status = '';
            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
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
        //                ? await services.createMainData(state.transferReceiveDate, state.description, state.status, state.transferOutId, StorageManager.getUserId())
        //                : state.deleteMode
        //                    ? await services.deleteMainData(state.id, StorageManager.getUserId())
        //                    : await services.updateMainData(state.id, state.transferReceiveDate, state.description, state.status, state.transferOutId, StorageManager.getUserId());

        //            if (response.data.code === 200) {
        //                await methods.populateMainData();
        //                mainGrid.refresh();

        //                if (!state.deleteMode) {
        //                    state.mainTitle = 'Edit Transfer In';
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
                            state.transferReceiveDate,
                            state.description,
                            state.status,
                            state.transferOutId,
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
                            movement: item.requestStock
                        }));
                        const DeleteditemsDto = deletedItems.map(item => ({
                            Id: item.id || null  // Include ID for updates/deletes
                        }));

                        // Filter out deleted items (requestStock > 0; assume prepareSecondaryDataForSubmission handles this)
                        const filteredItemsDto = itemsDto.filter(item => item.movement > 0);

                        response = await services.updateMainData(
                            state.id,
                            state.transferReceiveDate,
                            state.description,
                            state.status,
                            state.transferOutId,
                            userId,
                            filteredItemsDto,  // Pass items for create/update/delete in single request
                            DeleteditemsDto
                        );

                        if (response.code === 200) {
                            // No need for separate secondary calls; all handled in single request
                        }
                    }

                    // **HANDLE RESPONSE**
                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            // Refresh secondary data after successful save
                            await methods.populateSecondaryData(state.id);
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
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['TransferIns']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);

                await methods.populateTransferOutListLookupData();
                await methods.populateTransferInStatusListLookupData();
                numberText.create();
                transferReceiveDatePicker.create();
                transferOutListLookup.create();
                transferInStatusListLookup.create();

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
                        { field: 'transferReceiveDate', headerText: 'Receive Date', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'transferOutNumber', headerText: 'Transfer Out', width: 150, minWidth: 150 },
                        //{ field: 'warehouseFrom', headerText: 'Warehouse From', minWidth: 150},
                        //{ field: 'warehouseTo', headerText: 'Warehouse To',   minWidth: 150 },
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
                        mainGrid.obj.autoFitColumns(['number', 'transferReceiveDate', 'transferOutNumber', 'statusName', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Transfer In';
                            resetFormState();
                            state.isAddMode = true;
                            // Create new grid properly
                            if (secondaryGrid.obj == null) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.refresh();
                            }
                            state.showComplexDiv = true;
                            setDefaultDate();
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            state.isAddMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Transfer In';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.transferReceiveDate = selectedRecord.transferReceiveDate ? new Date(selectedRecord.transferReceiveDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.transferOutId = selectedRecord.transferOutId ?? '';
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
                                state.mainTitle = 'Delete Transfer In?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.transferReceiveDate = selectedRecord.transferReceiveDate ? new Date(selectedRecord.transferReceiveDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.transferOutId = selectedRecord.transferOutId ?? '';
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
                                window.open('/TransferIns/TransferInPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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

        //const secondaryGrid = {
        //    obj: null,
        //    create: async (dataSource) => {
        //        secondaryGrid.obj = new ej.grids.Grid({
        //            height: 400,
        //            dataSource: dataSource,
        //            editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
        //            allowFiltering: false,
        //            allowSorting: true,
        //            allowSelection: true,
        //            allowGrouping: false,
        //            allowTextWrap: true,
        //            allowResizing: true,
        //            allowPaging: false,
        //            allowExcelExport: true,
        //            filterSettings: { type: 'CheckBox' },
        //            sortSettings: { columns: [{ field: 'productName', direction: 'Descending' }] },
        //            pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
        //            selectionSettings: { persistSelection: true, type: 'Single' },
        //            autoFit: false,
        //            showColumnMenu: false,
        //            gridLines: 'Horizontal',
        //            columns: [
        //                { type: 'checkbox', width: 60 },
        //                {
        //                    field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
        //                },
        //                {
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 250,
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
        //                            return productObj.value;
        //                        },
        //                        destroy: function () {
        //                            productObj.destroy();
        //                        },
        //                        write: function (args) {
        //                            productObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.productListLookupData,
        //                                fields: { value: 'id', text: 'numberName' },
        //                                value: args.rowData.productId,
        //                                change: function (e) {
        //                                    if (movementObj) {
        //                                        movementObj.value = 1;
        //                                    }
        //                                },
        //                                placeholder: 'Select Product',
        //                                floatLabelType: 'Never'
        //                            });
        //                            productObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'movement',
        //                    headerText: 'Movement',
        //                    width: 200,
        //                    validationRules: {
        //                        required: true,
        //                        custom: [(args) => {
        //                            return args['value'] > 0;
        //                        }, 'Must be a positive number and not zero']
        //                    },
        //                    type: 'number', format: 'N2', textAlign: 'Right',
        //                    edit: {
        //                        create: () => {
        //                            const movementElem = document.createElement('input');
        //                            return movementElem;
        //                        },
        //                        read: () => {
        //                            return movementObj.value;
        //                        },
        //                        destroy: function () {
        //                            movementObj.destroy();
        //                        },
        //                        write: function (args) {
        //                            movementObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.movement ?? 0,
        //                            });
        //                            movementObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //            ],
        //            toolbar: [
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                'Add', 'Edit', 'Delete', 'Update', 'Cancel',
        //            ],
        //            beforeDataBound: () => { },
        //            dataBound: function () { },
        //            excelExportComplete: () => { },
        //            rowSelected: () => {
        //                if (secondaryGrid.obj.getSelectedRecords().length == 1) {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
        //                } else {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
        //                }
        //            },
        //            rowDeselected: () => {
        //                if (secondaryGrid.obj.getSelectedRecords().length == 1) {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
        //                } else {
        //                    secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
        //                }
        //            },
        //            rowSelecting: () => {
        //                if (secondaryGrid.obj.getSelectedRecords().length) {
        //                    secondaryGrid.obj.clearSelection();
        //                }
        //            },
        //            toolbarClick: (args) => {
        //                if (args.item.id === 'SecondaryGrid_excelexport') {
        //                    secondaryGrid.obj.excelExport();
        //                }
        //            },
        //            actionComplete: async (args) => {
        //                if (args.requestType === 'save' && args.action === 'add') {
        //                    try {
        //                        const response = await services.createSecondaryData(state.id, args.data.productId, args.data.movement, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Save Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Save Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                if (args.requestType === 'save' && args.action === 'edit') {
        //                    try {
        //                        const response = await services.updateSecondaryData(args.data.id, args.data.productId, args.data.movement, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Update Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Update Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                if (args.requestType === 'delete') {
        //                    try {
        //                        const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Delete Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Delete Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                methods.refreshSummary();
        //            }
        //        });
        //        secondaryGrid.obj.appendTo(secondaryGridRef.value);

        //    },
        //    refresh: () => {
        //        secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
        //    }
        //};
        const secondaryGrid = {
            obj: null,
            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource,
                    editSettings: {
                        allowEditing: true,
                        allowAdding: false,
                        allowDeleting: true,
                        showDeleteConfirmDialog: false,
                        mode: 'Batch' // ✅ Batch edit mode (supports inline cell editing)
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
                            width: 300,
                            disableHtmlEncode: false,
                            allowEditing: false,
                            valueAccessor: (field, data) => {
                                const prod = state.productListLookupData?.find(item => item.id === data[field]);
                                return prod ? prod.numberName : '';
                            }
                        },
                        {
                            field: 'totalStock',
                            headerText: 'Total Stock',
                            width: 150,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'requestStock',
                            headerText: 'Recieved Stock',
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
                                        // Fix: Access row data dynamically in batch mode
                                        const rowIndex = args.element.closest('.e-row').rowIndex;
                                        const rowObject = secondaryGrid.obj.getRowsObject()[rowIndex];
                                        const rowBatchData = rowObject.changes ?? rowObject.data;
                                        return args['value'] <= (rowBatchData.totalStock || 0);
                                    },
                                    'Recieved  Stock cannot be greater than Total Stock'
                                ]
                            },
                            edit: {
                                params: {
                                    decimals: 2,
                                    min: 0,
                                    step: 0.01
                                }
                            }
                        }
                    ],

                    toolbar: [
                        'ExcelExport',
                        { type: 'Separator' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ],

                    dataBound: () => {
                        // Disable delete until a row is selected
                        secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
                    },

                    rowSelected: () => {
                        const hasSelection = secondaryGrid.obj.getSelectedRecords().length === 1;
                        secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], hasSelection);
                    },

                    rowDeselected: () => {
                        secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
                    },

                    // Simplified: Single selection is already enforced by selectionSettings
                    rowSelecting: (args) => { },

                    toolbarClick: (args) => {
                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj.excelExport();
                        }

                        if (args.item.id === 'DeleteCustom') {
                            const selected = secondaryGrid.obj.getSelectedRecords()[0];
                            if (selected) {
                                state.deletedItems = state.deletedItems || [];
                                state.deletedItems.push(selected);
                                secondaryGrid.obj.deleteRecord();
                            }
                        }
                    },

                    actionComplete: (args) => {
                        if (args.requestType === 'save' || args.requestType === 'delete') {
                            methods.refreshSummary?.();
                        }
                    }
                });

                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            refresh: () => {
                secondaryGrid.obj?.setProperties({ dataSource: state.secondaryData });
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
            transferReceiveDateRef,
            transferOutIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');