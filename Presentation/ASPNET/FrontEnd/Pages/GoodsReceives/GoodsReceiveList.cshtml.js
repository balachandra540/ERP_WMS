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
            transportCharges: 0,   // ✅ now at root level
            otherCharges: 0,       // ✅ now at root level
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
            // Reset all errors
            state.errors.receiveDate = '';
            state.errors.purchaseOrderId = '';
            state.errors.status = '';
            state.errors.description = '';

            let isValid = true;
            let hasValidReceivedQuantity = false;

            // ✅ Header validation
            if (!state.receiveDate) {
                state.errors.receiveDate = 'Receive date is required.';
                isValid = false;
            }
            if (!state.purchaseOrderId) {
                state.errors.purchaseOrderId = 'Purchase Order is required.';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }

            // ✅ Secondary grid data validation
            if (!state.deleteMode && state.secondaryData.length > 0) {
                if (secondaryGrid.obj.isEdit) {
                    secondaryGrid.obj.endEdit();
                }
                const batchChanges = secondaryGrid.obj ? secondaryGrid.obj.getBatchChanges() : {
                    changed: [],
                    deleted: [],
                    added: []
                };

                // Merge current state + batch changes
                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...batchChanges.changedRecords];

                // Apply batch edits
                for (let changed of (batchChanges.changed || [])) {
                    const index = currentSecondaryData.findIndex(item =>
                        (item.purchaseOrderItemId === changed.purchaseOrderItemId) ||
                        (item.id && item.id === changed.id)
                    );
                    if (index !== -1) {
                        currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
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

                // Add newly added rows
                currentSecondaryData.push(...(batchChanges.addedRecords || []));

                // ✅ Validate each item
                for (let item of currentSecondaryData) {
                    const rcvQty = parseFloat(item.receivedQuantity || 0);
                    const mrpVal = parseFloat(item.MRP || 0);

                    if (rcvQty > 0) {
                        hasValidReceivedQuantity = true;

                        // 🔹 Check for missing or invalid MRP
                        if (!item.MRP || isNaN(mrpVal) || mrpVal <= 0) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Validation Error',
                                text: `MRP is required for product "${item.productName || ''}" having received quantity greater than 0.`,
                                confirmButtonText: 'OK'
                            });
                            isValid = false;
                            break;
                        }
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
                }

                // ✅ At least one item must have received quantity > 0
                if (isValid && !hasValidReceivedQuantity) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'At least one item must have received quantity greater than 0.',
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
            state.receiveDate = '';
            state.description = '';
            state.purchaseOrderId = null;
            state.status = null;
            state.errors = {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
            state.deletedItems = [];
        };

        const receiveDatePicker = {
            obj: null,
            create: () => {
                receiveDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: state.receiveDate ? new Date(state.receiveDate) : null,
                    change: (e) => {
                        state.receiveDate = e.value;
                    }
                });
                receiveDatePicker.obj.appendTo(receiveDateRef.value);
            },
            refresh: () => {
                if (receiveDatePicker.obj) {
                    receiveDatePicker.obj.value = state.receiveDate ? new Date(state.receiveDate) : null;
                }
            }
        };

        Vue.watch(
            () => state.receiveDate,
            (newVal, oldVal) => {
                receiveDatePicker.refresh();
                state.errors.receiveDate = '';
            }
        );

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
                    const locationId = StorageManager.getLocation();

                    const payload = {
                        ReceiveDate: receiveDate,
                        Description: description,
                        Status: status,
                        PurchaseOrderId: purchaseOrderId,
                        CreatedById: userId,
                        DefaultWarehouseId: defaultWarehouseId,
                        LocationId: locationId,

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
                            WarehouseId: item.WarehouseId || defaultWarehouseId
                        }))
                    };

                    const response = await AxiosManager.post('/GoodsReceive/CreateGoodsReceive', payload);
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
                    const locationId = StorageManager.getLocation();

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
                            WarehouseId: item.WarehouseId || defaultWarehouseId
                        }))
                    };

                    const response = await AxiosManager.post('/GoodsReceive/UpdateGoodsReceive', payload);
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
            // **UPDATED SECONDARY DATA SERVICES FOR GOODS RECEIVE ITEMS**
            getSecondaryData: async (goodsReceiveId) => {
                debugger
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
            populateSecondaryData: async () => {
                try {
                    let secondary = [];

                    if (state.id) {
                        // If editing existing goods receive, get LATEST data from server
                        const response = await services.getSecondaryData(state.id);
                        const goodsReceiveItems = response?.data?.content?.data || [];

                        secondary = goodsReceiveItems.map(grItem => ({
                            id: grItem.id,
                            goodsReceiveId: state.id,
                            warehouseId: grItem.warehouseId || (state.warehouseListLookupData[0]?.id || ''),
                            purchaseOrderItemId: grItem.purchaseOrderItemId,
                            productId: grItem.productId,
                            actualQuantity: grItem.actualQuantity || 0,
                            receivedQuantity: grItem.receivedQuantity || 0,
                            remaingQuantity: grItem.remainingQuantity || 0,
                            unitPrice: grItem.unitPrice ?? 0,
                            taxAmount: grItem.taxAmount ?? 0,
                            FinalPrice: grItem.finalUnitPrice ?? 0,
                            MRP: grItem.mrp ?? 0,

                           
                            notes: grItem.notes || '',
                            createdAtUtc: grItem.createdAtUtc ? new Date(grItem.createdAtUtc) : new Date()
                        }));

                    } else {
                        if (!state.purchaseOrderId) {
                            state.secondaryData = [];
                            return;
                        }

                        // Get Purchase Order items
                        const poResponse = await services.getPurchaseOrderById(state.purchaseOrderId);
                        const poItems = poResponse?.data?.content?.data || [];
                        const locationId = StorageManager.getLocation();

                        // Create fresh secondary data from PO
                        secondary = poItems.map(item => ({
                            id: '',
                            warehouseId: locationId || '',
                            goodsReceiveId: state.id,
                            purchaseOrderItemId: item.id,
                            productId: item.productId,
                            receivedQuantity: 0,
                            actualQuantity: item.quantity || 0,
                            remaingQuantity: item.remainingQuantity || 0, // ✅ directly from API
                            notes: '',
                            taxAmount: item.taxAmount,
                            unitPrice: item.unitPrice,
                            createdAtUtc: new Date()
                        }));

                    }

                    // Update state with fresh data
                    state.secondaryData = secondary;
                    state.deletedItems = [];

                    // Refresh summary
                    methods.refreshSummary();

                } catch (error) {
                    state.secondaryData = [];
                    console.error('Error populating secondary data:', error);
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

                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...batchChanges.changedRecords];

                const matchRecord = (a, b) =>
                    (a.purchaseOrderItemId && b.purchaseOrderItemId && a.purchaseOrderItemId === b.purchaseOrderItemId) ||
                    (a.id && b.id && a.id === b.id);

                // ✅ Apply changed records
                for (let changed of (batchChanges.changed || [])) {
                    const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                    if (index !== -1) {
                        currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
                    }
                }

                // ✅ Remove deleted items safely
                const deletedItems = batchChanges.deletedRecords || [];
                if (deletedItems.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deletedItems.some(deleted => matchRecord(item, deleted))
                    );
                }

                // ✅ Add new records
                if (batchChanges.addedRecords?.length) {
                    currentSecondaryData = [...currentSecondaryData, ...batchChanges.addedRecords];
                }

                // ✅ Final clean list with validation
                const validItems = currentSecondaryData.filter(item => {
                    const rcvQty = parseFloat(item.receivedQuantity || 0);
                    const mrpVal = parseFloat(item.MRP || 0);

                    // 🔸 Only include rows with received qty > 0
                    if (rcvQty <= 0) return false;

                    // 🔸 MRP must be valid & greater than 0
                    if (isNaN(mrpVal) || mrpVal <= 0) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Validation Error',
                            text: `MRP is required for product "${item.productName || ''}" having received quantity greater than 0.`,
                            confirmButtonText: 'OK'
                        });

                        // ❌ Stop further processing by returning empty validItems list
                        throw new Error('Invalid MRP found. Stopping submission.');
                    }

                    // ✅ Ensure numeric formatting before submission
                    item.receivedQuantity = parseFloat(rcvQty.toFixed(2));
                    item.unitPrice = parseFloat((item.unitPrice || 0).toFixed(2));
                    item.taxAmount = parseFloat((item.taxAmount || 0).toFixed(2));
                    item.FinalPrice = parseFloat((item.FinalPrice || 0).toFixed(2));
                    item.MRP = parseFloat(mrpVal.toFixed(2));

                    return true;
                });

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
            }

    };

        // **ENHANCED SUBMIT HANDLER WITH BULK PROCESSING FOR GOODS RECEIVE ITEMS**
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

                    // ✅ Header-level values
                    const freightCharges = parseFloat(state.transportCharges || 0);
                    const otherCharges = parseFloat(state.otherCharges || 0);

                    if (state.id === '') {
                        // 🟩 CREATE NEW GOODS RECEIVE NOTE
                        const itemsDto = validItems.map(item => ({
                            PurchaseOrderItemId: item.purchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.receivedQuantity || 0),
                            UnitPrice: parseFloat(item.unitPrice || 0),
                            TaxAmount: parseFloat(item.taxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.notes || '',
                            WarehouseId: item.warehouseId || null
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
                        // 🟥 DELETE GOODS RECEIVE NOTE
                        response = await services.deleteMainData(state.id, userId);
                    } else {
                        // 🟦 UPDATE EXISTING GOODS RECEIVE NOTE
                        const itemsDto = validItems.map(item => ({
                            Id: item.id || null,
                            PurchaseOrderItemId: item.purchaseOrderItemId,
                            ReceivedQuantity: parseFloat(item.receivedQuantity || 0),
                            UnitPrice: parseFloat(item.unitPrice || 0),
                            TaxAmount: parseFloat(item.taxAmount || 0),
                            FinalUnitPrice: parseFloat(item.FinalPrice || 0),
                            MRP: parseFloat(item.MRP || 0),
                            Notes: item.notes || '',
                            WarehouseId: item.warehouseId || null
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
                        if (args.item.id === 'AddCustom') {
                            resetFormState();
                            state.deleteMode = false;
                            state.mainTitle = 'Add Attribute';
                            numberText.refresh();
                            mainModal.obj.show();
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
                            state.deleteMode = false;

                            Object.assign(state, {
                                id: row.id,
                                number: row.number,
                                name: row.name,
                                description: row.description,
                                createdAt: new Date(row.createdAtUtc).toLocaleString('en-GB')
                            });

                            numberText.refresh();
                            secondaryGrid.clearBatchChanges();
                            await methods.populateSecondaryData(row.id);
                            secondaryGrid.refresh();

                            mainModal.obj.show();
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
                        { type: 'checkbox', width: 50 },
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
                            width: 120,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'remaingQuantity',
                            headerText: 'Remaining Quantity',
                            width: 120,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'receivedQuantity',
                            headerText: 'Received Quantity',
                            width: 120,
                            textAlign: 'Right',
                            format: 'N2',
                            editType: 'numericedit',
                            edit: { params: { decimals: 2, min: 0, step: 0.01 } },
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
                        {
                            field: 'unitPrice',
                            headerText: 'Unit Price',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'taxAmount',
                            headerText: 'Tax Amount',
                            width: 100,
                            textAlign: 'Right',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'FinalPrice',
                            headerText: 'Final Price Per Unit',
                            width: 130,
                            textAlign: 'Right',
                            type: 'number',
                            format: 'N2',
                            allowEditing: false
                        },
                        {
                            field: 'MRP',
                            headerText: 'MRP',
                            width: 120,
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


        //// **UPDATED SECONDARY GRID FOR GOODS RECEIVE ITEMS**
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