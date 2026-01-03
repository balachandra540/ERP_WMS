const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            deliveryOrderListLookupData: [],
            salesReturnStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            returnDate: '',
            description: '',
            deliveryOrderId: null,
            status: null,
            errors: {
                returnDate: '',
                deliveryOrderId: '',
                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00'
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const returnDateRef = Vue.ref(null);
        const deliveryOrderIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);


        const validateForm = function () {
            state.errors.returnDate = '';
            state.errors.deliveryOrderId = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.returnDate) {
                state.errors.returnDate = 'Return date is required.';
                isValid = false;
            }
            if (!state.deliveryOrderId) {
                state.errors.deliveryOrderId = 'Delivery Order is required.';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.returnDate = '';
            state.description = '';
            state.deliveryOrderId = null;
            state.status = null;
            state.errors = {
                returnDate: '',
                deliveryOrderId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
        };

        const returnDatePicker = {
            obj: null,
            create: () => {
                returnDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: state.returnDate ? new Date(state.returnDate) : null,
                    change: (e) => {
                        state.returnDate = e.value;
                    }
                });
                returnDatePicker.obj.appendTo(returnDateRef.value);
            },
            refresh: () => {
                if (returnDatePicker.obj) {
                    returnDatePicker.obj.value = state.returnDate ? new Date(state.returnDate) : null;
                }
            }
        };

        Vue.watch(
            () => state.returnDate,
            (newVal, oldVal) => {
                returnDatePicker.refresh();
                state.errors.returnDate = '';
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

        const deliveryOrderListLookup = {
            obj: null,
            create: () => {
                if (state.deliveryOrderListLookupData && Array.isArray(state.deliveryOrderListLookupData)) {
                    deliveryOrderListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.deliveryOrderListLookupData,
                        fields: { value: 'id', text: 'number' },
                        placeholder: 'Select Delivery Order',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('number', 'startsWith', e.text, true);
                            }
                            e.updateData(state.deliveryOrderListLookupData, query);
                        },

                        // Update this within the deliveryOrderListLookup object
                        change: async (e) => {
                            try {
                                if (!e.value) return;
                                state.deliveryOrderId = e.value;

                                const response = await services.getSecondaryData(null, state.deliveryOrderId);
                                const items = response?.data?.content?.data || [];

                                // returnQuantity IS the movement
                                state.secondaryData = items.map(item => ({
                                    id: '',
                                    warehouseId: item.warehouseId,
                                    productId: item.productId,
                                    orderQuantity: item.movement || 0,      // Original order qty
                                    returnQuantity: 1                      // Default: 1 (user can change)
                                }));

                                secondaryGrid.refresh();
                                methods.refreshSummary();

                            } catch (error) {
                                console.error("Error:", error);
                                state.secondaryData = [];
                                secondaryGrid.refresh();
                            }
                        }
                    });
                    deliveryOrderListLookup.obj.appendTo(deliveryOrderIdRef.value);
                }
            },
            refresh: () => {
                if (deliveryOrderListLookup.obj) {
                    deliveryOrderListLookup.obj.value = state.deliveryOrderId;
                }
            },
        };

        Vue.watch(
            () => state.deliveryOrderId,
            (newVal, oldVal) => {
                deliveryOrderListLookup.refresh();
                state.errors.deliveryOrderId = '';
            }
        );

        const salesReturnStatusListLookup = {
            obj: null,
            create: () => {
                if (state.salesReturnStatusListLookupData && Array.isArray(state.salesReturnStatusListLookupData)) {
                    salesReturnStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.salesReturnStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    salesReturnStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (salesReturnStatusListLookup.obj) {
                    salesReturnStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                salesReturnStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/SalesReturn/GetSalesReturnList?LocationId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (returnDate, description, status, deliveryOrderId, items, createdById) => {
                try {
                    const response = await AxiosManager.post('/SalesReturn/CreateSalesReturn', {
                        returnDate,
                        description,
                        status,
                        deliveryOrderId,
                        items, // Added secondary data array
                        createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, returnDate, description, status, deliveryOrderId, items, updatedById) => {
                try {
                    const response = await AxiosManager.post('/SalesReturn/UpdateSalesReturn', {
                        id,
                        returnDate,
                        description,
                        status,
                        deliveryOrderId,
                        items, // Added secondary data array
                        updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/SalesReturn/DeleteSalesReturn', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getDeliveryOrderListLookupData: async () => {
                try {
                    //const response = await AxiosManager.get('/DeliveryOrder/GetDeliveryOrderList', {});
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/DeliveryOrder/GetDeliveryOrderList?LocationId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSalesReturnStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/SalesReturn/GetSalesReturnStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (modelId, deliveryOrderId) => {
                debugger;
                try {
                    let response;

                    if (modelId) {
                        // Fetch data by transferOutId (moduleId)
                        response = await AxiosManager.get('/InventoryTransaction/SalesReturnGetInvenTransList?moduleId=' + modelId, {});
                    } else if (deliveryOrderId) {
                        // Fetch data by warehouseFromId
                        response = await AxiosManager.get('/InventoryTransaction/DeliveryOrderGetInvenTransList?moduleId=' + deliveryOrderId, {});
                    } else {
                        throw new Error("Either modelId or warehouseId must be provided.");
                    }

                    return response;
                } catch (error) {
                    console.error("Error in getSecondaryData:", error);
                    throw error;
                }
            },

            createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/SalesReturnCreateInvenTrans', {
                        moduleId, warehouseId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/SalesReturnUpdateInvenTrans', {
                        id, warehouseId, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/SalesReturnDeleteInvenTrans', {
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
            getWarehouseListLookupData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList?id=' + locationId, {});
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
                    returnDate: new Date(item.returnDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateDeliveryOrderListLookupData: async () => {
                const response = await services.getDeliveryOrderListLookupData();
                state.deliveryOrderListLookupData = response?.data?.content?.data;
            },
            populateSalesReturnStatusListLookupData: async () => {
                const response = await services.getSalesReturnStatusListLookupData();
                state.salesReturnStatusListLookupData = response?.data?.content?.data;
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
            populateWarehouseListLookupData: async () => {
                const response = await services.getWarehouseListLookupData();
                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateSecondaryData: async (salesReturnId, deliveryOrderId) => {
                try {
                    if (salesReturnId) {
                        // ✅ EDIT MODE → Load existing Sales Return items
                        const response = await services.getSecondaryData(salesReturnId, deliveryOrderId);

                        state.secondaryData =
                            response?.data?.content?.data?.map(item => ({
                                id: item.id,
                                warehouseId: item.warehouseId,
                                productId: item.productId,

                                // ✅ ORDER QTY (from original delivery order movement)
                                orderQuantity: Number(item.orderQuantity ?? item.movement ?? 0),

                                // ✅ USER ENTERED RETURN QTY (already saved)
                                returnQuantity: Number(item.movement ?? 0),

                                // backend-required field
                                movement: Number(item.movement ?? 0),

                                createdAtUtc: item.createdAtUtc
                                    ? new Date(item.createdAtUtc)
                                    : null
                            })) || [];

                    } else {
                        // ✅ NEW MODE → Load from Delivery Order
                        state.secondaryData = [];

                        if (deliveryOrderId) {
                            const stockResponse =
                                await services.getSecondaryData(null, deliveryOrderId);

                            const stockData =
                                stockResponse?.data?.content?.data || [];

                            state.secondaryData = stockData.map(item => ({
                                id: '',
                                warehouseId: item.warehouseId,
                                productId: item.productId,

                                // ✅ FROM DELIVERY ORDER
                                orderQuantity: Number(item.movement || 0),

                                // ✅ USER MUST ENTER
                                returnQuantity: 0,

                                // backend-required
                                movement: 0
                            }));

                            // Optional: product availability map
                            state.allProductStocks = new Map(
                                stockData.map(item => [item.productId, item.movement])
                            );

                            state.availableProducts =
                                state.productListLookupData?.filter(
                                    prod => state.allProductStocks.has(prod.id)
                                ) || [];
                        } else {
                            state.allProductStocks = new Map();
                            state.availableProducts = [];
                        }
                    }

                    methods.refreshSummary();
                    secondaryGrid.refresh(state.secondaryData);
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
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.returnDate = '';
                state.errors.deliveryOrderId = '';
                state.errors.status = '';
            }
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;

                    // Ensure grid edit is committed
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    // ✅ VALIDATION: returnQuantity must be >= 1
                    const invalidRow = state.secondaryData.find(
                        item => item.returnQuantity == null || Number(item.returnQuantity) < 1
                    );

                    if (invalidRow) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Invalid Return Quantity',
                            text: 'Return Quantity must be 1 or greater for all items.'
                        });
                        return;
                    }

                    // ✅ Prepare secondary data
                    const items = state.secondaryData.map(item => ({
                        id: item.id || null,
                        warehouseId: item.warehouseId,
                        productId: item.productId,

                        // ✅ movement = user-entered returnQuantity
                        movement: Number(item.returnQuantity)
                    }));

                    const userId = StorageManager.getUserId();
                    let response;

                    if (state.deleteMode) {
                        response = await services.deleteMainData(state.id, userId);

                    } else if (state.id === '') {
                        response = await services.createMainData(
                            state.returnDate,
                            state.description,
                            state.status,
                            state.deliveryOrderId,
                            items,
                            userId
                        );

                    } else {
                        response = await services.updateMainData(
                            state.id,
                            state.returnDate,
                            state.description,
                            state.status,
                            state.deliveryOrderId,
                            items,
                            userId
                        );
                    }

                    if (response.data.code === 200) {

                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Sales Return';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';

                            // Reload secondary data with DB IDs
                            await methods.populateSecondaryData(state.id);
                            secondaryGrid.refresh();
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

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
                            text: response.data.message ?? 'Please check your data.',
                            confirmButtonText: 'Try Again'
                        });
                    }

                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'An Error Occurred',
                        text: error.response?.data?.message ?? 'Please try again.',
                        confirmButtonText: 'OK'
                    });
                } finally {
                    state.isSubmitting = false;
                }
            }
        };
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['SalesReturns']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateDeliveryOrderListLookupData();
                await methods.populateSalesReturnStatusListLookupData();
                numberText.create();
                returnDatePicker.create();
                deliveryOrderListLookup.create();
                salesReturnStatusListLookup.create();

                await secondaryGrid.create(state.secondaryData);
                await methods.populateProductListLookupData();
                await methods.populateWarehouseListLookupData();

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
                        { field: 'returnDate', headerText: 'Return Date', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'deliveryOrderNumber', headerText: 'Delivery Order', width: 150, minWidth: 150 },
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
                        mainGrid.obj.autoFitColumns(['number', 'returnDate', 'deliveryOrderNumber', 'statusName', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Sales Return';
                            resetFormState();
                            state.showComplexDiv = true;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Sales Return';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.returnDate = selectedRecord.returnDate ? new Date(selectedRecord.returnDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.deliveryOrderId = selectedRecord.deliveryOrderId ?? '';
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
                                state.mainTitle = 'Delete Sales Return?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.returnDate = selectedRecord.returnDate ? new Date(selectedRecord.returnDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.deliveryOrderId = selectedRecord.deliveryOrderId ?? '';
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
                                window.open('/SalesReturns/SalesReturnPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
            create: async (dataSource) => {

                let warehouseObj, productObj, returnQtyObj;

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

                    sortSettings: { columns: [{ field: 'warehouseId', direction: 'Ascending' }] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    gridLines: 'Horizontal',

                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },

                        // ✅ WAREHOUSE
                        {
                            field: 'warehouseId',
                            headerText: 'Warehouse',
                            width: 220,
                            validationRules: { required: true },
                            valueAccessor: (field, data) => {
                                const wh = state.warehouseListLookupData.find(x => x.id === data[field]);
                                return wh ? wh.name : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => warehouseObj.value,
                                destroy: () => warehouseObj.destroy(),
                                write: (args) => {
                                    warehouseObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.warehouseListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.warehouseId,
                                        placeholder: 'Select Warehouse'
                                    });
                                    warehouseObj.appendTo(args.element);
                                }
                            }
                        },

                        // ✅ PRODUCT
                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 260,
                            validationRules: { required: true },
                            valueAccessor: (field, data) => {
                                const prod = state.productListLookupData.find(x => x.id === data[field]);
                                return prod ? prod.numberName : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => productObj.value,
                                destroy: () => productObj.destroy(),
                                write: (args) => {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        placeholder: 'Select Product'
                                    });
                                    productObj.appendTo(args.element);
                                }
                            }
                        },

                        // ✅ ORDER QTY (READ ONLY)
                        {
                            field: 'orderQuantity',
                            headerText: 'Order Qty',
                            width: 140,
                            textAlign: 'Right',
                            allowEditing: false,
                            type: 'number',
                            format: 'N2'
                        },

                        // ✅ RETURN QTY (USER ENTERED)
                        {
                            field: 'returnQuantity',
                            headerText: 'Return Qty',
                            width: 140,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            validationRules: {
                                required: true,
                                custom: [
                                    (args) => {
                                        const row = args.rowData;
                                        return args.value > 0 && args.value <= row.orderQuantity;
                                    },
                                    'Return Qty must be > 0 and ≤ Order Qty'
                                ]
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => returnQtyObj.value,
                                destroy: () => returnQtyObj.destroy(),
                                write: (args) => {
                                    returnQtyObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.returnQuantity || null,
                                        min: 0,
                                        max: args.rowData.orderQuantity,
                                        decimals: 2,
                                        placeholder: 'Enter Qty'
                                    });
                                    returnQtyObj.appendTo(args.element);
                                }
                            }
                        }
                    ],

                    toolbar: ['ExcelExport', 'Add', 'Edit', 'Delete', 'Update', 'Cancel'],

                    // ✅ STATE SYNC + MOVEMENT CALC
                    actionComplete: (args) => {

                        if (args.requestType === 'save') {

                            // 🔁 always sync backend field
                            args.data.movement = Number(args.data.returnQuantity || 0);

                            if (args.action === 'add') {
                                state.secondaryData.push(args.data);
                            }

                            if (args.action === 'edit') {
                                const index = state.secondaryData.findIndex(x =>
                                    x.productId === args.data.productId &&
                                    x.warehouseId === args.data.warehouseId
                                );
                                if (index !== -1) {
                                    state.secondaryData[index] = { ...args.data };
                                }
                            }
                        }

                        if (args.requestType === 'delete') {
                            args.data.forEach(row => {
                                state.secondaryData = state.secondaryData.filter(x => x !== row);
                            });
                        }

                        methods.refreshSummary();
                    },

                    rowSelected: () => {
                        secondaryGrid.obj.toolbarModule.enableItems(
                            ['Edit'],
                            secondaryGrid.obj.getSelectedRecords().length === 1
                        );
                    },

                    rowDeselected: () => {
                        secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
                    },

                    toolbarClick: (args) => {
                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj.excelExport();
                        }
                    }
                });

                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            refresh: () => {
                if (secondaryGrid.obj) {
                    secondaryGrid.obj.setProperties({
                        dataSource: state.secondaryData
                    });
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
            returnDateRef,
            deliveryOrderIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');