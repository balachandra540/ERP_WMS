//const App = {
//    setup() {
//        const state = Vue.reactive({
//            mainData: [],
//            deleteMode: false,
//            purchaseOrderListLookupData: [],
//            goodsReceiveStatusListLookupData: [],
//            secondaryData: [],
//            productListLookupData: [],
//            warehouseListLookupData: [],
//            mainTitle: null,
//            id: '',
//            number: '',
//            receiveDate: '',
//            description: '',
//            purchaseOrderId: null,
//            status: null,
//            errors: {
//                receiveDate: '',
//                purchaseOrderId: '',
//                status: '',
//                description: ''
//            },
//            showComplexDiv: false,
//            isSubmitting: false,
//            totalMovementFormatted: '0.00'
//        });

//        const mainGridRef = Vue.ref(null);
//        const mainModalRef = Vue.ref(null);
//        const secondaryGridRef = Vue.ref(null);
//        const receiveDateRef = Vue.ref(null);
//        const purchaseOrderIdRef = Vue.ref(null);
//        const statusRef = Vue.ref(null);
//        const numberRef = Vue.ref(null);

//        const validateForm = function () {
//            state.errors.receiveDate = '';
//            state.errors.purchaseOrderId = '';
//            state.errors.status = '';

//            let isValid = true;

//            if (!state.receiveDate) {
//                state.errors.receiveDate = 'Receive date is required.';
//                isValid = false;
//            }
//            if (!state.purchaseOrderId) {
//                state.errors.purchaseOrderId = 'Purchase Order is required.';
//                isValid = false;
//            }
//            if (!state.status) {
//                state.errors.status = 'Status is required.';
//                isValid = false;
//            }

//            return isValid;
//        };

//        const resetFormState = () => {
//            state.id = '';
//            state.number = '';
//            state.receiveDate = '';
//            state.description = '';
//            state.purchaseOrderId = null;
//            state.status = null;
//            state.errors = {
//                receiveDate: '',
//                purchaseOrderId: '',
//                status: '',
//                description: ''
//            };
//            state.secondaryData = [];
//        };

//        const receiveDatePicker = {
//            obj: null,
//            create: () => {
//                receiveDatePicker.obj = new ej.calendars.DatePicker({
//                    placeholder: 'Select Date',
//                    format: 'yyyy-MM-dd',
//                    value: state.receiveDate ? new Date(state.receiveDate) : null,
//                    change: (e) => {
//                        state.receiveDate = e.value;
//                    }
//                });
//                receiveDatePicker.obj.appendTo(receiveDateRef.value);
//            },
//            refresh: () => {
//                if (receiveDatePicker.obj) {
//                    receiveDatePicker.obj.value = state.receiveDate ? new Date(state.receiveDate) : null;
//                }
//            }
//        };

//        Vue.watch(
//            () => state.receiveDate,
//            (newVal, oldVal) => {
//                receiveDatePicker.refresh();
//                state.errors.receiveDate = '';
//            }
//        );

//        const numberText = {
//            obj: null,
//            create: () => {
//                numberText.obj = new ej.inputs.TextBox({
//                    placeholder: '[auto]',
//                });
//                numberText.obj.appendTo(numberRef.value);
//            }
//        };

//        const purchaseOrderListLookup = {
//            obj: null,
//            create: () => {
//                if (state.purchaseOrderListLookupData && Array.isArray(state.purchaseOrderListLookupData)) {
//                    purchaseOrderListLookup.obj = new ej.dropdowns.DropDownList({
//                        dataSource: state.purchaseOrderListLookupData,
//                        fields: { value: 'id', text: 'number' },
//                        placeholder: 'Select Purchase Order',
//                        filterBarPlaceholder: 'Search',
//                        sortOrder: 'Ascending',
//                        allowFiltering: true,
//                        filtering: (e) => {
//                            e.preventDefaultAction = true;
//                            let query = new ej.data.Query();
//                            if (e.text !== '') {
//                                query = query.where('number', 'startsWith', e.text, true);
//                            }
//                            e.updateData(state.purchaseOrderListLookupData, query);
//                        },
//                        change: (e) => {
//                            state.purchaseOrderId = e.value;
//                        }
//                    });
//                    purchaseOrderListLookup.obj.appendTo(purchaseOrderIdRef.value);
//                }
//            },
//            refresh: () => {
//                if (purchaseOrderListLookup.obj) {
//                    purchaseOrderListLookup.obj.value = state.purchaseOrderId
//                }
//            },
//        };

//        Vue.watch(
//            () => state.purchaseOrderId,
//            (newVal, oldVal) => {
//                purchaseOrderListLookup.refresh();
//                state.errors.purchaseOrderId = '';
//            }
//        );

//        const goodsReceiveStatusListLookup = {
//            obj: null,
//            create: () => {
//                if (state.goodsReceiveStatusListLookupData && Array.isArray(state.goodsReceiveStatusListLookupData)) {
//                    goodsReceiveStatusListLookup.obj = new ej.dropdowns.DropDownList({
//                        dataSource: state.goodsReceiveStatusListLookupData,
//                        fields: { value: 'id', text: 'name' },
//                        placeholder: 'Select Status',
//                        allowFiltering: false,
//                        change: (e) => {
//                            state.status = e.value;
//                        }
//                    });
//                    goodsReceiveStatusListLookup.obj.appendTo(statusRef.value);
//                }
//            },
//            refresh: () => {
//                if (goodsReceiveStatusListLookup.obj) {
//                    goodsReceiveStatusListLookup.obj.value = state.status
//                }
//            },
//        };

//        Vue.watch(
//            () => state.status,
//            (newVal, oldVal) => {
//                goodsReceiveStatusListLookup.refresh();
//                state.errors.status = '';
//            }
//        );

//        const services = {
//            getMainData: async () => {
//                try {
//                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            createMainData: async (receiveDate, description, status, purchaseOrderId, createdById) => {
//                try {
//                    const response = await AxiosManager.post('/GoodsReceive/CreateGoodsReceive', {
//                        receiveDate, description, status, purchaseOrderId, createdById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            updateMainData: async (id, receiveDate, description, status, purchaseOrderId, updatedById) => {
//                try {
//                    const response = await AxiosManager.post('/GoodsReceive/UpdateGoodsReceive', {
//                        id, receiveDate, description, status, purchaseOrderId, updatedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            deleteMainData: async (id, deletedById) => {
//                try {
//                    const response = await AxiosManager.post('/GoodsReceive/DeleteGoodsReceive', {
//                        id, deletedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getPurchaseOrderListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/PurchaseOrder/GetPurchaseOrderList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getGoodsReceiveStatusListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveStatusList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getSecondaryData: async (moduleId) => {
//                try {
//                    const response = await AxiosManager.get('/InventoryTransaction/GoodsReceiveGetInvenTransList?moduleId=' + moduleId, {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById) => {
//                try {
//                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveCreateInvenTrans', {
//                        moduleId, warehouseId, productId, movement, createdById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById) => {
//                try {
//                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveUpdateInvenTrans', {
//                        id, warehouseId, productId, movement, updatedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            deleteSecondaryData: async (id, deletedById) => {
//                try {
//                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveDeleteInvenTrans', {
//                        id, deletedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getProductListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/Product/GetProductList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getWarehouseListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//        };

//        const methods = {
//            populateMainData: async () => {
//                const response = await services.getMainData();
//                state.mainData = response?.data?.content?.data.map(item => ({
//                    ...item,
//                    receiveDate: new Date(item.receiveDate),
//                    createdAtUtc: new Date(item.createdAtUtc)
//                }));
//            },
//            populatePurchaseOrderListLookupData: async () => {
//                const response = await services.getPurchaseOrderListLookupData();
//                state.purchaseOrderListLookupData = response?.data?.content?.data;
//            },
//            populateGoodsReceiveStatusListLookupData: async () => {
//                const response = await services.getGoodsReceiveStatusListLookupData();
//                state.goodsReceiveStatusListLookupData = response?.data?.content?.data;
//            },
//            populateProductListLookupData: async () => {
//                const response = await services.getProductListLookupData();
//                state.productListLookupData = response?.data?.content?.data
//                    .filter(product => product.physical === true)
//                    .map(product => ({
//                        ...product,
//                        numberName: `${product.number} - ${product.name}`
//                    })) || [];
//            },
//            populateWarehouseListLookupData: async () => {
//                const response = await services.getWarehouseListLookupData();
//                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
//            },
//            populateSecondaryData: async (goodsReceiveId) => {
//                try {
//                    const response = await services.getSecondaryData(goodsReceiveId);
//                    state.secondaryData = response?.data?.content?.data.map(item => ({
//                        ...item,
//                        createdAtUtc: new Date(item.createdAtUtc)
//                    }));
//                    methods.refreshSummary();
//                } catch (error) {
//                    state.secondaryData = [];
//                }
//            },
//            refreshSummary: () => {
//                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
//                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
//            },
//            onMainModalHidden: () => {
//                state.errors.receiveDate = '';
//                state.errors.purchaseOrderId = '';
//                state.errors.status = '';
//            }
//        };

//        const handler = {
//            handleSubmit: async function () {
//                try {
//                    state.isSubmitting = true;
//                    await new Promise(resolve => setTimeout(resolve, 300));

//                    if (!validateForm()) {
//                        return;
//                    }

//                    const response = state.id === ''
//                        ? await services.createMainData(state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId())
//                        : state.deleteMode
//                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
//                            : await services.updateMainData(state.id, state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId());

//                    if (response.data.code === 200) {
//                        await methods.populateMainData();
//                        mainGrid.refresh();

//                        if (!state.deleteMode) {
//                            state.mainTitle = 'Edit Goods Receive';
//                            state.id = response?.data?.content?.data.id ?? '';
//                            state.number = response?.data?.content?.data.number ?? '';
//                            await methods.populateSecondaryData(state.id);
//                            secondaryGrid.refresh();
//                            state.showComplexDiv = true;

//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Save Successful',
//                                timer: 2000,
//                                showConfirmButton: false
//                            });

//                        } else {
//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Delete Successful',
//                                text: 'Form will be closed...',
//                                timer: 2000,
//                                showConfirmButton: false
//                            });
//                            setTimeout(() => {
//                                mainModal.obj.hide();
//                                resetFormState();
//                            }, 2000);
//                        }

//                    } else {
//                        Swal.fire({
//                            icon: 'error',
//                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
//                            text: response.data.message ?? 'Please check your data.',
//                            confirmButtonText: 'Try Again'
//                        });
//                    }

//                } catch (error) {
//                    Swal.fire({
//                        icon: 'error',
//                        title: 'An Error Occurred',
//                        text: error.response?.data?.message ?? 'Please try again.',
//                        confirmButtonText: 'OK'
//                    });
//                } finally {
//                    state.isSubmitting = false;
//                }
//            },
//        };

//        Vue.onMounted(async () => {
//            try {
//                await SecurityManager.authorizePage(['GoodsReceives']);
//                await SecurityManager.validateToken();

//                await methods.populateMainData();
//                await mainGrid.create(state.mainData);

//                mainModal.create();
//                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
//                await methods.populatePurchaseOrderListLookupData();
//                await methods.populateGoodsReceiveStatusListLookupData();
//                numberText.create();
//                receiveDatePicker.create();
//                purchaseOrderListLookup.create();
//                goodsReceiveStatusListLookup.create();

//                await secondaryGrid.create(state.secondaryData);
//                await methods.populateProductListLookupData();
//                await methods.populateWarehouseListLookupData();

//            } catch (e) {
//                console.error('page init error:', e);
//            } finally {

//            }
//        });

//        Vue.onUnmounted(() => {
//            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
//        });

//        const mainGrid = {
//            obj: null,
//            create: async (dataSource) => {
//                mainGrid.obj = new ej.grids.Grid({
//                    height: '240px',
//                    dataSource: dataSource,
//                    allowFiltering: true,
//                    allowSorting: true,
//                    allowSelection: true,
//                    allowGrouping: true,
//                    allowTextWrap: true,
//                    allowResizing: true,
//                    allowPaging: true,
//                    allowExcelExport: true,
//                    filterSettings: { type: 'CheckBox' },
//                    sortSettings: { columns: [{ field: 'createdAtUtc', direction: 'Descending' }] },
//                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
//                    selectionSettings: { persistSelection: true, type: 'Single' },
//                    autoFit: true,
//                    showColumnMenu: true,
//                    gridLines: 'Horizontal',
//                    columns: [
//                        { type: 'checkbox', width: 60 },
//                        {
//                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
//                        },
//                        { field: 'number', headerText: 'Number', width: 150, minWidth: 150 },
//                        { field: 'receiveDate', headerText: 'Receive Date', width: 150, format: 'yyyy-MM-dd' },
//                        { field: 'purchaseOrderNumber', headerText: 'Purchase Order', width: 150, minWidth: 150 },
//                        { field: 'statusName', headerText: 'Status', width: 150, minWidth: 150 },
//                        { field: 'createdAtUtc', headerText: 'Created At UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
//                    ],
//                    toolbar: [
//                        'ExcelExport', 'Search',
//                        { type: 'Separator' },
//                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
//                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
//                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
//                        { type: 'Separator' },
//                        { text: 'Print PDF', tooltipText: 'Print PDF', id: 'PrintPDFCustom' },
//                    ],
//                    beforeDataBound: () => { },
//                    dataBound: function () {
//                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
//                        mainGrid.obj.autoFitColumns(['number', 'receiveDate', 'purchaseOrderNumber', 'statusName', 'createdAtUtc']);
//                    },
//                    excelExportComplete: () => { },
//                    rowSelected: () => {
//                        if (mainGrid.obj.getSelectedRecords().length == 1) {
//                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
//                        } else {
//                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
//                        }
//                    },
//                    rowDeselected: () => {
//                        if (mainGrid.obj.getSelectedRecords().length == 1) {
//                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
//                        } else {
//                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
//                        }
//                    },
//                    rowSelecting: () => {
//                        if (mainGrid.obj.getSelectedRecords().length) {
//                            mainGrid.obj.clearSelection();
//                        }
//                    },
//                    toolbarClick: async (args) => {
//                        if (args.item.id === 'MainGrid_excelexport') {
//                            mainGrid.obj.excelExport();
//                        }

//                        if (args.item.id === 'AddCustom') {
//                            state.deleteMode = false;
//                            state.mainTitle = 'Add Goods Receive';
//                            resetFormState();
//                            state.showComplexDiv = false;
//                            mainModal.obj.show();
//                        }

//                        if (args.item.id === 'EditCustom') {
//                            state.deleteMode = false;
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                state.mainTitle = 'Edit Goods Receive';
//                                state.id = selectedRecord.id ?? '';
//                                state.number = selectedRecord.number ?? '';
//                                state.receiveDate = selectedRecord.receiveDate ? new Date(selectedRecord.receiveDate) : null;
//                                state.description = selectedRecord.description ?? '';
//                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
//                                state.status = String(selectedRecord.status ?? '');
//                                await methods.populateSecondaryData(selectedRecord.id);
//                                secondaryGrid.refresh();
//                                state.showComplexDiv = true;
//                                mainModal.obj.show();
//                            }
//                        }

//                        if (args.item.id === 'DeleteCustom') {
//                            state.deleteMode = true;
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                state.mainTitle = 'Delete Goods Receive?';
//                                state.id = selectedRecord.id ?? '';
//                                state.number = selectedRecord.number ?? '';
//                                state.receiveDate = selectedRecord.receiveDate ? new Date(selectedRecord.receiveDate) : null;
//                                state.description = selectedRecord.description ?? '';
//                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
//                                state.status = String(selectedRecord.status ?? '');
//                                await methods.populateSecondaryData(selectedRecord.id);
//                                secondaryGrid.refresh();
//                                state.showComplexDiv = false;
//                                mainModal.obj.show();
//                            }
//                        }

//                        if (args.item.id === 'PrintPDFCustom') {
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                window.open('/GoodsReceives/GoodsReceivePdf?id=' + (selectedRecord.id ?? ''), '_blank');
//                            }
//                        }
//                    }
//                });

//                mainGrid.obj.appendTo(mainGridRef.value);
//            },
//            refresh: () => {
//                mainGrid.obj.setProperties({ dataSource: state.mainData });
//            }
//        };

//        const secondaryGrid = {
//            obj: null,
//            create: async (dataSource) => {
//                secondaryGrid.obj = new ej.grids.Grid({
//                    height: 400,
//                    dataSource: dataSource,
//                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
//                    allowFiltering: false,
//                    allowSorting: true,
//                    allowSelection: true,
//                    allowGrouping: false,
//                    allowTextWrap: true,
//                    allowResizing: true,
//                    allowPaging: false,
//                    allowExcelExport: true,
//                    filterSettings: { type: 'CheckBox' },
//                    sortSettings: { columns: [{ field: 'warehouseName', direction: 'Descending' }] },
//                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
//                    selectionSettings: { persistSelection: true, type: 'Single' },
//                    autoFit: false,
//                    showColumnMenu: false,
//                    gridLines: 'Horizontal',
//                    columns: [
//                        { type: 'checkbox', width: 60 },
//                        {
//                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
//                        },
//                        {
//                            field: 'warehouseId',
//                            headerText: 'Warehouse',
//                            width: 250,
//                            validationRules: { required: true },
//                            disableHtmlEncode: false,
//                            valueAccessor: (field, data, column) => {
//                                const warehouse = state.warehouseListLookupData.find(item => item.id === data[field]);
//                                return warehouse ? `${warehouse.name}` : '';
//                            },
//                            editType: 'dropdownedit',
//                            edit: {
//                                create: () => {
//                                    const warehouseElem = document.createElement('input');
//                                    return warehouseElem;
//                                },
//                                read: () => {
//                                    return warehouseObj.value;
//                                },
//                                destroy: function () {
//                                    warehouseObj.destroy();
//                                },
//                                write: function (args) {
//                                    warehouseObj = new ej.dropdowns.DropDownList({
//                                        dataSource: state.warehouseListLookupData,
//                                        fields: { value: 'id', text: 'name' },
//                                        value: args.rowData.warehouseId,
//                                        placeholder: 'Select a Warehouse',
//                                        floatLabelType: 'Never'
//                                    });
//                                    warehouseObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'productId',
//                            headerText: 'Product',
//                            width: 250,
//                            validationRules: { required: true },
//                            disableHtmlEncode: false,
//                            valueAccessor: (field, data, column) => {
//                                const product = state.productListLookupData.find(item => item.id === data[field]);
//                                return product ? `${product.numberName}` : '';
//                            },
//                            editType: 'dropdownedit',
//                            edit: {
//                                create: () => {
//                                    const productElem = document.createElement('input');
//                                    return productElem;
//                                },
//                                read: () => {
//                                    return productObj.value;
//                                },
//                                destroy: function () {
//                                    productObj.destroy();
//                                },
//                                write: function (args) {
//                                    productObj = new ej.dropdowns.DropDownList({
//                                        dataSource: state.productListLookupData,
//                                        fields: { value: 'id', text: 'numberName' },
//                                        value: args.rowData.productId,
//                                        change: function (e) {
//                                            if (movementObj) {
//                                                movementObj.value = 1;
//                                            }
//                                        },
//                                        placeholder: 'Select a Product',
//                                        floatLabelType: 'Never'
//                                    });
//                                    productObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'movement',
//                            headerText: 'Movement',
//                            width: 200,
//                            validationRules: {
//                                required: true,
//                                custom: [(args) => {
//                                    return args['value'] > 0;
//                                }, 'Must be a positive number and not zero']
//                            },
//                            type: 'number',
//                            format: 'N2', textAlign: 'Right',
//                            edit: {
//                                create: () => {
//                                    const movementElem = document.createElement('input');
//                                    return movementElem;
//                                },
//                                read: () => {
//                                    return movementObj.value;
//                                },
//                                destroy: function () {
//                                    movementObj.destroy();
//                                },
//                                write: function (args) {
//                                    movementObj = new ej.inputs.NumericTextBox({
//                                        value: args.rowData.movement ?? 0,
//                                    });
//                                    movementObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                    ],
//                    toolbar: [
//                        'ExcelExport',
//                        { type: 'Separator' },
//                        'Add', 'Edit', 'Delete', 'Update', 'Cancel',
//                    ],
//                    beforeDataBound: () => { },
//                    dataBound: function () { },
//                    excelExportComplete: () => { },
//                    rowSelected: () => {
//                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
//                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
//                        } else {
//                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
//                        }
//                    },
//                    rowDeselected: () => {
//                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
//                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
//                        } else {
//                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
//                        }
//                    },
//                    rowSelecting: () => {
//                        if (secondaryGrid.obj.getSelectedRecords().length) {
//                            secondaryGrid.obj.clearSelection();
//                        }
//                    },
//                    toolbarClick: (args) => {
//                        if (args.item.id === 'SecondaryGrid_excelexport') {
//                            secondaryGrid.obj.excelExport();
//                        }
//                    },
//                    actionComplete: async (args) => {
//                        if (args.requestType === 'save' && args.action === 'add') {
//                            try {
//                                const response = await services.createSecondaryData(state.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
//                                await methods.populateSecondaryData(state.id);
//                                secondaryGrid.refresh();
//                                if (response.data.code === 200) {
//                                    Swal.fire({
//                                        icon: 'success',
//                                        title: 'Save Successful',
//                                        timer: 2000,
//                                        showConfirmButton: false
//                                    });
//                                } else {
//                                    Swal.fire({
//                                        icon: 'error',
//                                        title: 'Save Failed',
//                                        text: response.data.message ?? 'Please check your data.',
//                                        confirmButtonText: 'Try Again'
//                                    });
//                                }
//                            } catch (error) {
//                                Swal.fire({
//                                    icon: 'error',
//                                    title: 'An Error Occurred',
//                                    text: error.response?.data?.message ?? 'Please try again.',
//                                    confirmButtonText: 'OK'
//                                });
//                            }
//                        }
//                        if (args.requestType === 'save' && args.action === 'edit') {
//                            try {
//                                const response = await services.updateSecondaryData(args.data.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
//                                await methods.populateSecondaryData(state.id);
//                                secondaryGrid.refresh();
//                                if (response.data.code === 200) {
//                                    Swal.fire({
//                                        icon: 'success',
//                                        title: 'Update Successful',
//                                        timer: 2000,
//                                        showConfirmButton: false
//                                    });
//                                } else {
//                                    Swal.fire({
//                                        icon: 'error',
//                                        title: 'Update Failed',
//                                        text: response.data.message ?? 'Please check your data.',
//                                        confirmButtonText: 'Try Again'
//                                    });
//                                }
//                            } catch (error) {
//                                Swal.fire({
//                                    icon: 'error',
//                                    title: 'An Error Occurred',
//                                    text: error.response?.data?.message ?? 'Please try again.',
//                                    confirmButtonText: 'OK'
//                                });
//                            }
//                        }
//                        if (args.requestType === 'delete') {
//                            try {
//                                const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
//                                await methods.populateSecondaryData(state.id);
//                                secondaryGrid.refresh();
//                                if (response.data.code === 200) {
//                                    Swal.fire({
//                                        icon: 'success',
//                                        title: 'Delete Successful',
//                                        timer: 2000,
//                                        showConfirmButton: false
//                                    });
//                                } else {
//                                    Swal.fire({
//                                        icon: 'error',
//                                        title: 'Delete Failed',
//                                        text: response.data.message ?? 'Please check your data.',
//                                        confirmButtonText: 'Try Again'
//                                    });
//                                }
//                            } catch (error) {
//                                Swal.fire({
//                                    icon: 'error',
//                                    title: 'An Error Occurred',
//                                    text: error.response?.data?.message ?? 'Please try again.',
//                                    confirmButtonText: 'OK'
//                                });
//                            }
//                        }
//                        methods.refreshSummary();
//                    }
//                });
//                secondaryGrid.obj.appendTo(secondaryGridRef.value);

//            },
//            refresh: () => {
//                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
//            }
//        };

//        const mainModal = {
//            obj: null,
//            create: () => {
//                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
//                    backdrop: 'static',
//                    keyboard: false
//                });
//            }
//        };

//        return {
//            mainGridRef,
//            mainModalRef,
//            secondaryGridRef,
//            numberRef,
//            receiveDateRef,
//            purchaseOrderIdRef,
//            statusRef,
//            state,
//            handler,
//        };
//    }
//};

//Vue.createApp(App).mount('#app');


const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            purchaseOrderListLookupData: [],
            goodsReceiveStatusListLookupData: [],
            globalAttributes:[],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            allWarehouses: [],
            systemWarehouse: null,
            mainTitle: null,
            id: '',
            number: '',
            receiveDate: '',
            description: '',
            purchaseOrderId: null,
            status: null,
            locationId: '',
            transportCharges: '',   // ✅ now at root level
            otherCharges: '',       // ✅ now at root level
            errors: {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: '',
                transportCharges: '',
                otherCharges: ''

            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            deletedItems: [] // Track deleted items for submission
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const receiveDateRef = Vue.ref(null);
        const purchaseOrderIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const transportChargesRef = Vue.ref(null);
        const otherChargesRef = Vue.ref(null);

        // **ENHANCED VALIDATION FUNCTION - SUBMIT TIME ONLY**
        const validateForm = function () {
            debugger;
           
            // Reset errors...
            let isValid = true;
            let hasValidReceivedQuantity = false;
            let hasValidMrp = false;

            state.errors.status = '';        // ← add this
            // ── Status validation ──────────────────────────────────────
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }

            if (!state.deleteMode && state.secondaryData.length > 0) {
                debugger;

                // ✅ End edit mode to commit pending changes
                if (secondaryGrid.obj.isEdit) {
                    secondaryGrid.obj.endEdit();
                }

                // Get only EDITS made in grid (not additions)
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    changedRecords: [],
                    deletedRecords: [],
                    addedRecords: []
                };

                // ✅ SIMPLIFIED: Use state as primary source (has all auto-added records)
                let currentSecondaryData = [...state.secondaryData];

                // Apply edits made in grid
                for (let changed of (batchChanges.changedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (item.purchaseOrderItemId === changed.purchaseOrderItemId) ||
                        (item.id && item.id === changed.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData[index] = {
                            ...currentSecondaryData[index],
                            ...changed,
                            unitPrice: changed.unitPrice ?? currentSecondaryData[index].unitPrice,
                            taxAmount: changed.taxAmount ?? currentSecondaryData[index].taxAmount,
                            FinalPrice: changed.FinalPrice ?? currentSecondaryData[index].FinalPrice,
                            MRP: changed.MRP ?? currentSecondaryData[index].MRP,
                            attribute1DetailId: changed.attribute1DetailId ?? currentSecondaryData[index].attribute1DetailId,
                            attribute2DetailId: changed.attribute2DetailId ?? currentSecondaryData[index].attribute2DetailId,
                            detailEntries: changed.detailEntries ?? currentSecondaryData[index].detailEntries
                        };
                    }
                }

                // Remove deleted items
                for (let deleted of (batchChanges.deletedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (deleted.purchaseOrderItemId && item.purchaseOrderItemId === deleted.purchaseOrderItemId) ||
                        (deleted.id && item.id === deleted.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData.splice(index, 1);
                    }
                }

                // ✅ NO need to push addedRecords (grid UI doesn't add records)
                // All records are already in state.secondaryData

                // ✅ Validate all items
                for (let item of currentSecondaryData) {
                    const rcvQty = parseFloat(item.receivedQuantity || 0);
                    const mrpVal = parseFloat(item.MRP || 0);

                    if (rcvQty > 0) {
                        hasValidReceivedQuantity = true;

                    } else if (rcvQty < 0) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Validation Error',
                            text: 'Received quantity cannot be negative.',
                            confirmButtonText: 'OK'
                        });
                        isValid = false;
                        break;
                    }
                    if (mrpVal > 0) {
                        hasValidMrp = true;
                    }
                    else if (mrpVal < 0) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Validation Error',
                            text: 'MRP should not be negative.',
                            confirmButtonText: 'OK'
                        });
                        isValid = false;
                        break;
                    }
                }

                if (isValid && !hasValidReceivedQuantity) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'At least one item must have received quantity greater than 0.',
                        confirmButtonText: 'OK'
                    });
                    isValid = false;
                }
                if (!hasValidMrp) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'MRP should not be negative.',
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
            //state.receiveDate = '';
            state.description = '';
            state.purchaseOrderId = null;
            state.status = null;
            state.transportCharges = 0;   
            state.otherCharges = 0;     
            state.errors = {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: '',
                transportCharges: '',
                otherCharges:''
            };
            state.secondaryData = [];
            state.deletedItems = [];
        };

        //const receiveDatePicker = {
        //    obj: null,
        //    create: () => {
        //        receiveDatePicker.obj = new ej.calendars.DatePicker({
        //            placeholder: 'Select Date',
        //            format: 'yyyy-MM-dd',
        //            value: state.receiveDate ? new Date(state.receiveDate) : null,
        //            change: (e) => {
        //                state.receiveDate = e.value;
        //            }
        //        });
        //        receiveDatePicker.obj.appendTo(receiveDateRef.value);
        //    },
        //    refresh: () => {
        //        if (receiveDatePicker.obj) {
        //            receiveDatePicker.obj.value = state.receiveDate ? new Date(state.receiveDate) : null;
        //        }
        //    }
        //};
        const receiveDatePicker = {
            obj: null,
            create: () => {
                const defaultDate = state.receiveDate
                    ? new Date(state.receiveDate)
                    : new Date();
                receiveDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: state.receiveDate ? new Date(state.receiveDate) : new Date(),
                    enabled: false,
                    change: (e) => {
                        state.receiveDate = e.value;
                    }
                });

                // ✅ IMPORTANT: sync state explicitly
                state.receiveDate = defaultDate;

                receiveDatePicker.obj.appendTo(receiveDateRef.value);
            },
            refresh: () => {
                debugger;
                if (receiveDatePicker.obj) {
                    const date = state.receiveDate
                        ? new Date(state.receiveDate)
                        : new Date();

                    receiveDatePicker.obj.value = date;

                    // keep state in sync
                    state.receiveDate = date;
                }
            }
        };

        //Vue.watch(
        //    () => state.receiveDate,
        //    (newVal, oldVal) => {
        //        receiveDatePicker.refresh();
        //        state.errors.receiveDate = '';
        //    }
        //);
        const setDefaultDate = () => {
            if (!state.receiveDate) {
                state.receiveDate = new Date();
            }

            if (receiveDatePicker.obj) {
                receiveDatePicker.obj.value = new Date(state.receiveDate);
            }
        };

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                    readonly: true,
                });
                numberText.obj.appendTo(numberRef.value);
            },
            refresh: () => {
                if (numberText.obj) {
                    if (state.id === '') {
                        numberText.obj.value = '';
                        numberText.obj.placeholder = '[auto]';
                    } else {
                        numberText.obj.value = state.number;
                        numberText.obj.placeholder = '';
                    }
                }
            }
        };

        Vue.watch(
            () => state.number,
            (newVal, oldVal) => {
                numberText.refresh();
            }
        );

        const purchaseOrderListLookup = {
            obj: null,
            create: () => {
                if (state.purchaseOrderListLookupData && Array.isArray(state.purchaseOrderListLookupData)) {
                    purchaseOrderListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.purchaseOrderListLookupData,
                        fields: { value: 'id', text: 'number' },
                        placeholder: 'Select Purchase Order',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('number', 'startsWith', e.text, true);
                            }
                            e.updateData(state.purchaseOrderListLookupData, query);
                        },
                        change: async (e) => {
                            state.purchaseOrderId = e.value;
                            if (e.value && state.id === '' && !state.deleteMode) {
                                await methods.populateSecondaryData();
                                secondaryGrid.refresh();
                                state.showComplexDiv = true;
                            }
                        }
                    });
                    purchaseOrderListLookup.obj.appendTo(purchaseOrderIdRef.value);
                }
            },
            refresh: () => {
                if (purchaseOrderListLookup.obj) {
                    purchaseOrderListLookup.obj.value = state.purchaseOrderId;
                    purchaseOrderListLookup.obj.enabled = state.id === '';
                }
            },
        };

        Vue.watch(
            () => state.purchaseOrderId,
            async (newVal, oldVal) => {
                purchaseOrderListLookup.refresh();
                state.errors.purchaseOrderId = '';
            }
        );

        const goodsReceiveStatusListLookup = {
            obj: null,
            create: () => {
                if (state.goodsReceiveStatusListLookupData && Array.isArray(state.goodsReceiveStatusListLookupData)) {
                    goodsReceiveStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.goodsReceiveStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });

                    goodsReceiveStatusListLookup.obj.appendTo(statusRef.value);

                    // ✅ Set first item as default selection
                    if (state.goodsReceiveStatusListLookupData.length > 0) {
                        const firstItem = state.goodsReceiveStatusListLookupData[0];
                        goodsReceiveStatusListLookup.obj.value = firstItem.id;
                        state.status = firstItem.id; // keep Vue state in sync
                    }
                }
            },
            refresh: () => {
                if (goodsReceiveStatusListLookup.obj) {
                    goodsReceiveStatusListLookup.obj.value = state.status;
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                goodsReceiveStatusListLookup.refresh();
                state.errors.status = '';
            }
        );
        let recalcTimer = null;

        Vue.watch(
            () => [state.transportCharges, state.otherCharges],
            async () => {
                clearTimeout(recalcTimer);
                recalcTimer = setTimeout(async () => {
                    await methods.recalculateFinalPrices();
                }, 500);
            }
        );



        // **UPDATED SERVICES FOR GOODS RECEIVE ITEMS**
        const services = {
            //getMainData: async () => {
            //    try {
            //        const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList', {});
            //        return response;
            //    } catch (error) {
            //        throw error;
            //    }
            //},
            getMainData: async () => {
                try {
                    debugger;
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList?LocationId=' + locationId, {
                        // <-- add this
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (
                receiveDate,
                description,
                status,
                purchaseOrderId,
                userId,
                items = [],
                defaultWarehouseId = null,
                freightCharges = 0,
                otherCharges = 0
            ) => {
                try {
                    //const locationId = StorageManager.getLocation();

                    const payload = {
                        ReceiveDate: receiveDate,
                        Description: description,
                        Status: status,
                        PurchaseOrderId: purchaseOrderId,
                        CreatedById: userId,
                        DefaultWarehouseId: defaultWarehouseId,
                        //LocationId: locationId,

                        // ✅ Header-level charges
                        FreightCharges: parseFloat(freightCharges || 0),
                        OtherCharges: parseFloat(otherCharges || 0),

                        // ✅ Item-level details
                        Items: (items || []).map(item => ({
                            PurchaseOrderItemId: item.PurchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.ReceivedQuantity || 0),
                            UnitPrice: parseFloat(item.UnitPrice || 0),
                            TaxAmount: parseFloat(item.TaxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalUnitPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.Notes || '',
                            WarehouseId: item.WarehouseId || defaultWarehouseId,
                            Attributes: item.Attributes ?? [],
                            Attribute1DetailId: item.attribute1DetailId,
                            Attribute2DetailId: item.attribute2DetailId,
                        }))
                    };

                    const response = await AxiosManager.post('/GoodsReceive/CreateGoodsReceive', payload, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },


            updateMainData: async (
                id,
                receiveDate,
                description,
                status,
                purchaseOrderId,
                updatedById,
                items = [],
                defaultWarehouseId = null,
                freightCharges = 0,
                otherCharges = 0
            ) => {
                try {
                    const locationId = defaultWarehouseId = StorageManager.getLocation();

                    const payload = {
                        Id: id,
                        ReceiveDate: receiveDate,
                        Description: description,
                        Status: status,
                        PurchaseOrderId: purchaseOrderId,
                        UpdatedById: updatedById,
                        DefaultWarehouseId: defaultWarehouseId,
                        LocationId: locationId,

                        // ✅ Header-level charges
                        FreightCharges: parseFloat(freightCharges || 0),
                        OtherCharges: parseFloat(otherCharges || 0),

                        // ✅ Item-level details
                        Items: (items || []).map(item => ({
                            Id: item.Id || null,
                            PurchaseOrderItemId: item.PurchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.ReceivedQuantity || 0),
                            UnitPrice: parseFloat(item.UnitPrice || 0),
                            TaxAmount: parseFloat(item.TaxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalUnitPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.Notes || '',
                            //WarehouseId: item.WarehouseId || defaultWarehouseId,
                            Attributes: item.Attributes ?? [],

                            Attribute1DetailId: item.attribute1DetailId,
                            Attribute2DetailId: item.attribute2DetailId,

                        }))
                    };

                    const response = await AxiosManager.post('/GoodsReceive/UpdateGoodsReceive', payload, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceive/DeleteGoodsReceive', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getPurchaseOrderListLookupData: async (purchaseOrderId = '', isDeleted = false) => {
                try {
                    const locationId = StorageManager.getLocation(); // could be null or string
                    const response = await AxiosManager.get('/PurchaseOrder/GetPurchaseOrder?purchaseOrderId=' + purchaseOrderId + '&isDeleted=' + isDeleted + '&LocationId=' + locationId, {
                        
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            getPurchaseOrderById: async (id) => {
                try {
                    const response = await AxiosManager.get('/PurchaseOrderItem/GetGoodsReceivedByPurchaseOrderId?purchaseOrderId=' + id, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getGoodsReceiveStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            //getGoodsReceiveItemDetailsListLookupData: async () => {
            //    try {
            //        const response = await AxiosManager.get('/GoodsReceive/GetAllAttributeValues', {});
            //        return response;
            //    } catch (error) {
            //        throw error;
            //    }
            //},

            getGoodsReceiveItemDetailsListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveItemDetails', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            // **UPDATED SECONDARY DATA SERVICES FOR GOODS RECEIVE ITEMS**
            getSecondaryData: async (goodsReceiveId) => {
                debugger;
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveItemList?goodsReceiveId=' + goodsReceiveId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (goodsReceiveId, purchaseOrderItemId, receivedQuantity, notes, createdById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceiveItem/CreateGoodsReceiveItem', {
                        goodsReceiveId, purchaseOrderItemId, receivedQuantity, notes, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, goodsReceiveId, purchaseOrderItemId, receivedQuantity, notes, updatedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceiveItem/UpdateGoodsReceiveItem', {
                        id, goodsReceiveId, purchaseOrderItemId, receivedQuantity, notes, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceiveItem/DeleteGoodsReceiveItem', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    debugger;
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Product/GetProductList?WarehouseId =' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getWarehouseListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getAttributeDetails: async (attributeId) => {
                debugger
                try {
                    const requestBody = {
                        attributeId: attributeId,
                        isDeleted: false
                    };
                    return AxiosManager.post('/Attribute/GetAttributeDetails', requestBody);

                } catch (error) {
                    throw error;
                }
            },

        };

        const methods = {
            populateMainData: async () => {
                debugger;
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    receiveDate: new Date(item.receiveDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            getLatestSecondaryData: () => {
                debugger
                // Step 1: Close any open edits to capture current changes
                if (secondaryGrid.obj) {
                    secondaryGrid.obj.closeEdit();
                }

                // Step 2: Get all changes from the grid
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    changed: [],
                    deleted: [],
                    added: []
                };

                // Step 3: Start with current data
                let latestData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...batchChanges.changedRecords];

                // Step 4: Apply all changes to get latest data
                for (let changed of (batchChanges.changed || [])) {
                    const index = latestData.findIndex(item =>
                        item.purchaseOrderItemId === changed.purchaseOrderItemId ||
                        item.id === changed.id
                    );
                    if (index !== -1) {
                        latestData[index] = { ...latestData[index], ...changed };
                    }
                }

                // Step 5: Remove deleted items
                for (let deleted of (batchChanges.deleted || [])) {
                    const index = latestData.findIndex(item =>
                        item.purchaseOrderItemId === deleted.purchaseOrderItemId ||
                        item.id === deleted.id
                    );
                    if (index !== -1) {
                        latestData.splice(index, 1);
                    }
                }

                // Step 6: Add new items
                latestData.push(...(batchChanges.added || []));

                return latestData;
            },

            forceRefreshSecondaryData: async () => {
                debugger
                try {
                    // Clear current data
                    state.secondaryData = [];

                    // Close any pending edits
                    if (secondaryGrid.obj) {
                        secondaryGrid.obj.closeEdit();
                    }

                    // Get fresh data from server
                    await methods.populateSecondaryData();

                    // Refresh the grid
                    secondaryGrid.refresh();
                    state.showComplexDiv = true;

                    console.log('Secondary data refreshed from server');
                } catch (error) {
                    console.error('Error refreshing secondary data:', error);
                }
            },

            populatePurchaseOrderListLookupData: async () => {
                const response = await services.getPurchaseOrderListLookupData();
                state.purchaseOrderListLookupData = response?.data?.content?.data;
            },
            populateGoodsReceiveStatusListLookupData: async () => {
                const response = await services.getGoodsReceiveStatusListLookupData();
                state.goodsReceiveStatusListLookupData = response?.data?.content?.data;
            },
            //populateGoodsReceiveItemDetailsListLookupData: async () => {
            //    const response = await services.getGoodsReceiveItemDetailsListLookupData();
            //    //state.goodsReceiveItemDetailsLookupData = response?.data?.content?.data;
            //    state.globalAttributes  = response?.data?.content || {
            //        allIMEI1: [],
            //        allIMEI2: [],
            //        allServiceNo: []
            //    };
            //},
            populateGoodsReceiveItemDetailsListLookupData: async () => {
                const response = await services.getGoodsReceiveItemDetailsListLookupData();
                state.globalAttributes = response?.data?.content;
                //state.globalAttributes = response?.data?.content || {
                //    allIMEI1: [],
                //    allIMEI2: [],
                //    allServiceNo: []
                //};
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
                state.allWarehouses = response?.data?.content?.data || [];
                state.warehouseListLookupData = state.allWarehouses.filter(warehouse => warehouse.systemWarehouse === false) || [];
                state.systemWarehouse = state.allWarehouses.find(warehouse => warehouse.systemWarehouse === true) || null;
            },
            // **UPDATED SECONDARY DATA POPULATION FOR GOODS RECEIVE ITEMS**
            // Update your existing populateSecondaryData method
            //populateSecondaryData: async () => {
            //    try {
            //        let secondary = [];

            //        if (state.id) {
            //            // ============================
            //            // 🔹 EDIT MODE – Load from API
            //            // ============================
            //            const response = await services.getSecondaryData(state.id);
            //            const goodsReceiveItems = response?.data?.content?.data || [];

            //            secondary = goodsReceiveItems.map(grItem => ({
            //                id: grItem.id,
            //                goodsReceiveId: state.id,
            //                warehouseId: grItem.warehouseId || (state.warehouseListLookupData[0]?.id || ''),
            //                purchaseOrderItemId: grItem.purchaseOrderItemId,
            //                productId: grItem.productId,
            //                actualQuantity: grItem.actualQuantity || 0,
            //                receivedQuantity: grItem.receivedQuantity || 0,
            //                remaingQuantity: grItem.remainingQuantity || 0,
            //                unitPrice: grItem.unitPrice ?? 0,
            //                taxAmount: grItem.taxAmount ?? 0,
            //                FinalPrice: grItem.finalUnitPrice ?? 0,
            //                MRP: grItem.mrp ?? 0,

            //                notes: grItem.notes || '',
            //                createdAtUtc: grItem.createdAtUtc ? new Date(grItem.createdAtUtc) : new Date(),

            //                // ============================
            //                //  MAP ATTRIBUTES TO UI FIELD
            //                // ============================
            //                detailEntries: (grItem.attributes || []).map(a => ({
            //                    IMEI1: a.imeI1 || '',
            //                    IMEI2: a.imeI2 || '',
            //                    ServiceNo: a.serviceNo || ''
            //                }))
            //            }));
            //        }
            //        else {
            //            // ============================
            //            // 🔹 CREATE MODE – Load from PO
            //            // ============================
            //            if (!state.purchaseOrderId) {
            //                state.secondaryData = [];
            //                return;
            //            }

            //            const poResponse = await services.getPurchaseOrderById(state.purchaseOrderId);
            //            const poItems = poResponse?.data?.content?.data || [];
            //            const locationId = StorageManager.getLocation();

            //            secondary = poItems.map(item => ({
            //                id: '',
            //                goodsReceiveId: state.id,
            //                warehouseId: locationId || '',
            //                purchaseOrderItemId: item.id,
            //                productId: item.productId,
            //                receivedQuantity: 0,
            //                actualQuantity: item.quantity || 0,
            //                remaingQuantity: item.remainingQuantity || 0,
            //                notes: item.notes,
            //                unitPrice: item.unitPrice,
            //                taxAmount: item.taxAmount,
            //                createdAtUtc: new Date(),

            //                // ============================
            //                // CREATE MODE = empty details
            //                // ============================
            //                detailEntries: []
            //            }));
            //        }

            //        state.secondaryData = secondary;
            //        state.deletedItems = [];

            //        methods.refreshSummary();

            //    } catch (error) {
            //        console.error('Error populating secondary data:', error);
            //        state.secondaryData = [];
            //    }
            //},
            populateSecondaryData: async () => {
                try {
                    let secondary = [];
                    debugger;
                    if (state.id) {
                        // -----------------------------
                        // 🟦 EDIT MODE – Load from API
                        // -----------------------------
                        const response = await services.getSecondaryData(state.id);
                        const goodsReceiveItems = response?.data?.content?.data || [];

                        secondary = await Promise.all(goodsReceiveItems.map(async (grItem) => {

                            // -----------------------------
                            // Load Attribute lists (per product)
                            // -----------------------------
                            const product = state.productListLookupData.find(p => p.id === grItem.productId);

                            let attribute1List = [];
                            let attribute2List = [];

                            if (product?.attribute1Id) {
                                try {
                                    const resp1 = await services.getAttributeDetails(product.attribute1Id);
                                    attribute1List = resp1.data?.content?.data ?? [];
                                } catch { attribute1List = []; }
                            }

                            if (product?.attribute2Id) {
                                try {
                                    const resp2 = await services.getAttributeDetails(product.attribute2Id);
                                    attribute2List = resp2.data?.content?.data ?? [];
                                } catch { attribute2List = []; }
                            }

                            // -----------------------------
                            // Convert Attributes → detailEntries array
                            // -----------------------------
                            const detailEntries = (grItem.attributes || []).map(a => ({
                                IMEI1: a.imeI1 || '',
                                IMEI2: a.imeI2 || '',
                                ServiceNo: a.serviceNo || ''
                            }));
                            // -----------------------------
                            // ⭐ VALIDATION LOGIC (Swal.fire)
                            // -----------------------------
                            let validationErrors = [];

                            detailEntries.forEach((d, index) => {

                                // SERVICE NUMBER REQUIRED
                                if (product?.isServiceRequired) {
                                    if (!d.ServiceNo || d.ServiceNo.trim() === "") {
                                        validationErrors.push(`Row ${index + 1}: <b>Service Number</b> is required.`);
                                    }
                                }

                                // IMEI1 REQUIRED
                                if (product?.isImeiRequired) {
                                    if (!d.IMEI1 || d.IMEI1.trim() === "") {
                                        validationErrors.push(`Row ${index + 1}: <b>IMEI1</b> is required.`);
                                    }
                                    else if (!/^\d{15}$/.test(d.IMEI1)) {
                                        validationErrors.push(`Row ${index + 1}: <b>IMEI1</b> must be 15 digits.`);
                                    }
                                }

                                // IMEI2 REQUIRED
                                if (product?.isImei2Required) {
                                    if (!d.IMEI2 || d.IMEI2.trim() === "") {
                                        validationErrors.push(`Row ${index + 1}: <b>IMEI2</b> is required.`);
                                    }
                                    else if (!/^\d{15}$/.test(d.IMEI2)) {
                                        validationErrors.push(`Row ${index + 1}: <b>IMEI2</b> must be 15 digits.`);
                                    }
                                }
                            });

                            // -----------------------------
                            // Show Swal if errors found
                            // -----------------------------
                            if (validationErrors.length > 0) {

                                Swal.fire({
                                    icon: 'error',
                                    title: 'Validation Error',
                                    html: validationErrors.join("<br>"),
                                    confirmButtonColor: '#d33'
                                });

                                return; // STOP save
                            }
                            return {
                                id: grItem.id,
                                goodsReceiveId: state.id,
                                warehouseId: grItem.warehouseId || '',
                                purchaseOrderItemId: grItem.purchaseOrderItemId,
                                productId: grItem.productId,

                                // quantities
                                actualQuantity: grItem.actualQuantity || 0,
                                receivedQuantity: grItem.receivedQuantity || 0,
                                remaingQuantity: grItem.remainingQuantity || 0,
                                unitPrice: grItem.unitPrice ?? 0,
                                taxAmount: grItem.taxAmount ?? 0,
                                FinalPrice: grItem.finalUnitPrice ?? 0,
                                MRP: grItem.mrp ?? 0,
                                notes: grItem.notes || "",

                                createdAtUtc: grItem.createdAtUtc ? new Date(grItem.createdAtUtc) : new Date(),

                                // IMEI details
                                detailEntries,

                                // Attribute dropdown values
                                attribute1DetailId: grItem.attribute1DetailId || null,
                                attribute2DetailId: grItem.attribute2DetailId || null,

                                // Dropdown lists
                                attribute1List,
                                attribute2List
                            };
                        }));
                    }

                    else {
                        // -----------------------------
                        // 🟩 CREATE MODE – Load from PO
                        // -----------------------------
                        if (!state.purchaseOrderId) {
                            state.secondaryData = [];
                            return;
                        }

                        const poResponse = await services.getPurchaseOrderById(state.purchaseOrderId);
                        const poItems = poResponse?.data?.content?.data || [];
                        const locationId = StorageManager.getLocation();

                        secondary = await Promise.all(poItems.map(async (item) => {

                            // Load product attributes
                            const product = state.productListLookupData.find(p => p.id === item.productId);
                            let attribute1List = [];
                            let attribute2List = [];

                            if (product?.attribute1Id) {
                                try {
                                    const resp1 = await services.getAttributeDetails(product.attribute1Id);
                                    attribute1List = resp1.data?.content?.data ?? [];
                                } catch { attribute1List = []; }
                            }

                            if (product?.attribute2Id) {
                                try {
                                    const resp2 = await services.getAttributeDetails(product.attribute2Id);
                                    attribute2List = resp2.data?.content?.data ?? [];
                                } catch { attribute2List = []; }
                            }

                            return {
                                id: '',
                                goodsReceiveId: state.id,
                                warehouseId: locationId || '',
                                purchaseOrderItemId: item.id,
                                productId: item.productId,

                                receivedQuantity: 0,
                                actualQuantity: item.quantity || 0,
                                remaingQuantity: item.remainingQuantity || 0,

                                notes: '',
                                unitPrice: item.unitPrice,
                                taxAmount: item.taxAmount,
                                MRP: item.mrp || 0,
                                createdAtUtc: new Date(),

                                detailEntries: [],

                                // Attributes (empty on create)
                                attribute1DetailId: item.attribute1DetailId,
                                attribute2DetailId: item.attribute2DetailId,

                                attribute1List,
                                attribute2List
                            };
                        }));
                    }

                    // Apply to state
                    state.secondaryData = secondary;
                    state.deletedItems = [];

                    secondaryGrid.refresh();
                    methods.refreshSummary();

                } catch (error) {
                    console.error("populateSecondaryData Error:", error);
                    state.secondaryData = [];
                }
            },
            //refreshSummary: () => {
            //     debugger
            //    let total = 0;
            //    const batch = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
            //        changed: [],
            //        deleted: [],
            //        added: []
            //    };

            //    const changedMap = new Map();
            //    for (let ch of batch.changed || []) {
            //        changedMap.set(ch.purchaseOrderItemId, ch.receivedQuantity);
            //    }
            //    for (let del of batch.deleted || []) {
            //        changedMap.set(del.purchaseOrderItemId, 0);
            //    }
            //    for (let add of batch.added || []) {
            //        total += add.receivedQuantity ?? 0;
            //    }
            //    for (let record of state.secondaryData) {
            //        if (changedMap.has(record.purchaseOrderItemId)) {
            //            total += changedMap.get(record.purchaseOrderItemId);
            //        } else {
            //            total += record.receivedQuantity ?? 0;
            //        }
            //    }

            //    state.totalMovementFormatted = NumberFormatManager.formatToLocale(total);
            //},
            onMainModalHidden: () => {
                state.errors.receiveDate = '';
                state.errors.purchaseOrderId = '';
                state.errors.status = '';
                state.errors.description = '';

            },
            // **BULK DATA PREPARATION FOR GOODS RECEIVE ITEMS**
            prepareSecondaryDataForSubmission: function () {
                const batchChanges = secondaryGrid.obj
                    ? secondaryGrid.obj.getBatchChanges()
                    : { addedRecords: [], changedRecords: [], deletedRecords: [] };

                // 🔥 FIX: Always use state.secondaryData as base (includes programmatic adds)
                // No ternary — this handles both new and existing forms correctly
                let currentSecondaryData = [...state.secondaryData];

                const matchRecord = (a, b) =>
                    (a.purchaseOrderItemId && b.purchaseOrderItemId && a.purchaseOrderItemId === b.purchaseOrderItemId) ||
                    (a.id && b.id && a.id === b.id);

                // ✅ Apply changed records (FIX: Use changedRecords, not 'changed')
                for (let changed of (batchChanges.changedRecords || [])) {
                    const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                    if (index !== -1) {
                        currentSecondaryData[index] = {
                            ...currentSecondaryData[index],
                            ...changed,
                            // Preserve/apply specific fields if needed (from validateForm)
                            unitPrice: changed.unitPrice ?? currentSecondaryData[index].unitPrice,
                            taxAmount: changed.taxAmount ?? currentSecondaryData[index].taxAmount,
                            FinalPrice: changed.FinalPrice ?? currentSecondaryData[index].FinalPrice,
                            MRP: changed.MRP ?? currentSecondaryData[index].MRP,
                            attribute1DetailId: changed.attribute1DetailId ?? currentSecondaryData[index].attribute1DetailId,
                            attribute2DetailId: changed.attribute2DetailId ?? currentSecondaryData[index].attribute2DetailId,
                            detailEntries: changed.detailEntries ?? currentSecondaryData[index].detailEntries
                        };
                    }
                }

                // ✅ Remove deleted items safely
                const deletedItems = batchChanges.deletedRecords || [];
                if (deletedItems.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deletedItems.some(deleted => matchRecord(item, deleted))
                    );
                }

                // REMOVED: Add new records — empty due to allowAdding: false, and programmatic adds are already in base

                // ✅ Validate all items first (before filtering/formatting)
                // Collect errors to show all at once, or throw if any fail
                const validationErrors = [];
                for (let item of currentSecondaryData) {
                    const rcvQty = parseFloat(item.receivedQuantity || 0);
                    const mrpVal = parseFloat(item.MRP || 0);
                    if (rcvQty > 0) {
                        
                    } else if (rcvQty < 0) {
                        validationErrors.push('Received quantity cannot be negative.');
                    }
                }

                if (validationErrors.length > 0) {
                    // Show all errors in one dialog
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        html: validationErrors.map(err => `<p>${err}</p>`).join(''),
                        confirmButtonText: 'OK'
                    });
                    // ❌ Stop submission by returning empty
                    return { validItems: [], deletedItems };
                }

                // ✅ No errors: Filter to only valid items (rcvQty > 0) and format numerics
                const validItems = currentSecondaryData
                    .filter(item => {
                        const rcvQty = parseFloat(item.receivedQuantity || 0);
                        return rcvQty > 0;
                    })
                    .map(item => {
                        const rcvQty = parseFloat(item.receivedQuantity || 0);
                        const mrpVal = parseFloat(item.MRP || 0);
                        // ✅ Ensure numeric formatting before submission
                        return {
                            ...item,
                            receivedQuantity: parseFloat(rcvQty.toFixed(2)),
                            unitPrice: parseFloat((item.unitPrice || 0).toFixed(2)),
                            taxAmount: parseFloat((item.taxAmount || 0).toFixed(2)),
                            FinalPrice: parseFloat((item.FinalPrice || 0).toFixed(2)),
                            MRP: parseFloat(mrpVal.toFixed(2))
                        };
                    });

                // Optional: Check if any valid items exist
                if (validItems.length === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'At least one item must have received quantity greater than 0.',
                        confirmButtonText: 'OK'
                    });
                    return { validItems: [], deletedItems };
                }

                return { validItems, deletedItems };
            },
            // 🔹 2️⃣ CALCULATION METHODS (SYNCHRONOUS)
            // 🔹 Final price calculator
            recalculateFinalPrices: async () => {
                const totalReceivedQty = state.secondaryData.reduce(
                    (sum, item) => sum + (parseFloat(item.receivedQuantity) || 0),
                    0
                );

                const totalFreight = parseFloat(state.transportCharges || 0);
                const totalOther = parseFloat(state.otherCharges || 0);

                // 🧮 No received quantities → reset all
                if (totalReceivedQty <= 0) {
                    state.secondaryData.forEach(item => {
                        item.FinalPrice = 0.00;
                    });
                    secondaryGrid.refresh();
                    await methods.refreshSummary();
                    return;
                }

                // ✅ Per-unit distribution across all received quantity
                const freightPerUnit = totalFreight / totalReceivedQty;
                const otherPerUnit = totalOther / totalReceivedQty;

                // 🧾 Apply per-unit charge and ensure 2 decimal format
                state.secondaryData.forEach(item => {
                    const rcvQty = parseFloat(item.receivedQuantity || 0);

                    if (rcvQty > 0) {
                        const finalCost =
                            (parseFloat(item.unitPrice) || 0) +
                            (parseFloat(item.taxAmount) || 0) +
                            freightPerUnit +
                            otherPerUnit;

                        // ✅ Always store rounded numeric value
                        item.FinalPrice = parseFloat(finalCost.toFixed(2));

                        // ✅ If MRP exists, ensure proper decimal formatting
                        if (item.MRP !== undefined && item.MRP !== null) {
                            item.MRP = parseFloat(parseFloat(item.MRP).toFixed(2));
                        }
                    } else {
                        item.FinalPrice = 0.00;
                    }
                });

                // ✅ Refresh the grid for format application
                secondaryGrid.refresh();
                await methods.refreshSummary();
            },


            // 🔹 3️⃣ UI REFRESH OR SUMMARY METHODS
            refreshSummary: async () => {
                const totalMovement = state.secondaryData.reduce(
                    (sum, item) => sum + (parseFloat(item.receivedQuantity) || 0),
                    0
                );
                state.totalMovementFormatted = totalMovement.toFixed(2);
            },

            openDetailModal: async (poItemId) => {
                debugger;

                // -------------------------------------------------------
                // 1. FIND ROW
                // -------------------------------------------------------
                const rowIndex = state.secondaryData.findIndex(
                    row => row.purchaseOrderItemId === poItemId
                );

                if (rowIndex === -1) {
                    console.error("Row not found for PO:", poItemId);
                    return;
                }

                state.currentDetailPOItemId = poItemId;
                state.currentDetailRowIndex = rowIndex;

                const originalRow = state.secondaryData[rowIndex];

                // -------------------------------------------------------
                // 2. DEEP CLONE ROW (Prevents MRP/Notes resetting)
                // -------------------------------------------------------
                state.activeDetailRow = JSON.parse(JSON.stringify(originalRow));

                const rowData = state.activeDetailRow;

                // -------------------------------------------------------
                // 3. LOAD PRODUCT
                // -------------------------------------------------------
                const product = state.productListLookupData.find(p => p.id === rowData.productId);
                if (!product) {
                    Swal.fire("Error", "Product not found.", "error");
                    return;
                }

                // -------------------------------------------------------
                // 4. CHECK RECEIVED QUANTITY FIRST
                // -------------------------------------------------------
                const qty = parseFloat(rowData.receivedQuantity || 0);

                if (!qty || qty <= 0) {
                    document.getElementById("detailFormArea").innerHTML = `
            <div class="alert alert-warning text-center p-2">
                <strong>No Quantity Entered.</strong><br/>
                Please enter Received Quantity first.
            </div>
        `;
                    Swal.fire({
                        icon: "error",
                        title: "Validation Error",
                        text: "Please enter received quantity before adding attributes."
                    });
                    return;
                }

                // -------------------------------------------------------
                // 5. BUILD FIELDS BASED ON PRODUCT CONFIG
                // -------------------------------------------------------
                let fields = [];
                if (product.imei1) fields.push("IMEI1");
                if (product.imei2) fields.push("IMEI2");
                if (product.serviceNo) fields.push("ServiceNo");

                const existingDetails = rowData.detailEntries || [];

                // -------------------------------------------------------
                // 6. BUILD HTML TABLE
                // -------------------------------------------------------
                let html = `
        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    ${fields.map(f => `<th>${f}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

                for (let i = 0; i < qty; i++) {
                    html += `<tr>`;
                    fields.forEach(field => {
                        const val =
                            existingDetails[i] && existingDetails[i][field]
                                ? existingDetails[i][field]
                                : "";
                        html += `
                <td>
                    <input type="text" 
                           class="form-control detail-input"
                           data-index="${i}"
                           data-field="${field}"
                           value="${val}">
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

                // -------------------------------------------------------
                // 7. OPEN MODAL
                // -------------------------------------------------------
                const modalEl = document.getElementById("detailModal");
                const modal = new bootstrap.Modal(modalEl);
                modal.show();

                // -------------------------------------------------------
                // 8. Save: Merge values back into original row
                // -------------------------------------------------------
                document.getElementById("detailSaveBtn").onclick = () => {
                    methods.saveDetailEntries();
                    modal.hide();
                };

                // -------------------------------------------------------
                // 9. FIX SCROLL ISSUE — Restore main modal scroll
                // -------------------------------------------------------
                modalEl.addEventListener("hidden.bs.modal", () => {
                    const mainModal = document.getElementById("MainModal");
                    if (mainModal.classList.contains("show")) {
                        document.body.classList.add("modal-open");
                    }
                });
            },

    //        openDetailModal: async (poItemId) => {
    //            debugger;
    //            // store ID
    //            state.currentDetailPOItemId = poItemId;

    //            // find row index manually
    //            const rowIndex = state.secondaryData.findIndex(
    //                row => row.purchaseOrderItemId === poItemId
    //            );

    //            if (rowIndex === -1) {
    //                console.error("Row not found for PO:", poItemId);
    //                return;
    //            }

    //            state.currentDetailRowIndex = rowIndex;

    //            const rowData = state.secondaryData[rowIndex];

    //            const product = state.productListLookupData.find(p => p.id === rowData.productId);
    //            if (!product) {
    //                console.error("Product not found:", productId);
    //                return;
    //            }

    //            const qty = parseFloat(rowData.receivedQuantity || 0);
    //            if (!qty || qty <= 0) {
    //                document.getElementById("detailFormArea").innerHTML = `
    //    <div class="alert alert-warning text-center p-2">
    //        <strong>No Quantity Entered.</strong><br/>
    //        Please enter Received Quantity first.
    //    </div>
    //`;
    //                Swal.fire({
    //                    icon: 'error',
    //                    title: 'Validation Error',
    //                    text: 'At least one item must have received quantity greater than 0.',
    //                    confirmButtonText: 'OK'
    //                });
    //                return;    // stop here
    //            }

    //            let fields = [];

    //            if (product.imei1) fields.push("IMEI1");
    //            if (product.imei1) fields.push("IMEI2");
    //            if (product.serviceNo) fields.push("ServiceNo");

    //            const existingDetails = rowData.detailEntries || [];

    //            let html = `
    //    <table class="table table-bordered table-sm">
    //        <thead>
    //            <tr>
    //`;

    //            fields.forEach(f => {
    //                html += `<th>${f}</th>`;
    //            });

    //            html += `
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
    //                <input 
    //                    type="text"
    //                    class="form-control detail-input"
    //                    data-index="${i}"
    //                    data-field="${field}"
    //                    value="${val}"
    //                />
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

    //            // show modal
    //            const modal = new bootstrap.Modal(document.getElementById("detailModal"));
    //            modal.show();

    //            // attach save handler
    //            document.getElementById("detailSaveBtn").onclick = () => {
    //                methods.saveDetailEntries();
    //                modal.hide();
    //            };
    //        },

            saveDetailEntries: async () => {
                const poItemId = state.currentDetailPOItemId;
                const rowIndex = state.secondaryData.findIndex(
                    item => item.purchaseOrderItemId === poItemId
                );

                if (rowIndex === -1) {
                    console.error("Cannot save — row not found");
                    return;
                }


                let entries = [];
                const inputs = document.querySelectorAll(".detail-input");

                inputs.forEach(input => {
                    const i = input.dataset.index;
                    const f = input.dataset.field;

                    if (!entries[i]) entries[i] = {};
                    entries[i][f] = input.value;
                });

                state.secondaryData[rowIndex].detailEntries = entries;

                const rowData = state.secondaryData[rowIndex];

                if (!methods.validateDetailEntries(rowData)) {
                    return;
                }
                if (rowData.detailEntries.length !== rowData.receivedQuantity) {
                    Swal.fire({
                        icon: "error",
                        title: "Received Quantity not matching with Attributes length",
                        //    html: errors.join("<br>")
                    });
                    return;
                }
                //secondaryGrid.refresh(state.secondaryData);
                // ── Best way: update only the changed row ───────────────────────────────
                if (secondaryGrid?.obj) {
                    // Method 1: Update specific row by index (preserves everything else)
                    secondaryGrid.obj.updateRow(rowIndex, rowData);

                    // Method 2: Or refresh only the changed row (if updateRow not available)
                    // secondaryGrid.obj.refreshRow(rowIndex);

                    // Optional: force full visual refresh only if needed
                    // secondaryGrid.obj.refresh();
                } else {
                    console.warn("Grid not initialized");
                }

                console.log("Saved detail entries:", entries);

                console.log("Saved:", entries);
            },
            //collectDetailAttributes: (row) => {
            //    const Attributes = [];
            //    const errors = [];

            //    // -------------------------------
            //    // Ensure product exists
            //    // -------------------------------
            //    const product = state.productListLookupData.find(p => p.id === row.productId);
            //    if (!product) {
            //        errors.push(`Product not found for row with productId = ${row.productId}`);
            //        return { Attributes, errors };
            //    }
            //    const global = state.globalAttributes;

            //    if (product.imei1 || product.imei2 || product.serviceNo) {
            //        if (!row.detailEntries || row.detailEntries.length === 0) {
            //            errors.push(`Please enter required product attributes (IMEI / Service No) for product`);
            //            return { Attributes, errors };
            //        }
            //    }
            //    // Local duplicates inside same GR item
            //    // -------------------------------
            //    const localIMEI1 = new Set();
            //    const localIMEI2 = new Set();
            //    const localServiceNo = new Set();

            //    // -------------------------------
            //    // Iterate detail rows
            //    // -------------------------------
            //    row.detailEntries.forEach((entry, index) => {
            //        const imei1 = (entry.IMEI1 || "").trim();
            //        const imei2 = (entry.IMEI2 || "").trim();
            //        const serviceNo = (entry.ServiceNo || "").trim();

            //        // -------------------------------
            //        // REQUIRED FIELD VALIDATION
            //        // -------------------------------
            //        if (product.imei1) {
            //            if (!imei1) errors.push(`IMEI1 missing at row ${index + 1} for product ${row.productId}`);
            //            else if (!/^\d{15}$/.test(imei1)) errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);
            //        }

            //        if (product.imei2) {
            //            if (!imei2) errors.push(`IMEI2 missing at row ${index + 1}`);
            //            else if (!/^\d{15}$/.test(imei2)) errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);
            //        }

            //        if (product.serviceNo) {
            //            if (!serviceNo) errors.push(`Service No missing at row ${index + 1}`);
            //        }

            //        // -------------------------------
            //        // IMEI1 != IMEI2 validation
            //        // -------------------------------
            //        if (product.imei1 && product.imei2) {
            //            if (imei1 && imei2 && imei1 === imei2) {
            //                errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);
            //            }
            //        }

            //        // -------------------------------
            //        // LOCAL DUPLICATE CHECK
            //        // -------------------------------
            //        if (imei1 && localIMEI1.has(imei1))
            //            errors.push(`Duplicate IMEI1 (${imei1}) within same item at row ${index + 1}`);

            //        if (imei2 && localIMEI2.has(imei2))
            //            errors.push(`Duplicate IMEI2 (${imei2}) within same item at row ${index + 1}`);

            //        if (serviceNo && localServiceNo.has(serviceNo))
            //            errors.push(`Duplicate Service No (${serviceNo}) within same item at row ${index + 1}`);

            //        localIMEI1.add(imei1);
            //        localIMEI2.add(imei2);
            //        localServiceNo.add(serviceNo);

            //        // -------------------------------
            //        // 3️⃣ Global Duplicate Check (Database)
            //        // -------------------------------
            //        if (imei1 && global.allIMEI1.includes(imei1))
            //            errors.push(`IMEI1 (${imei1}) already exists in system`);

            //        if (imei2 && global.allIMEI2.includes(imei2))
            //            errors.push(`IMEI2 (${imei2}) already exists in system`);

            //        if (serviceNo && global.allServiceNo.includes(serviceNo))
            //            errors.push(`Service No (${serviceNo}) already exists in system`);

            //        // -------------------------------
            //        // ADD TO RETURN PAYLOAD
            //        // -------------------------------
            //        Attributes.push({
            //            RowIndex: index,
            //            IMEI1: imei1 ,
            //            IMEI2: imei2,
            //            ServiceNo: serviceNo,
            //        });
            //    });
            //    if (row.detailEntries.length !== row.receivedQuantity) {
            //        errors.push("Received Quantity not matching with Attributes length");
            //    }

            //    return { Attributes, errors };
            //},


            collectDetailAttributes: (row) => {
                const Attributes = [];
                const errors = [];

                const safeTrim = (value) => {
                    if (value == null) return null;
                    if (typeof value !== 'string') return null;
                    const trimmed = value.trim();
                    return trimmed === '' ? null : trimmed;
                };

                const product = state.productListLookupData.find(p => p.id === row.productId);
                if (!product) {
                    errors.push(`Product not found for row with productId = ${row.productId}`);
                    return { Attributes, errors };
                }

                const detailEntries = row.detailEntries || [];
                if ((product.imei1 || product.imei2 || product.serviceNo) && detailEntries.length === 0) {
                    errors.push(`Please enter required product attributes (IMEI / Service No) for product`);
                    return { Attributes, errors };
                }

                // --------------------------------------------------
                // BUILD GLOBAL SETS FROM TABLE DATA
                // --------------------------------------------------
                const globalList = state.globalAttributes || [];
                const globalIMEI1Set = new Set(
                    globalList.map(x => safeTrim(x.imei1 || x.imeI1)).filter(Boolean)
                );
                const globalIMEI2Set = new Set(
                    globalList.map(x => safeTrim(x.imei2 || x.imeI2)).filter(Boolean)
                );
                const globalServiceSet = new Set(
                    globalList.map(x => safeTrim(x.serviceNo || x.serviceno)).filter(Boolean)
                );

                // --------------------------------------------------
                // EXCLUDE ORIGINAL VALUES OF THIS ROW (EDIT MODE FIX)
                // --------------------------------------------------
                const original = (detailEntries || []).map(x => ({
                    imei1: safeTrim(x.IMEI1),
                    imei2: safeTrim(x.IMEI2),
                    serviceNo: safeTrim(x.ServiceNo)
                }));

                original.forEach(x => {
                    if (x.imei1) globalIMEI1Set.delete(x.imei1);
                    if (x.imei2) globalIMEI2Set.delete(x.imei2);
                    if (x.serviceNo) globalServiceSet.delete(x.serviceNo);
                });

                // --------------------------------------------------
                // LOCAL DUPLICATE TRACKING
                // --------------------------------------------------
                const localIMEI1 = new Set();
                const localIMEI2 = new Set();
                const localServiceNo = new Set();

                // --------------------------------------------------
                // PROCESS EACH ENTRY
                // --------------------------------------------------
                detailEntries.forEach((entry, index) => {
                    const imei1 = safeTrim(entry.IMEI1 || entry.imeI1);
                    const imei2 = safeTrim(entry.IMEI2 || entry.imeI2);
                    const serviceNo = safeTrim(entry.ServiceNo || entry.serviceNo);

                    // Required validations
                    if (product.imei1) {
                        if (!imei1) errors.push(`IMEI1 missing at row ${index + 1}`);
                        else if (!/^\d{15}$/.test(imei1)) errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);
                    }
                    if (product.imei2) {
                        if (!imei2) errors.push(`IMEI2 missing at row ${index + 1}`);
                        else if (!/^\d{15}$/.test(imei2)) errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);
                    }
                    if (product.serviceNo && !serviceNo) {
                        errors.push(`Service No missing at row ${index + 1}`);
                    }
                    if (imei1 && imei2 && imei1 === imei2) {
                        errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);
                    }

                    // Local duplicates
                    if (imei1 && localIMEI1.has(imei1))
                        errors.push(`Duplicate IMEI1 (${imei1}) within same item at row ${index + 1}`);
                    if (imei2 && localIMEI2.has(imei2))
                        errors.push(`Duplicate IMEI2 (${imei2}) within same item at row ${index + 1}`);
                    if (serviceNo && localServiceNo.has(serviceNo))
                        errors.push(`Duplicate Service No (${serviceNo}) within same item at row ${index + 1}`);

                    localIMEI1.add(imei1);
                    localIMEI2.add(imei2);
                    localServiceNo.add(serviceNo);

                    // Global duplicates
                    if (imei1 && globalIMEI1Set.has(imei1))
                        errors.push(`IMEI1 (${imei1}) already exists in system`);
                    if (imei2 && globalIMEI2Set.has(imei2))
                        errors.push(`IMEI2 (${imei2}) already exists in system`);
                    if (serviceNo && globalServiceSet.has(serviceNo))
                        errors.push(`Service No (${serviceNo}) already exists in system`);

                    // Add to payload – keep null values as null
                    Attributes.push({
                        RowIndex: index + 1,
                        IMEI1: imei1,       // null if not provided
                        IMEI2: imei2,
                        ServiceNo: serviceNo
                    });
                });

                if (detailEntries.length !== row.receivedQuantity) {
                    errors.push("Received Quantity not matching with Attributes length");
                }

                return { Attributes, errors };
            },
            
            //validateDetailEntries: (row) => {
            //    const errors = [];

            //    // -------------------------------
            //    // Product must be loaded
            //    // -------------------------------
            //    const product = state.productListLookupData.find(p => p.id === row.productId);
            //    if (!product) {
            //        errors.push(`Product not found for ProductId: ${row.productId}`);
            //    }
            //    const global = state.globalAttributes;

            //    // -------------------------------
            //    // Detail entries check
            //    // -------------------------------
            //    if (product.imei1 || product.imei2 || product.serviceNo) {
            //        if (!row.detailEntries || row.detailEntries.length === 0) {
            //            errors.push(`Please enter required product attributes (IMEI / Service No) for product`);
            //        }
            //    }

            //    // -------------------------------
            //    // Local duplicate sets (within same item)
            //    // -------------------------------
            //    const localIMEI1 = new Set();
            //    const localIMEI2 = new Set();
            //    const localServiceNo = new Set();


            //    // -------------------------------
            //    // LOOP ITEMS
            //    // -------------------------------
            //    row.detailEntries.forEach((entry, index) => {
            //        const imei1 = (entry.IMEI1 || "").trim();
            //        const imei2 = (entry.IMEI2 || "").trim();
            //        const serviceNo = (entry.ServiceNo || "").trim();

            //        // ================================
            //        // REQUIRED FIELD VALIDATION (based on product flags)
            //        // ================================
            //        if (product.imei1) {
            //            if (!imei1) errors.push(`IMEI1 missing at row ${index + 1} for product ${row.productId}`);
            //            else if (!/^\d{15}$/.test(imei1)) errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);
            //        }

            //        if (product.imei2) {
            //            if (!imei2) errors.push(`IMEI2 missing at row ${index + 1}`);
            //            else if (!/^\d{15}$/.test(imei2)) errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);
            //        }

            //        if (product.serviceNo) {
            //            if (!serviceNo) errors.push(`Service No missing at row ${index + 1}`);
            //        }

            //        // ================================
            //        // IMEI1 ≠ IMEI2
            //        // ================================
            //        if (imei1 && imei2 && imei1 === imei2) {
            //            errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);
            //        }

            //        // ================================
            //        // LOCAL DUPLICATES (same item)
            //        // ================================
            //        if (imei1 && localIMEI1.has(imei1))
            //            errors.push(`Duplicate IMEI1 (${imei1}) within same item at row ${index + 1}`);

            //        if (imei2 && localIMEI2.has(imei2))
            //            errors.push(`Duplicate IMEI2 (${imei2}) within same item at row ${index + 1}`);

            //        if (serviceNo && localServiceNo.has(serviceNo))
            //            errors.push(`Duplicate Service No (${serviceNo}) within same item at row ${index + 1}`);

            //        localIMEI1.add(imei1);
            //        localIMEI2.add(imei2);
            //        localServiceNo.add(serviceNo);


            //        // -------------------------------
            //        // 3️⃣ Global Duplicate Check (Database)
            //        // -------------------------------
            //        if (imei1 && global.allIMEI1.includes(imei1))
            //            errors.push(`IMEI1 (${imei1}) already exists in system`);

            //        if (imei2 && global.allIMEI2.includes(imei2))
            //            errors.push(`IMEI2 (${imei2}) already exists in system`);

            //        if (serviceNo && global.allServiceNo.includes(serviceNo))
            //            errors.push(`Service No (${serviceNo}) already exists in system`);
            //    });

            //    if (row.detailEntries.length !== row.receivedQuantity) {
            //        errors.push("Received Quantity not matching with Attributes length");
            //    }
            //    if (errors.length > 0) {
            //        Swal.fire({
            //            icon: "error",
            //            title: "Validation Failed",
            //            html: errors.join("<br>")
            //        });

            //        return false;
            //    }

            //    return true ;
            //},

            validateDetailEntries: (row) => {
                const errors = [];

                const product = state.productListLookupData.find(p => p.id === row.productId);
                if (!product) {
                    errors.push(`Product not found for ProductId: ${row.productId}`);
                    return false;
                }

                const detailEntries = row.detailEntries || [];

                // Require detail rows if tracking is enabled
                if ((product.imei1 || product.imei2 || product.serviceNo) && detailEntries.length === 0) {
                    errors.push(`Please enter required product attributes (IMEI / Service No)`);
                }

                // --------------------------------------------------
                // BUILD GLOBAL SETS FROM TABLE DATA
                // --------------------------------------------------
                const globalList = state.globalAttributes || [];

                const globalIMEI1Set = new Set(globalList.map(x => (x.imei1 || x.imeI1||"").trim()).filter(Boolean));
                const globalIMEI2Set = new Set(globalList.map(x => (x.imei2 || x.imeI2 || "").trim()).filter(Boolean));
                const globalServiceSet = new Set(globalList.map(x => (x.serviceNo || x.serviceno || "").trim()).filter(Boolean));

                // --------------------------------------------------
                // EXCLUDE ORIGINAL VALUES OF THIS ROW (EDIT MODE FIX)
                // --------------------------------------------------
                const original = (row.originalDetailEntries || []).map(x => ({
                    imei1: (x.IMEI1 || "").trim(),
                    imei2: (x.IMEI2 || "").trim(),
                    serviceNo: (x.ServiceNo || "").trim()
                }));

                original.forEach(x => {
                    globalIMEI1Set.delete(x.imei1);
                    globalIMEI2Set.delete(x.imei2);
                    globalServiceSet.delete(x.serviceNo);
                });

                // --------------------------------------------------
                // LOCAL DUPLICATE TRACKING
                // --------------------------------------------------
                const localIMEI1 = new Set();
                const localIMEI2 = new Set();
                const localServiceNo = new Set();

                // --------------------------------------------------
                // LOOP ENTRIES
                // --------------------------------------------------
                detailEntries.forEach((entry, index) => {
                    const imei1 = (entry.IMEI1 || "").trim();
                    const imei2 = (entry.IMEI2 || "").trim();
                    const serviceNo = (entry.ServiceNo || "").trim();

                    // Required validations
                    if (product.imei1) {
                        if (!imei1) errors.push(`IMEI1 missing at row ${index + 1}`);
                        else if (!/^\d{15}$/.test(imei1)) errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);
                    }

                    if (product.imei2) {
                        if (!imei2) errors.push(`IMEI2 missing at row ${index + 1}`);
                        else if (!/^\d{15}$/.test(imei2)) errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);
                    }

                    if (product.serviceNo && !serviceNo) {
                        errors.push(`Service No missing at row ${index + 1}`);
                    }

                    // IMEI1 != IMEI2
                    if (imei1 && imei2 && imei1 === imei2) {
                        errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);
                    }

                    // Local duplicates
                    if (imei1 && localIMEI1.has(imei1))
                        errors.push(`Duplicate IMEI1 (${imei1}) within same item at row ${index + 1}`);
                    if (imei2 && localIMEI2.has(imei2))
                        errors.push(`Duplicate IMEI2 (${imei2}) within same item at row ${index + 1}`);
                    if (serviceNo && localServiceNo.has(serviceNo))
                        errors.push(`Duplicate Service No (${serviceNo}) within same item at row ${index + 1}`);

                    localIMEI1.add(imei1);
                    localIMEI2.add(imei2);
                    localServiceNo.add(serviceNo);

                    // Global duplicates
                    if (imei1 && globalIMEI1Set.has(imei1))
                        errors.push(`IMEI1 (${imei1}) already exists in system`);
                    if (imei2 && globalIMEI2Set.has(imei2))
                        errors.push(`IMEI2 (${imei2}) already exists in system`);
                    if (serviceNo && globalServiceSet.has(serviceNo))
                        errors.push(`Service No (${serviceNo}) already exists in system`);
                });

                // Quantity match check
                if (detailEntries.length !== row.receivedQuantity) {
                    errors.push("Received Quantity not matching with Attributes length");
                }

                if (errors.length > 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Validation Failed",
                        html: errors.join("<br>")
                    });
                    return false;
                }

                return true;
            },


    };

        // **ENHANCED SUBMIT HANDLER WITH BULK PROCESSING FOR GOODS RECEIVE ITEMS**
        const handler = {
            handleSubmit: async function () {
                try {
                    debugger;
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    let response;
                    const userId = StorageManager.getUserId();
                    const { validItems, deletedItems } = methods.prepareSecondaryDataForSubmission();

                    // ✅ Header-level values
                    const freightCharges = parseFloat(state.transportCharges || 0);
                    const otherCharges = parseFloat(state.otherCharges || 0);
                    //const attribs =  methods.collectDetailAttributes();

                    if (state.id === '') {
                        // CREATE NEW GOODS RECEIVE NOTE
                        for (const item of validItems) {
                            let allErrors = [];

                            const { Attributes, errors } =
                                methods.collectDetailAttributes(item);
                            if (errors.length > 0) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Validation Failed",
                                    html: errors.join("<br>")
                                });
                                return;
                            }
                            // temporarily store attributes to use in DTO creation
                            item.__validatedAttributes = Attributes;
                        }

                        const itemsDto = validItems.map(item => ({
                            PurchaseOrderItemId: item.purchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.receivedQuantity || 0),
                            UnitPrice: parseFloat(item.unitPrice || 0),
                            TaxAmount: parseFloat(item.taxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.notes || '',
                            WarehouseId: item.warehouseId || null,
                            Attributes: item.__validatedAttributes ?? [],
                            attribute1DetailId: item.attribute1DetailId || null,  // 🔥 ADD
                            attribute2DetailId: item.attribute2DetailId || null   // 🔥 ADD
                        }));

                        response = await services.createMainData(
                            state.receiveDate,
                            state.description,
                            state.status,
                            state.purchaseOrderId,
                            userId,
                            itemsDto,
                            validItems[0]?.warehouseId || null,
                            freightCharges,
                            otherCharges
                        );

                        if (response.data.code === 200) {
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                        }
                    } else if (state.deleteMode) {
                        // DELETE GOODS RECEIVE NOTE
                        response = await services.deleteMainData(state.id, userId);
                    } else {
                        for (const item of validItems) {

                            const { Attributes, errors } =
                                methods.collectDetailAttributes(item);
                            if (errors.length > 0) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Validation Failed",
                                    html: errors.join("<br>")
                                });
                                return;
                            }
                            // temporarily store attributes to use in DTO creation
                            item.__validatedAttributes = Attributes;
                            item.warehouseId = item.warehouseId == "" ? StorageManager.getLocation() : item.warehouseId
                        }
                        const itemsDto = validItems.map(item => ({
                            Id: item.id || null,
                            PurchaseOrderItemId: item.purchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.receivedQuantity || 0),
                            UnitPrice: parseFloat(item.unitPrice || 0),
                            TaxAmount: parseFloat(item.taxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.notes || '',
                            WarehouseId: item.warehouseId || '',
                            Attributes: item.__validatedAttributes ?? [],
                            attribute1DetailId: item.attribute1DetailId || null,  //  ADD
                            attribute2DetailId: item.attribute2DetailId || null   //  ADD
                        }));

                        const filteredItemsDto = itemsDto.filter(item => item.ReceivedQuantity > 0);

                        response = await services.updateMainData(
                            state.id,
                            state.receiveDate,
                            state.description,
                            state.status,
                            state.purchaseOrderId,
                            userId,
                            filteredItemsDto,
                            validItems[0]?.warehouseId || null,
                            freightCharges,
                            otherCharges
                        );
                    }

                    // ✅ Handle Response
                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            await methods.populateSecondaryData();

                            // Update header-level values after save
                            const grnData = response?.data?.content?.data || {};
                            state.transportCharges = grnData.transportCharges || 0;
                            state.otherCharges = grnData.otherCharges || 0;

                            secondaryGrid.refresh();

                            state.mainTitle = 'Edit Goods Receive';
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
                            }, 2000);
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
            }
        };
        //const handler = {
        //    handleSubmit: async function () {
        //        try {
        //            state.isSubmitting = true;
        //            await new Promise(resolve => setTimeout(resolve, 300));

        //            if (!validateForm()) {
        //                return;
        //            }

        //            let response;
        //            const userId = StorageManager.getUserId();
        //            const { validItems, deletedItems } = methods.prepareSecondaryDataForSubmission();
        //            if (state.id === '') {
        //                // **CREATE NEW GOODS RECEIPT WITH ITEMS IN ONE REQUEST**
        //                const itemsDto = validItems.map(item => ({
        //                    PurchaseOrderItemId: item.purchaseOrderItemId,
        //                    ReceivedQuantity: item.receivedQuantity,
        //                    Notes: item.notes || ''
        //                }));

        //                response = await services.createMainData(
        //                    state.receiveDate,
        //                    state.description,
        //                    state.status,
        //                    state.purchaseOrderId,
        //                    userId,
        //                    itemsDto, // Pass items as an additional parameter
        //                    validItems[0].warehouseId || null  // Pass default warehouse if available in state; adjust if needed
        //                );

        //               if (response.data.code === 200) {
        //                   state.id = response?.data?.content?.data.id ?? '';
        //                   state.number = response?.data?.content?.data.number ?? '';
        //                   // No need for separate item creation calls; items are created in the single request
        //               }
        //            } else if (state.deleteMode) {
        //                // **DELETE GOODS RECEIPT**
        //                response = await services.deleteMainData(state.id, userId);
        //            } else {
        //                // **UPDATE EXISTING GOODS RECEIPT**
        //                response = await services.updateMainData(
        //                    state.id,
        //                    state.receiveDate,
        //                    state.description,
        //                    state.status,
        //                    state.purchaseOrderId,
        //                    userId
        //                );

        //                if (response.data.code === 200) {
        //                    // Delete removed items first
        //                    const deletePromises = deletedItems.map(item =>
        //                        services.deleteSecondaryData(item.id, userId)
        //                    );
        //                    if (deletePromises.length > 0) {
        //                        await Promise.all(deletePromises);
        //                    }

        //                    // Create or update goods receive items
        //                    const secondaryPromises = validItems.map(item => {
        //                        if (item.id) {
        //                            // Update existing
        //                            return services.updateSecondaryData(
        //                                item.id,
        //                                state.id,
        //                                item.purchaseOrderItemId,
        //                                item.receivedQuantity,
        //                                item.notes || '',
        //                                userId
        //                            );
        //                        } else {
        //                            // Create new
        //                            return services.createSecondaryData(
        //                                state.id,
        //                                item.purchaseOrderItemId,
        //                                item.receivedQuantity,
        //                                item.notes || '',
        //                                userId
        //                            );
        //                        }
        //                    });

        //                    if (secondaryPromises.length > 0) {
        //                        await Promise.all(secondaryPromises);
        //                    }
        //                }
        //            }

        //            // **HANDLE RESPONSE**
        //            if (response.data.code === 200) {
        //                await methods.populateMainData();
        //                mainGrid.refresh();

        //                if (!state.deleteMode) {
        //                    // Refresh secondary data after successful save
        //                    await methods.populateSecondaryData();
        //                    secondaryGrid.refresh();

        //                    state.mainTitle = 'Edit Goods Receive';
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
        //            console.error('Submit error:', error);
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
                state.locationId = StorageManager.getLocation();
                await SecurityManager.authorizePage(['GoodsReceives']);
                await SecurityManager.validateToken();
                await methods.populateMainData();
                await mainGrid.create(state.mainData);
                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populatePurchaseOrderListLookupData();
                await methods.populateGoodsReceiveStatusListLookupData();
                await methods.populateGoodsReceiveItemDetailsListLookupData();
                numberText.create();
                receiveDatePicker.create();
                purchaseOrderListLookup.create();
                goodsReceiveStatusListLookup.create();
                await secondaryGrid.create(state.secondaryData);
                await methods.populateProductListLookupData();
                await methods.populateWarehouseListLookupData();
            } catch (e) {
                console.error('page init error:', e);
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
                        { field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false },
                        { field: 'number', headerText: 'Number', width: 150 },
                        { field: 'name', headerText: 'Name', width: 200 },
                        { field: 'description', headerText: 'Description', width: 250 },
                        {
                            field: 'createdAtUtc',
                            headerText: 'Created At',
                            width: 180,
                            format: 'yyyy-MM-dd HH:mm',
                            valueAccessor: (f, d) =>
                                d.createdAtUtc ? new Date(d.createdAtUtc).toLocaleString('en-GB') : ''
                        }
                    ],

                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Add', tooltipText: 'Add Attribute', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit Attribute', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete Attribute', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                    ],

                    // =============== Grid Loaded ===============
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        mainGrid.obj.autoFitColumns(['number', 'name', 'description', 'createdAtUtc']);
                    },

                    // =============== Selection ===============
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length === 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length === 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        }
                    },

                    // Prevent multi-select on click
                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length) {
                            mainGrid.obj.clearSelection();
                        }
                    },

                    // =============== Toolbar Clicks ===============
                    toolbarClick: async (args) => {

                        // Export
                        if (args.item.id === 'MainGrid_excelexport') {
                            mainGrid.obj.excelExport();
                            return;
                        }

                        // ADD
                        //if (args.item.id === 'AddCustom') {
                        //    resetFormState();
                        //    state.deleteMode = false;
                        //    state.mainTitle = 'Add Attribute';
                        //    numberText.refresh();
                        //    mainModal.obj.show();
                        //    return;
                        //}
                        // CREATE NEW GRN
                        if (args.item.id === 'AddCustom') {
                            resetFormState();
                           
                            state.deleteMode = false;
                            state.mainTitle = 'Add Goods Receive Items';

                            // CLEAR SECONDARY DATA
                            state.secondaryData = [];

                            // ALWAYS SHOW COMPLEX DIV (so grid is visible)
                            state.showComplexDiv = true;

                            // GRID INIT / REFRESH
                            if (!secondaryGrid.obj) {
                                await secondaryGrid.create([]);   // create empty grid
                            } else {
                                secondaryGrid.refresh([]);        // reset existing grid
                            }

                            numberText.refresh();
                            purchaseOrderListLookup.refresh();
                            receiveDatePicker.refresh();

                            mainModal.obj.show();

                            // SYNCFUSION FIX — FORCE RENDER
                            setTimeout(() => {
                                secondaryGrid.obj?.refresh();
                            }, 100);

                            return;
                        }

                        const selected = mainGrid.obj.getSelectedRecords();

                        if ((args.item.id === 'EditCustom' || args.item.id === 'DeleteCustom') &&
                            selected.length !== 1) {
                            Swal.fire({ icon: 'warning', text: 'Please select exactly one row.' });
                            return;
                        }

                        const row = selected[0];

                        // EDIT
                        if (args.item.id === 'EditCustom') {
                            debugger;
                            state.deleteMode = false;

                            // ────────────────────────────────────────────────
                            // Default to empty — will be set below
                            // ────────────────────────────────────────────────
                            let selectedStatusId = '';

                            // Try to find matching ID from the dropdown's data source
                            if (row.statusName && state.goodsReceiveStatusListLookupData?.length > 0) {
                                const matchingStatus = state.goodsReceiveStatusListLookupData.find(
                                    item =>
                                        item.name?.trim().toLowerCase() === row.statusName?.trim().toLowerCase()
                                );

                                if (matchingStatus?.id) {
                                    selectedStatusId = matchingStatus.id;
                                } else {
                                    console.warn(`No matching status ID found for name: "${row.statusName}"`);
                                    // Optional fallback: first item or leave empty
                                    // selectedStatusId = state.goodsReceiveStatusListLookupData[0]?.id || '';
                                }
                            }

                            Object.assign(state, {
                                id: row.id,
                                number: row.number,
                                name: row.name,
                                description: row.description,

                                // Use the looked-up ID
                                status: selectedStatusId,

                                transportCharges: row.freightCharges,
                                otherCharges: row.otherCharges,
                                receiveDate: row.receiveDate,
                                purchaseOrderId: row.purchaseOrderId,
                                createdAt: new Date(row.createdAtUtc).toLocaleString('en-GB')
                            });

                            numberText.refresh();

                            await methods.populateSecondaryData(row.id);

                            if (!secondaryGrid.obj) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.refresh(state.secondaryData);
                            }

                            mainModal.obj.show();
                            state.showComplexDiv = true;

                            // Give time for modal + dropdown to render
                            setTimeout(() => {
                                if (secondaryGrid.obj) {
                                    secondaryGrid.obj.refresh();
                                }

                                if (goodsReceiveStatusListLookup?.obj) {
                                    console.log('Setting status dropdown to ID:', state.status);
                                    goodsReceiveStatusListLookup.obj.value = state.status;

                                    // Force visual update (sometimes needed)
                                    goodsReceiveStatusListLookup.obj.refresh();
                                }
                            }, 150);   // increased slightly — can use Vue.nextTick() if in Vue

                            return;
                        }
                        // DELETE
                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            Object.assign(state, row);
                            state.mainTitle = 'Delete Attribute?';
                            mainModal.obj.show();
                            return;
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
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource,
                    editSettings: {
                        allowEditing: true,
                        allowAdding: false,
                        allowDeleting: true,
                        mode: 'Batch'
                    },
                    gridLines: 'Horizontal',
                    allowSelection: true,
                    allowSorting: true,
                    allowPaging: false,
                    allowResizing: true,
                    allowTextWrap: true,
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    columns: [
                        { type: 'checkbox', width: 30 },
                        { field: 'id', visible: false },
                        { field: 'purchaseOrderItemId', isPrimaryKey: true, visible: false },

                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 200,
                            disableHtmlEncode: false,
                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(item => item.id === data[field]);
                                return product ? product.numberName : '';
                            },
                            allowEditing: false
                        },
                        

                        {
                            field: 'actualQuantity',
                            headerText: 'Order Quantity',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N0',
                            allowEditing: false
                        },
                        {
                            field: 'remaingQuantity',
                            headerText: 'Remaining Quantity',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N0',
                            allowEditing: false
                        },
                        {
                            field: 'receivedQuantity',
                            headerText: 'Received Quantity',
                            width: 140,
                            textAlign: 'Right',
                            format: 'N0',
                            editType: 'numericedit',
                            edit: { params: { decimals: 2, min: 0, step: 1 } },
                            validationRules: {
                                required: true,
                                custom: [(args) => {
                                    const rowIndex = args.element.closest('.e-row').rowIndex;
                                    const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];
                                    const rowData = rowObj.changes ?? rowObj.data;
                                    const maxQty = parseFloat(rowData.remaingQuantity || 0);
                                    const val = parseFloat(args.value || 0);
                                    return val <= maxQty;
                                }, 'Received Qty cannot exceed Remaining Qty']
                            }
                        },
                        // ADDED ATTRIBUTE 1 — READ ONLY
                        {
                            field: 'attribute1DetailId',
                            headerText: 'Attribute 1',
                            width: 120,
                            allowEditing: false,
                            valueAccessor: (field, data) => {
                                const list = data.attribute1List || [];
                                const item = list.find(x => x.id === data[field]);
                                return item ? item.value : '';
                            }
                        },

                        // ADDED ATTRIBUTE 2 — READ ONLY
                        {
                            field: 'attribute2DetailId',
                            headerText: 'Attribute 2',
                            width: 120,
                            allowEditing: false,
                            valueAccessor: (field, data) => {
                                const list = data.attribute2List || [];
                                const item = list.find(x => x.id === data[field]);
                                return item ? item.value : '';
                            }
                        },
                        {
                            field: 'details',
                            headerText: 'Details',
                            width: 120,
                            disableHtmlEncode: false,

                            // LIKE product valueAccessor, but returning clickable link
                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(p => p.id === data.productId);
                                if (!product) return '';

                                return `<a href="#" class="view-details" data-id="${data.purchaseOrderItemId}">
                    Add Other Attributes
                </a>`;
                            },

                            // Needed to allow HTML inside cell
                            allowEditing: false
                        },
                        {
                            field: 'unitPrice',
                            headerText: 'Rate',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: true
                        },
                        {
                            field: 'taxAmount',
                            headerText: 'Tax Amount',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: true
                        },
                        {
                            field: 'FinalPrice',
                            headerText: 'Final Rate Per Unit',
                            width: 130,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            allowEditing: true
                        },
                        {
                            field: 'MRP',
                            headerText: 'MRP',
                            width: 100,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            editType: 'numericedit',
                            edit: { params: { decimals: 2, min: 0, step: 0.01 } },
                            allowEditing: true
                        },
                        {
                            field: 'notes',
                            headerText: 'Notes',
                            width: 150,
                            editType: 'stringedit',
                            allowEditing: true
                        }
                        
                        
                    ],

                    // ✅ Handle live recalculation when user edits "Received Quantity"
                    cellEdit: (args) => {
                        if (args.columnName === 'receivedQuantity') {
                            setTimeout(() => {
                                const inputEl = args.element?.querySelector('input');
                                if (inputEl) {
                                    inputEl.addEventListener('input', (e) => {
                                        const val = parseFloat(e.target.value || 0);
                                        const rowIndex = args.row?.rowIndex ?? 0;

                                        if (state.secondaryData[rowIndex]) {
                                            state.secondaryData[rowIndex].receivedQuantity = val;
                                            methods.recalculateFinalPrices();
                                        }
                                    });
                                }
                            }, 0); // wait for next render tick
                        }
                        if (args.columnName === 'mrp') {
                            setTimeout(() => {
                                const inputEl = args.element?.querySelector('input');
                                if (inputEl) {
                                    inputEl.addEventListener('input', (e) => {
                                        const val = parseFloat(e.target.value || 0);
                                        const rowIndex = args.row?.rowIndex ?? 0;

                                        if (state.secondaryData[rowIndex]) {
                                            state.secondaryData[rowIndex].mrp = val;
                                        }
                                    });
                                }
                            }, 0); // wait for next render tick
                        }
                    },

                    // ✅ Save handler when cell edit completes
                    cellSave: (args) => {
                        debugger
                        if (args.columnName === 'receivedQuantity') {
                            const newValue = parseFloat(args.value || 0);

                            // Update state with final value
                            const index = state.secondaryData.findIndex(
                                x => x.purchaseOrderItemId === args.rowData.purchaseOrderItemId
                            );
                            if (index !== -1) {
                                state.secondaryData[index].receivedQuantity = newValue;
                            }

                            // Recalculate all after save
                            methods.recalculateFinalPrices();
                        }
                        if (args.columnName === 'mrp') {
                            setTimeout(() => {
                                const inputEl = args.element?.querySelector('input');
                                if (inputEl) {
                                    inputEl.addEventListener('input', (e) => {
                                        const val = parseFloat(e.target.value || 0);
                                        const rowIndex = args.row?.rowIndex ?? 0;

                                        if (state.secondaryData[rowIndex]) {
                                            state.secondaryData[rowIndex].mrp = val;
                                        }
                                    });
                                }
                            }, 0); // wait for next render tick
                        }
                    },
                    queryCellInfo: (args) => {
                        if (args.column.field === 'details') {
                            const link = args.cell.querySelector('.view-details');
                            if (link) {
                                link.addEventListener('click', (e) => {
                                    debugger;
                                    e.preventDefault();
                                    //const rowData = args.data;
                                    const poItemId = e.target.dataset.id;   // get ID directly
                                    methods.openDetailModal(poItemId);
                                });
                            }
                        }
                    },
                    actionComplete: (args) => {
                        if (args.requestType === 'save' || args.requestType === 'batchSave') {
                            methods.refreshSummary();
                        }
                    }
                });

                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            refresh: () => {
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };



        // **UPDATED SECONDARY GRID FOR GOODS RECEIVE ITEMS**
        //const secondaryGrid = {
        //    obj: null,
        //    create: async (dataSource) => {
        //        secondaryGrid.obj = new ej.grids.Grid({
        //            height: 400,
        //            dataSource: dataSource,
        //            editSettings: {
        //                allowEditing: true,
        //                allowAdding: false,
        //                allowDeleting: true,
        //                showDeleteConfirmDialog: true,
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
        //            pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
        //            selectionSettings: { persistSelection: true, type: 'Single' },
        //            autoFit: false,
        //            showColumnMenu: false,
        //            gridLines: 'Horizontal',
        //            columns: [
        //                { type: 'checkbox', width: 60 },
        //                { field: 'id', headerText: 'Id', visible: false },
        //                { field: 'purchaseOrderItemId', isPrimaryKey: true, headerText: 'PO Item Id', visible: false },
        //                {
        //                    field: 'warehouseId',
        //                    headerText: 'Warehouse',
        //                    width: 250,
        //                    visible: false,
        //                    validationRules: { required: true },
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        const warehouse = state.allWarehouses.find(item => item.id === data[field]);
        //                        return warehouse ? `${warehouse.name}` : '';
        //                    },
        //                    allowEditing: false
        //                },
        //                {
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 200,
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        const product = state.productListLookupData.find(item => item.id === data[field]);
        //                        return product ? `${product.numberName}` : '';
        //                    },
        //                    allowEditing: false
        //                },
        //                {
        //                    field: 'actualQuantity',
        //                    headerText: 'Order Quantity',
        //                    width: 120,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: false
        //                },
        //                {
        //                    field: 'remaingQuantity',
        //                    headerText: 'Remaining Quantity',
        //                    width: 120,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: false // ✅ read-only
        //                },
        //                {
        //                    field: 'receivedQuantity',
        //                    headerText: 'Received Quantity',
        //                    width: 120,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    editType: 'numericedit',
        //                    edit: {
        //                        params: {
        //                            decimals: 2,
        //                            min: 0,
        //                            step: 0.01
        //                        }
        //                    },
        //                    validationRules: {
        //                        required: true,
        //                        min: [0, 'Value cannot be less than 0'],
        //                        // ✅ Custom validation: receivedQuantity <= remaingQuantity
        //                        custom: [(args) => {
        //                            const rowIndex = args.element.closest('.e-row').rowIndex;
        //                            const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];
        //                            const rowData = rowObj.changes ?? rowObj.data;
        //                            return parseFloat(args.value || 0) <= parseFloat(rowData.remaingQuantity || 0);
        //                        }, 'Received quantity cannot be greater than Remaining quantity']
        //                    }
        //                },
        //                {
        //                    field: 'unitPrice',
        //                    headerText: 'Unit Price',
        //                    width: 100,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: false
        //                },
        //                {
        //                    field: 'taxAmount',
        //                    headerText: 'Tax Amount',
        //                    width: 100,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: false
        //                },
        //                {
        //                    field: 'FinalPrice',
        //                    headerText: 'Final Price',
        //                    width: 100,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: true
        //                },
        //                {
        //                    field: 'MRP',
        //                    headerText: 'MRP',
        //                    width: 100,
        //                    type: 'number',
        //                    format: 'N2',
        //                    textAlign: 'Right',
        //                    allowEditing: true
        //                },
        //                {
        //                    field: 'notes',
        //                    headerText: 'Notes',
        //                    width: 150,
        //                    editType: 'stringedit',
        //                    allowEditing: true
        //                }
        //            ],
        //            toolbar: [
        //                'ExcelExport',
        //                { type: 'Separator' },
        //                { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
        //            ],
        //            beforeDataBound: () => { },
        //            dataBound: function () {
        //                secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], false);
        //            },
        //            excelExportComplete: () => { },
        //            rowSelected: () => {
        //                const selected = secondaryGrid.obj.getSelectedRecords().length;
        //                secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], selected === 1);
        //            },
        //            rowDeselected: () => {
        //                const selected = secondaryGrid.obj.getSelectedRecords().length;
        //                secondaryGrid.obj.toolbarModule.enableItems(['DeleteCustom'], selected === 1);
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
        //                if (args.item.id === 'DeleteCustom') {
        //                    const selectedRecord = secondaryGrid.obj.getSelectedRecords()[0];
        //                    if (selectedRecord && selectedRecord.id) {
        //                        state.deletedItems.push(selectedRecord);
        //                    }
        //                    secondaryGrid.obj.deleteRecord();
        //                }
        //            },
        //            actionComplete: (args) => {
        //                if (args.requestType === 'save' || args.requestType === 'delete') {
        //                    methods.refreshSummary();
        //                }
        //            }
        //        });
        //        secondaryGrid.obj.appendTo(secondaryGridRef.value);
        //    },
        //    refresh: () => {
        //        secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
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
        const secondaryModal = {
            obj: null,
            create: () => {
                secondaryModal.obj = new bootstrap.Modal(secondaryModalRef.value, {
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
            receiveDateRef,
            purchaseOrderIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');