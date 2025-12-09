//const App = {
//    setup() {
//        const state = Vue.reactive({
//            mainData: [],
//            deleteMode: false,
//            customerListLookupData: [],
//            taxListLookupData: [],
//            salesOrderStatusListLookupData: [],
//            secondaryData: [],
//            productListLookupData: [],
//            mainTitle: null,
//            id: '',
//            number: '',
//            orderDate: '',
//            description: '',
//            customerId: null,
//            taxId: null,
//            orderStatus: null,
//            errors: {
//                orderDate: '',
//                customerId: '',
//                taxId: '',
//                orderStatus: '',
//                description: ''
//            },
//            showComplexDiv: false,
//            isSubmitting: false,
//            subTotalAmount: '0.00',
//            taxAmount: '0.00',
//            totalAmount: '0.00'
//        });

//        const mainGridRef = Vue.ref(null);
//        const mainModalRef = Vue.ref(null);
//        const orderDateRef = Vue.ref(null);
//        const numberRef = Vue.ref(null);
//        const customerIdRef = Vue.ref(null);
//        const taxIdRef = Vue.ref(null);
//        const orderStatusRef = Vue.ref(null);
//        const secondaryGridRef = Vue.ref(null);

//        const validateForm = function () {
//            state.errors.orderDate = '';
//            state.errors.customerId = '';
//            state.errors.taxId = '';
//            state.errors.orderStatus = '';

//            let isValid = true;

//            if (!state.orderDate) {
//                state.errors.orderDate = 'Order date is required.';
//                isValid = false;
//            }
//            if (!state.customerId) {
//                state.errors.customerId = 'Customer is required.';
//                isValid = false;
//            }
//            if (!state.taxId) {
//                state.errors.taxId = 'Tax is required.';
//                isValid = false;
//            }
//            if (!state.orderStatus) {
//                state.errors.orderStatus = 'Order status is required.';
//                isValid = false;
//            }

//            return isValid;
//        };

//        const resetFormState = () => {
//            state.id = '';
//            state.number = '';
//            state.orderDate = '';
//            state.description = '';
//            state.customerId = null;
//            state.taxId = null;
//            state.orderStatus = null;
//            state.errors = {
//                orderDate: '',
//                customerId: '',
//                taxId: '',
//                orderStatus: '',
//                description: ''
//            };
//            state.secondaryData = [];
//            state.subTotalAmount = '0.00';
//            state.taxAmount = '0.00';
//            state.totalAmount = '0.00';
//            state.showComplexDiv = false;
//        };

//        const services = {
//            getMainData: async () => {
//                try {
//                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            createMainData: async (orderDate, description, orderStatus, taxId, customerId, createdById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrder/CreateSalesOrder', {
//                        orderDate, description, orderStatus, taxId, customerId, createdById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            updateMainData: async (id, orderDate, description, orderStatus, taxId, customerId, updatedById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrder/UpdateSalesOrder', {
//                        id, orderDate, description, orderStatus, taxId, customerId, updatedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            deleteMainData: async (id, deletedById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrder/DeleteSalesOrder', {
//                        id, deletedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getCustomerListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/Customer/GetCustomerList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getTaxListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/Tax/GetTaxList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getSalesOrderStatusListLookupData: async () => {
//                try {
//                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderStatusList', {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            getSecondaryData: async (salesOrderId) => {
//                try {
//                    const response = await AxiosManager.get('/SalesOrderItem/GetSalesOrderItemBySalesOrderIdList?salesOrderId=' + salesOrderId, {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            createSecondaryData: async (unitPrice, quantity, summary, productId, salesOrderId, createdById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrderItem/CreateSalesOrderItem', {
//                        unitPrice, quantity, summary, productId, salesOrderId, createdById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, salesOrderId, updatedById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrderItem/UpdateSalesOrderItem', {
//                        id, unitPrice, quantity, summary, productId, salesOrderId, updatedById
//                    });
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//            deleteSecondaryData: async (id, deletedById) => {
//                try {
//                    const response = await AxiosManager.post('/SalesOrderItem/DeleteSalesOrderItem', {
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
//            }
//        };

//        const methods = {
//            populateCustomerListLookupData: async () => {
//                const response = await services.getCustomerListLookupData();
//                state.customerListLookupData = response?.data?.content?.data;
//            },
//            populateTaxListLookupData: async () => {
//                const response = await services.getTaxListLookupData();
//                state.taxListLookupData = response?.data?.content?.data;
//            },
//            populateSalesOrderStatusListLookupData: async () => {
//                const response = await services.getSalesOrderStatusListLookupData();
//                state.salesOrderStatusListLookupData = response?.data?.content?.data;
//            },
//            populateMainData: async () => {
//                const response = await services.getMainData();
//                state.mainData = response?.data?.content?.data.map(item => ({
//                    ...item,
//                    orderDate: new Date(item.orderDate),
//                    createdAtUtc: new Date(item.createdAtUtc)
//                }));
//            },
//            populateSecondaryData: async (salesOrderId) => {
//                try {
//                    const response = await services.getSecondaryData(salesOrderId);
//                    state.secondaryData = response?.data?.content?.data.map(item => ({
//                        ...item,
//                        createdAtUtc: new Date(item.createdAtUtc)
//                    }));
//                    methods.refreshPaymentSummary(salesOrderId);
//                } catch (error) {
//                    state.secondaryData = [];
//                }
//            },
//            populateProductListLookupData: async () => {
//                const response = await services.getProductListLookupData();
//                state.productListLookupData = response?.data?.content?.data;
//            },
//            refreshPaymentSummary: async (id) => {
//                const record = state.mainData.find(item => item.id === id);
//                if (record) {
//                    state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0);
//                    state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0);
//                    state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0);
//                }
//            },
//            handleFormSubmit: async () => {
//                state.isSubmitting = true;
//                await new Promise(resolve => setTimeout(resolve, 200));

//                if (!validateForm()) {
//                    state.isSubmitting = false;
//                    return;
//                }

//                try {
//                    const response = state.id === ''
//                        ? await services.createMainData(state.orderDate, state.description, state.orderStatus, state.taxId, state.customerId, StorageManager.getUserId())
//                        : state.deleteMode
//                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
//                            : await services.updateMainData(state.id, state.orderDate, state.description, state.orderStatus, state.taxId, state.customerId, StorageManager.getUserId());

//                    if (response.data.code === 200) {
//                        await methods.populateMainData();
//                        mainGrid.refresh();

//                        if (!state.deleteMode) {
//                            state.mainTitle = 'Edit Sales Order';
//                            state.id = response?.data?.content?.data.id ?? '';
//                            state.number = response?.data?.content?.data.number ?? '';
//                            state.orderDate = response?.data?.content?.data.orderDate ? new Date(response.data.content.data.orderDate) : null;
//                            state.description = response?.data?.content?.data.description ?? '';
//                            state.customerId = response?.data?.content?.data.customerId ?? '';
//                            state.taxId = response?.data?.content?.data.taxId ?? '';
//                            taxListLookup.trackingChange = true;
//                            state.orderStatus = String(response?.data?.content?.data.orderStatus ?? '');
//                            state.showComplexDiv = true;

//                            await methods.refreshPaymentSummary(state.id);

//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Save Successful',
//                                timer: 1000,
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
//            onMainModalHidden: () => {
//                state.errors.orderDate = '';
//                state.errors.customerId = '';
//                state.errors.taxId = '';
//                state.errors.orderStatus = '';
//                taxListLookup.trackingChange = false;
//            }
//        };

//        const customerListLookup = {
//            obj: null,
//            create: () => {
//                if (state.customerListLookupData && Array.isArray(state.customerListLookupData)) {
//                    customerListLookup.obj = new ej.dropdowns.DropDownList({
//                        dataSource: state.customerListLookupData,
//                        fields: { value: 'id', text: 'name' },
//                        placeholder: 'Select a Customer',
//                        filterBarPlaceholder: 'Search',
//                        sortOrder: 'Ascending',
//                        allowFiltering: true,
//                        filtering: (e) => {
//                            e.preventDefaultAction = true;
//                            let query = new ej.data.Query();
//                            if (e.text !== '') {
//                                query = query.where('name', 'startsWith', e.text, true);
//                            }
//                            e.updateData(state.customerListLookupData, query);
//                        },
//                        change: (e) => {
//                            state.customerId = e.value;
//                        }
//                    });
//                    customerListLookup.obj.appendTo(customerIdRef.value);
//                }
//            },
//            refresh: () => {
//                if (customerListLookup.obj) {
//                    customerListLookup.obj.value = state.customerId;
//                }
//            }
//        };

//        const taxListLookup = {
//            obj: null,
//            trackingChange: false,
//            create: () => {
//                if (state.taxListLookupData && Array.isArray(state.taxListLookupData)) {
//                    taxListLookup.obj = new ej.dropdowns.DropDownList({
//                        dataSource: state.taxListLookupData,
//                        fields: { value: 'id', text: 'name' },
//                        placeholder: 'Select a Tax',
//                        change: async (e) => {
//                            state.taxId = e.value;
//                            if (e.isInteracted && taxListLookup.trackingChange) {
//                                await methods.handleFormSubmit();
//                            }
//                        }
//                    });
//                    taxListLookup.obj.appendTo(taxIdRef.value);
//                }
//            },
//            refresh: () => {
//                if (taxListLookup.obj) {
//                    taxListLookup.obj.value = state.taxId;
//                }
//            }
//        };

//        const salesOrderStatusListLookup = {
//            obj: null,
//            create: () => {
//                if (state.salesOrderStatusListLookupData && Array.isArray(state.salesOrderStatusListLookupData)) {
//                    salesOrderStatusListLookup.obj = new ej.dropdowns.DropDownList({
//                        dataSource: state.salesOrderStatusListLookupData,
//                        fields: { value: 'id', text: 'name' },
//                        placeholder: 'Select an Order Status',
//                        change: (e) => {
//                            state.orderStatus = e.value;
//                        }
//                    });
//                    salesOrderStatusListLookup.obj.appendTo(orderStatusRef.value);
//                }
//            },
//            refresh: () => {
//                if (salesOrderStatusListLookup.obj) {
//                    salesOrderStatusListLookup.obj.value = state.orderStatus;
//                }
//            }
//        };

//        const orderDatePicker = {
//            obj: null,
//            create: () => {
//                orderDatePicker.obj = new ej.calendars.DatePicker({
//                    format: 'yyyy-MM-dd',
//                    value: state.orderDate ? new Date(state.orderDate) : null,
//                    change: (e) => {
//                        state.orderDate = e.value;
//                    }
//                });
//                orderDatePicker.obj.appendTo(orderDateRef.value);
//            },
//            refresh: () => {
//                if (orderDatePicker.obj) {
//                    orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null;
//                }
//            }
//        };

//        const numberText = {
//            obj: null,
//            create: () => {
//                numberText.obj = new ej.inputs.TextBox({
//                    placeholder: '[auto]',
//                    readonly: true
//                });
//                numberText.obj.appendTo(numberRef.value);
//            }
//        };

//        Vue.watch(
//            () => state.orderDate,
//            (newVal, oldVal) => {
//                orderDatePicker.refresh();
//                state.errors.orderDate = '';
//            }
//        );

//        Vue.watch(
//            () => state.customerId,
//            (newVal, oldVal) => {
//                customerListLookup.refresh();
//                state.errors.customerId = '';
//            }
//        );

//        Vue.watch(
//            () => state.taxId,
//            (newVal, oldVal) => {
//                taxListLookup.refresh();
//                state.errors.taxId = '';
//            }
//        );

//        Vue.watch(
//            () => state.orderStatus,
//            (newVal, oldVal) => {
//                salesOrderStatusListLookup.refresh();
//                state.errors.orderStatus = '';
//            }
//        );

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
//                    groupSettings: { columns: ['customerName'] },
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
//                        { field: 'orderDate', headerText: 'SO Date', width: 150, format: 'yyyy-MM-dd' },
//                        { field: 'customerName', headerText: 'Customer', width: 200, minWidth: 200 },
//                        { field: 'orderStatusName', headerText: 'Status', width: 150, minWidth: 150 },
//                        { field: 'taxName', headerText: 'Tax', width: 150, minWidth: 150 },
//                        { field: 'afterTaxAmount', headerText: 'Total Amount', width: 150, minWidth: 150, format: 'N2' },
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
//                        mainGrid.obj.autoFitColumns(['number', 'orderDate', 'customerName', 'orderStatusName', 'taxName', 'afterTaxAmount', 'createdAtUtc']);
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
//                            state.mainTitle = 'Add Sales Order';
//                            resetFormState();
//                            state.secondaryData = [];
//                            secondaryGrid.refresh();
//                            state.showComplexDiv = false;
//                            mainModal.obj.show();
//                        }

//                        if (args.item.id === 'EditCustom') {
//                            state.deleteMode = false;
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                state.mainTitle = 'Edit Sales Order';
//                                state.id = selectedRecord.id ?? '';
//                                state.number = selectedRecord.number ?? '';
//                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
//                                state.description = selectedRecord.description ?? '';
//                                state.customerId = selectedRecord.customerId ?? '';
//                                state.taxId = selectedRecord.taxId ?? '';
//                                taxListLookup.trackingChange = true;
//                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
//                                state.showComplexDiv = true;

//                                await methods.populateSecondaryData(selectedRecord.id);
//                                secondaryGrid.refresh();

//                                mainModal.obj.show();
//                            }
//                        }

//                        if (args.item.id === 'DeleteCustom') {
//                            state.deleteMode = true;
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                state.mainTitle = 'Delete Sales Order?';
//                                state.id = selectedRecord.id ?? '';
//                                state.number = selectedRecord.number ?? '';
//                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
//                                state.description = selectedRecord.description ?? '';
//                                state.customerId = selectedRecord.customerId ?? '';
//                                state.taxId = selectedRecord.taxId ?? '';
//                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
//                                state.showComplexDiv = false;

//                                await methods.populateSecondaryData(selectedRecord.id);
//                                secondaryGrid.refresh();

//                                mainModal.obj.show();
//                            }
//                        }

//                        if (args.item.id === 'PrintPDFCustom') {
//                            if (mainGrid.obj.getSelectedRecords().length) {
//                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
//                                window.open('/SalesOrders/SalesOrderPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
//                    sortSettings: { columns: [{ field: 'productName', direction: 'Descending' }] },
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
//                            field: 'productId',
//                            headerText: 'Product',
//                            width: 250,
//                            validationRules: { required: true },
//                            disableHtmlEncode: false,
//                            valueAccessor: (field, data, column) => {
//                                const product = state.productListLookupData.find(item => item.id === data[field]);
//                                return product ? `${product.name}` : '';
//                            },
//                            editType: 'dropdownedit',
//                            edit: {
//                                create: () => {
//                                    let productElem = document.createElement('input');
//                                    return productElem;
//                                },
//                                read: () => {
//                                    return productObj.value;
//                                },
//                                destroy: () => {
//                                    productObj.destroy();
//                                },
//                                write: (args) => {
//                                    productObj = new ej.dropdowns.DropDownList({
//                                        dataSource: state.productListLookupData,
//                                        fields: { value: 'id', text: 'name' },
//                                        value: args.rowData.productId,
//                                        change: (e) => {
//                                            const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
//                                            if (selectedProduct) {
//                                                args.rowData.productId = selectedProduct.id;
//                                                if (numberObj) {
//                                                    numberObj.value = selectedProduct.number;
//                                                }
//                                                if (priceObj) {
//                                                    priceObj.value = selectedProduct.unitPrice;
//                                                }
//                                                if (summaryObj) {
//                                                    summaryObj.value = selectedProduct.description;
//                                                }
//                                                if (quantityObj) {
//                                                    quantityObj.value = 1;
//                                                    const total = selectedProduct.unitPrice * quantityObj.value;
//                                                    if (totalObj) {
//                                                        totalObj.value = total;
//                                                    }
//                                                }
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
//                            field: 'unitPrice',
//                            headerText: 'Unit Price',
//                            width: 200, validationRules: { required: true }, type: 'number', format: 'N2', textAlign: 'Right',
//                            edit: {
//                                create: () => {
//                                    let priceElem = document.createElement('input');
//                                    return priceElem;
//                                },
//                                read: () => {
//                                    return priceObj.value;
//                                },
//                                destroy: () => {
//                                    priceObj.destroy();
//                                },
//                                write: (args) => {
//                                    priceObj = new ej.inputs.NumericTextBox({
//                                        value: args.rowData.unitPrice ?? 0,
//                                        change: (e) => {
//                                            if (quantityObj && totalObj) {
//                                                const total = e.value * quantityObj.value;
//                                                totalObj.value = total;
//                                            }
//                                        }
//                                    });
//                                    priceObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'quantity',
//                            headerText: 'Quantity',
//                            width: 200,
//                            validationRules: {
//                                required: true,
//                                custom: [(args) => {
//                                    return args['value'] > 0;
//                                }, 'Must be a positive number and not zero']
//                            },
//                            type: 'number', format: 'N2', textAlign: 'Right',
//                            edit: {
//                                create: () => {
//                                    let quantityElem = document.createElement('input');
//                                    return quantityElem;
//                                },
//                                read: () => {
//                                    return quantityObj.value;
//                                },
//                                destroy: () => {
//                                    quantityObj.destroy();
//                                },
//                                write: (args) => {
//                                    quantityObj = new ej.inputs.NumericTextBox({
//                                        value: args.rowData.quantity ?? 0,
//                                        change: (e) => {
//                                            if (priceObj && totalObj) {
//                                                const total = e.value * priceObj.value;
//                                                totalObj.value = total;
//                                            }
//                                        }
//                                    });
//                                    quantityObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'total',
//                            headerText: 'Total',
//                            width: 200, validationRules: { required: false }, type: 'number', format: 'N2', textAlign: 'Right',
//                            edit: {
//                                create: () => {
//                                    let totalElem = document.createElement('input');
//                                    return totalElem;
//                                },
//                                read: () => {
//                                    return totalObj.value;
//                                },
//                                destroy: () => {
//                                    totalObj.destroy();
//                                },
//                                write: (args) => {
//                                    totalObj = new ej.inputs.NumericTextBox({
//                                        value: args.rowData.total ?? 0,
//                                        readonly: true
//                                    });
//                                    totalObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'productNumber',
//                            headerText: 'Product Number',
//                            allowEditing: false,
//                            width: 180,
//                            edit: {
//                                create: () => {
//                                    let numberElem = document.createElement('input');
//                                    return numberElem;
//                                },
//                                read: () => {
//                                    return numberObj.value;
//                                },
//                                destroy: () => {
//                                    numberObj.destroy();
//                                },
//                                write: (args) => {
//                                    numberObj = new ej.inputs.TextBox();
//                                    numberObj.value = args.rowData.productNumber;
//                                    numberObj.readonly = true;
//                                    numberObj.appendTo(args.element);
//                                }
//                            }
//                        },
//                        {
//                            field: 'summary',
//                            headerText: 'Summary',
//                            width: 200,
//                            edit: {
//                                create: () => {
//                                    let summaryElem = document.createElement('input');
//                                    return summaryElem;
//                                },
//                                read: () => {
//                                    return summaryObj.value;
//                                },
//                                destroy: () => {
//                                    summaryObj.destroy();
//                                },
//                                write: (args) => {
//                                    summaryObj = new ej.inputs.TextBox();
//                                    summaryObj.value = args.rowData.summary;
//                                    summaryObj.appendTo(args.element);
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
//                            const salesOrderId = state.id;
//                            const userId = StorageManager.getUserId();
//                            const data = args.data;

//                            await services.createSecondaryData(data?.unitPrice, data?.quantity, data?.summary, data?.productId, salesOrderId, userId);
//                            await methods.populateSecondaryData(salesOrderId);
//                            secondaryGrid.refresh();

//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Save Successful',
//                                timer: 2000,
//                                showConfirmButton: false
//                            });
//                        }
//                        if (args.requestType === 'save' && args.action === 'edit') {
//                            const salesOrderId = state.id;
//                            const userId = StorageManager.getUserId();
//                            const data = args.data;

//                            await services.updateSecondaryData(data?.id, data?.unitPrice, data?.quantity, data?.summary, data?.productId, salesOrderId, userId);
//                            await methods.populateSecondaryData(salesOrderId);
//                            secondaryGrid.refresh();

//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Save Successful',
//                                timer: 2000,
//                                showConfirmButton: false
//                            });
//                        }
//                        if (args.requestType === 'delete') {
//                            const salesOrderId = state.id;
//                            const userId = StorageManager.getUserId();
//                            const data = args.data[0];

//                            await services.deleteSecondaryData(data?.id, userId);
//                            await methods.populateSecondaryData(salesOrderId);
//                            secondaryGrid.refresh();

//                            Swal.fire({
//                                icon: 'success',
//                                title: 'Delete Successful',
//                                timer: 2000,
//                                showConfirmButton: false
//                            });
//                        }

//                        await methods.populateMainData();
//                        mainGrid.refresh();
//                        await methods.refreshPaymentSummary(state.id);
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

//        Vue.onMounted(async () => {
//            try {
//                await SecurityManager.authorizePage(['SalesOrders']);
//                await SecurityManager.validateToken();

//                await methods.populateMainData();
//                await mainGrid.create(state.mainData);

//                mainModal.create();
//                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
//                await methods.populateCustomerListLookupData();
//                customerListLookup.create();
//                await methods.populateTaxListLookupData();
//                taxListLookup.create();
//                await methods.populateSalesOrderStatusListLookupData();
//                salesOrderStatusListLookup.create();
//                orderDatePicker.create();
//                numberText.create();
//                await methods.populateProductListLookupData();
//                await secondaryGrid.create(state.secondaryData);
//            } catch (e) {
//                console.error('page init error:', e);
//            } finally {

//            }
//        });

//        Vue.onUnmounted(() => {
//            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
//        });

//        return {
//            mainGridRef,
//            mainModalRef,
//            orderDateRef,
//            numberRef,
//            customerIdRef,
//            taxIdRef,
//            orderStatusRef,
//            secondaryGridRef,
//            state,
//            methods,
//            handler: {
//                handleSubmit: methods.handleFormSubmit
//            }
//        };
//    }
//};

//Vue.createApp(App).mount('#app');
const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            customerListLookupData: [],
            taxListLookupData: [],
            salesOrderStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            priceDefinitionListLookupData:[],
            mainTitle: '',
            id: '',
            number: '',
            orderDate: '',
            description: '',
            customerId: null,
            taxId: null,
            orderStatus: null,
            locationId:'',
            errors: {
                orderDate: '',
                customerId: '',
                taxId: '',
                orderStatus: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            subTotalAmount: '0.00',
            taxAmount: '0.00',
            totalAmount: '0.00'
        });

        const customerState = Vue.reactive({
            mainData: [],
            deleteMode: false,
            customerGroupListLookupData: [],
            customerCategoryListLookupData: [],
            secondaryData: [],
            mainTitle: '',
            manageContactTitle: 'Manage Contact',
            id: '',
            name: '',
            number: '',
            customerGroupId: null,
            customerCategoryId: null,
            description: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phoneNumber: '',
            faxNumber: '',
            emailAddress: '',
            website: '',
            whatsApp: '',
            linkedIn: '',
            facebook: '',
            instagram: '',
            twitterX: '',
            tikTok: '',
            errors: {
                name: '',
                customerGroupId: '',
                customerCategoryId: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phoneNumber: '',
                emailAddress: '',
            },
            isSubmitting: false
        });

        // Refs
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const orderDateRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const customerIdRef = Vue.ref(null);
        const taxIdRef = Vue.ref(null);
        const orderStatusRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const customerModalRef = Vue.ref(null);
        const streetRef = Vue.ref(null);
        const cityRef = Vue.ref(null);
        const stateRef = Vue.ref(null);
        const zipCodeRef = Vue.ref(null);
        const countryRef = Vue.ref(null);
        const phoneNumberRef = Vue.ref(null);
        const faxNumberRef = Vue.ref(null);
        const emailAddressRef = Vue.ref(null);
        const websiteRef = Vue.ref(null);
        const whatsAppRef = Vue.ref(null);
        const linkedInRef = Vue.ref(null);
        const facebookRef = Vue.ref(null);
        const instagramRef = Vue.ref(null);
        const twitterXRef = Vue.ref(null);
        const tikTokRef = Vue.ref(null);
        const customerGroupIdRef = Vue.ref(null);
        const customerCategoryIdRef = Vue.ref(null);
        const CustomernumberRef = Vue.ref(null);

        // Validation Functions
        const validateForm = function () {
            // Reset errors
            state.errors.orderDate = '';
            state.errors.vendorId = '';
            state.errors.orderStatus = '';
            state.errors.gridItems = [];

            let isValid = true;

            // --- FORM FIELD VALIDATION ---
            if (!state.orderDate) {
                state.errors.orderDate = 'Order date is required.';
                isValid = false;
            }
            if (!state.customerId) {
                state.errors.customerId = 'customer is required.';
                isValid = false;
            }
            if (!state.orderStatus) {
                state.errors.orderStatus = 'Order status is required.';
                isValid = false;
            }

            // --- READ GRID CHANGES ---
            const batchChanges = secondaryGrid.getBatchChanges();

            console.log('Validation - Batch Changes:', batchChanges);

            // Build working dataset
            let currentSecondaryData = state.id !== ""
                ? [...state.secondaryData]
                : [];

            const addedRecords = batchChanges.addedRecords || [];
            const changedRecords = batchChanges.changedRecords || [];
            const deletedRecords = batchChanges.deletedRecords || [];

            // Match function for row identification
            const matchRecord = (a, b) => {
                if (a.id && b.id) return a.id === b.id;
                if (a.purchaseOrderItemId && b.purchaseOrderItemId)
                    return a.purchaseOrderItemId === b.purchaseOrderItemId;
                return false;
            };

            // --- APPLY CHANGED RECORDS ---
            for (let changed of changedRecords) {
                const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                if (index !== -1) {
                    currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
                } else {
                    currentSecondaryData.push(changed); // edited but wasn't in initial → add
                }
            }

            // --- APPLY DELETED RECORDS ---
            if (deletedRecords.length > 0) {
                currentSecondaryData = currentSecondaryData.filter(item =>
                    !deletedRecords.some(del => matchRecord(item, del))
                );
            }

            // --- APPLY ADDED RECORDS ---
            currentSecondaryData.push(...addedRecords);

            console.log("Final data for validation:", currentSecondaryData);

            // --- NO ITEMS IN GRID ---
            if (currentSecondaryData.length === 0) {
                state.errors.gridItems.push('At least one item must be added to the order.');
                isValid = false;
            }

            // --- ROW VALIDATION (only your allowed fields) ---
            currentSecondaryData.forEach((record, index) => {

                if (!record.pluCode || record.pluCode.length < 5) {
                    state.errors.gridItems.push(`Row ${index + 1}: PLU code must be at least 5 characters.`);
                    isValid = false;
                }

                if (!record.productId) {
                    state.errors.gridItems.push(`Row ${index + 1}: Product is required.`);
                    isValid = false;
                }

                if (!record.quantity || record.quantity <= 0) {
                    state.errors.gridItems.push(`Row ${index + 1}: Quantity must be greater than 0.`);
                    isValid = false;
                }

                if (!record.unitPrice || record.unitPrice <= 0) {
                    state.errors.gridItems.push(`Row ${index + 1}: Unit price must be greater than 0.`);
                    isValid = false;
                }

                if (!record.total || record.total <= 0) {
                    state.errors.gridItems.push(`Row ${index + 1}: Total must be greater than 0.`);
                    isValid = false;
                }
            });

            return isValid;
        };

        // Function to validate the customer form
        const validateCustomerForm = function () {
            customerState.errors = {
                name: '',
                customerGroupId: '',
                customerCategoryId: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phoneNumber: '',
                emailAddress: '',
                faxNumber: '',
                website: '',
                whatsApp: '',
                linkedIn: '',
                facebook: '',
                instagram: '',
                twitterX: '',
                tikTok: ''
            };

            let isValid = true;

            if (!customerState.name) {
                customerState.errors.name = 'Customer name is required.';
                isValid = false;
            }
            if (!customerState.customerGroupId) {
                customerState.errors.customerGroupId = 'Customer group is required.';
                isValid = false;
            }
            if (!customerState.customerCategoryId) {
                customerState.errors.customerCategoryId = 'Customer category is required.';
                isValid = false;
            }
            if (!customerState.street) {
                customerState.errors.street = 'Street is required.';
                isValid = false;
            }
            if (!customerState.city) {
                customerState.errors.city = 'City is required.';
                isValid = false;
            }
            if (!customerState.state) {
                customerState.errors.state = 'State is required.';
                isValid = false;
            }
            if (!customerState.zipCode) {
                customerState.errors.zipCode = 'Zip code is required.';
                isValid = false;
            }
            if (!customerState.country) {
                customerState.errors.country = 'Country is required.';
                isValid = false;
            }
            if (!customerState.phoneNumber) {
                customerState.errors.phoneNumber = 'Phone number is required.';
                isValid = false;
            }
            if (!customerState.emailAddress) {
                customerState.errors.emailAddress = 'Email address is required.';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerState.emailAddress)) {
                customerState.errors.emailAddress = 'Invalid email format.';
                isValid = false;
            }

            // Social media fields, faxNumber, and website are optional, so no validation is applied
            return isValid;
        };
        // Reset Functions
        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.orderDate = '';
            state.description = '';
            state.customerId = null;
            state.taxId = null;
            state.orderStatus = null;
            state.errors = {
                orderDate: '',
                customerId: '',
                taxId: '',
                orderStatus: '',
                description: ''
            };
            state.secondaryData = [];
            state.subTotalAmount = '0.00';
            state.taxAmount = '0.00';
            state.totalAmount = '0.00';
            state.showComplexDiv = false;
        };

        const resetCustomerFormState = () => {
            customerState.id = '';
            customerState.name = '';
            customerState.number = '';
            customerState.customerGroupId = null;
            customerState.customerCategoryId = null;
            customerState.description = '';
            customerState.street = '';
            customerState.city = '';
            customerState.state = '';
            customerState.zipCode = '';
            customerState.country = '';
            customerState.phoneNumber = '';
            customerState.faxNumber = '';
            customerState.emailAddress = '';
            customerState.website = '';
            customerState.whatsApp = '';
            customerState.linkedIn = '';
            customerState.facebook = '';
            customerState.instagram = '';
            customerState.twitterX = '';
            customerState.tikTok = '';
            customerState.errors = {
                name: '',
                customerGroupId: '',
                customerCategoryId: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phoneNumber: '',
                emailAddress: '',
            };
        };
        function createTextInput(ref, stateObj, fieldName, placeholder = "", readOnly = false) {
            const textBox = new ej.inputs.TextBox({
                placeholder: placeholder,
                value: stateObj[fieldName],
                readonly: readOnly,
                input: function (args) {
                    stateObj[fieldName] = args.value;
                }
            });

            textBox.appendTo(ref);
            return textBox;
        }


        // Services
        const services = {
            getMainData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderList?LocationId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (
                orderDate,
                description,
                orderStatus,
                taxId,
                customerId,
                createdById,
                items
            ) => {
                try {
                    const locationId = StorageManager.getLocation();

                    const response = await AxiosManager.post('/SalesOrder/CreateSalesOrder', {
                        orderDate,
                        description,
                        orderStatus,
                        taxId,
                        customerId,
                        createdById,
                        locationId,
                        items
                    });

                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (
                id,
                orderDate,
                description,
                orderStatus,
                taxId,
                customerId,
                updatedById,
                items,
                deletedItems
            ) => {
                try {
                    const locationId = StorageManager.getLocation();

                    const response = await AxiosManager.post('/SalesOrder/UpdateSalesOrder', {
                        id,
                        orderDate,
                        description,
                        orderStatus,
                        taxId,
                        customerId,
                        updatedById,
                        locationId,
                        items,
                        deletedItems
                    });

                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/SalesOrder/DeleteSalesOrder', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustomerListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Customer/GetCustomerList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createCustomer: async (name, number, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, createdById) => {
                try {
                    const response = await AxiosManager.post('/Customer/CreateCustomer', {
                        name, number, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            }, 
            getTaxListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Tax/GetTaxList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSalesOrderStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (salesOrderId) => {
                try {
                    const response = await AxiosManager.get('/SalesOrderItem/GetSalesOrderItemBySalesOrderIdList?salesOrderId=' + salesOrderId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustomerGroupListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/CustomerGroup/GetCustomerGroupList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustomerCategoryListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/CustomerCategory/GetCustomerCategoryList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (unitPrice, quantity, summary, productId, salesOrderId, createdById) => {
                try {
                    const response = await AxiosManager.post('/SalesOrderItem/CreateSalesOrderItem', {
                        unitPrice, quantity, summary, productId, salesOrderId, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, salesOrderId, updatedById) => {
                try {
                    const response = await AxiosManager.post('/SalesOrderItem/UpdateSalesOrderItem', {
                        id, unitPrice, quantity, summary, productId, salesOrderId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/SalesOrderItem/DeleteSalesOrderItem', {
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
                    const response = await AxiosManager.get('/Product/GetProductList?warehouseId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getpriceDefinitionListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Product/GetProductPriceDefinitionList' , {});
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
            }

            };

        //// Customer Text Inputs
        //const nameText = createTextInput(nameRef, customerState, 'name', 'Enter Name');
        //const CustomernumberText = createTextInput(CustomernumberRef, customerState, 'number', '[auto]', true);
        //const streetText = createTextInput(streetRef, customerState, 'street', 'Enter Street');
        //const cityText = createTextInput(cityRef, customerState, 'city', 'Enter City');
        //const stateText = createTextInput(stateRef, customerState, 'state', 'Enter State');
        //const zipCodeText = createTextInput(zipCodeRef, customerState, 'zipCode', 'Enter Zip Code');
        //const countryText = createTextInput(countryRef, customerState, 'country', 'Enter Country');
        //const phoneNumberText = createTextInput(phoneNumberRef, customerState, 'phoneNumber', 'Enter Phone Number');
        //const faxNumberText = createTextInput(faxNumberRef, customerState, 'faxNumber', 'Enter Fax Number');
        //const emailAddressText = createTextInput(emailAddressRef, customerState, 'emailAddress', 'Enter Email Address');
        //const websiteText = createTextInput(websiteRef, customerState, 'website', 'Enter Website');
        //const whatsAppText = createTextInput(whatsAppRef, customerState, 'whatsApp', 'Enter WhatsApp');
        //const linkedInText = createTextInput(linkedInRef, customerState, 'linkedIn', 'Enter LinkedIn');
        //const facebookText = createTextInput(facebookRef, customerState, 'facebook', 'Enter Facebook');
        //const instagramText = createTextInput(instagramRef, customerState, 'instagram', 'Enter Instagram');
        //const twitterXText = createTextInput(twitterXRef, customerState, 'twitterX', 'Enter Twitter/X');
        //const tikTokText = createTextInput(tikTokRef, customerState, 'tikTok', 'Enter TikTok');

        Vue.onMounted(() => {
            createTextInput(nameRef.value, customerState, 'name', 'Enter Name');
            createTextInput(CustomernumberRef.value, customerState, 'number', '[auto]', true);
            createTextInput(streetRef.value, customerState, 'street', 'Enter Street');
            createTextInput(cityRef.value, customerState, 'city', 'Enter City');
            createTextInput(stateRef.value, customerState, 'state', 'Enter State');
            createTextInput(zipCodeRef.value, customerState, 'zipCode', 'Enter Zip Code');
            createTextInput(countryRef.value, customerState, 'country', 'Enter Country');
            createTextInput(phoneNumberRef.value, customerState, 'phoneNumber', 'Enter Phone Number');
            createTextInput(faxNumberRef.value, customerState, 'faxNumber', 'Enter Fax Number');
            createTextInput(emailAddressRef.value, customerState, 'emailAddress', 'Enter Email Address');
            createTextInput(websiteRef.value, customerState, 'website', 'Enter Website');
            createTextInput(whatsAppRef.value, customerState, 'whatsApp', 'Enter WhatsApp');
            createTextInput(linkedInRef.value, customerState, 'linkedIn', 'Enter LinkedIn');
            createTextInput(facebookRef.value, customerState, 'facebook', 'Enter Facebook');
            createTextInput(instagramRef.value, customerState, 'instagram', 'Enter Instagram');
            createTextInput(twitterXRef.value, customerState, 'twitterX', 'Enter Twitter/X');
            createTextInput(tikTokRef.value, customerState, 'tikTok', 'Enter TikTok');
        });


        // Methods
        const methods = {
            populateCustomerListLookupData: async () => {
                const response = await services.getCustomerListLookupData();
                state.customerListLookupData = response?.data?.content?.data;
                if (customerListLookup.obj) {
                    customerListLookup.refresh();
                }
            },
            populateTaxListLookupData: async () => {
                const response = await services.getTaxListLookupData();
                state.taxListLookupData = response?.data?.content?.data;
            },
            populateSalesOrderStatusListLookupData: async () => {
                const response = await services.getSalesOrderStatusListLookupData();
                state.salesOrderStatusListLookupData = response?.data?.content?.data;
            },           
            openCustomerModal: async () => {
                try {
                    await methods.populateCustomerGroupListLookupData();
                    await methods.populateCustomerCategoryListLookupData();
                    resetCustomerFormState();
                    customerState.mainTitle = 'Add Customer';

                    // Initialize lookups
                    if (!customerGroupListLookup.obj) {
                        customerGroupListLookup.create();
                    } else {
                        customerGroupListLookup.refresh();
                    }

                    if (!customerCategoryListLookup.obj) {
                        customerCategoryListLookup.create();
                    } else {
                        customerCategoryListLookup.refresh();
                    }

                    // Initialize text inputs
                    const textInputs = [
                        nameText, CustomernumberText, streetText, cityText, stateText,
                        zipCodeText, countryText, phoneNumberText, faxNumberText,
                        emailAddressText, websiteText, whatsAppText, linkedInText,
                        facebookText, instagramText, twitterXText, tikTokText
                    ];

                    textInputs.forEach(input => {
                        if (!input.obj) {
                            input.obj = input.create();
                        }
                    });

                    // Show modal
                    if (!customerModal.obj) {
                        customerModal.create();
                    }
                    if (customerModal.obj) {
                        customerModal.obj.show();
                    } else {
                        console.error('Failed to initialize CustomerModal');
                    }
                } catch (error) {
                    console.error('Error opening customer modal:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to open customer form',
                        confirmButtonText: 'OK'
                    });
                }
            },
            handleCustomerFormSubmit: async () => {
                debugger
                customerState.isSubmitting = true;
                await new Promise(resolve => setTimeout(resolve, 200));

                if (!validateCustomerForm()) {
                    customerState.isSubmitting = false;
                    return;
                }

                try {
                    const response = customerState.id === ''
                        ? await services.createCustomer(
                            customerState.name,
                            customerState.number,
                            customerState.customerGroupId,
                            customerState.customerCategoryId,
                            customerState.description,
                            customerState.street,
                            customerState.city,
                            customerState.state,
                            customerState.zipCode,
                            customerState.country,
                            customerState.phoneNumber,
                            customerState.faxNumber,
                            customerState.emailAddress,
                            customerState.website,
                            customerState.whatsApp,
                            customerState.linkedIn,
                            customerState.facebook,
                            customerState.instagram,
                            customerState.twitterX,
                            customerState.tikTok,
                            StorageManager.getUserId()
                        )
                        : // Add update logic here if needed
                        null; // Placeholder for update logic

                    if (response && response.data.code === 200) {
                        await methods.populateCustomerListLookupData();
                        if (!customerListLookup.obj) {
                            customerListLookup.create();
                        }
                        Swal.fire({
                            icon: 'success',
                            title: 'Customer Created',
                            timer: 1000,
                            showConfirmButton: false
                        });
                        const modalEl = document.getElementById('CustomerModal');
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) {
                            modal.hide();
                        }
                        resetCustomerFormState();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Customer Creation Failed',
                            text: response?.data?.message ?? 'Please check your data.',
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
                    customerState.isSubmitting = false;
                }
            },
            populateCustomerGroupListLookupData: async () => {
                const response = await services.getCustomerGroupListLookupData();
                customerState.customerGroupListLookupData = response?.data?.content?.data;
            },
            populateCustomerCategoryListLookupData: async () => {
                const response = await services.getCustomerCategoryListLookupData();
                customerState.customerCategoryListLookupData = response?.data?.content?.data;
            },
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    orderDate: new Date(item.orderDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateSecondaryData: async (salesOrderId) => {
                try {
                    const response = await services.getSecondaryData(salesOrderId);
                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    }));
                    methods.refreshPaymentSummary(salesOrderId);
                } catch (error) {
                    state.secondaryData = [];
                }
            },
            populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data;
            },
            populateProductActivePriceLookupData : async () => {
                const response = await services.getpriceDefinitionListLookupData();
                state.priceDefinitionListLookupData = response?.data?.content?.data;
            },
            refreshPaymentSummary: async (id) => {
                const record = state.mainData.find(item => item.id === id);
                if (record) {
                    state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0);
                    state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0);
                    state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0);
                }
            },
            prepareSecondaryDataForSubmission: function () {
                const batchChanges = secondaryGrid.getBatchChanges();

                console.log('Batch Changes:', batchChanges);

                // Base data if editing an existing document
                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [];

                const addedRecords = batchChanges.addedRecords || [];
                const changedRecords = batchChanges.changedRecords || [];

                // --- Helper: Match by id (or purchaseOrderItemId if exists) ---
                const matchRecord = (a, b) => {
                    if (a.id && b.id) return a.id === b.id;
                    if (a.purchaseOrderItemId && b.purchaseOrderItemId)
                        return a.purchaseOrderItemId === b.purchaseOrderItemId;
                    return false;
                };

                // Allowed fields only
                const filterFields = (item) => {
                    return {
                        id: item.id ?? null,
                        pluCode: item.pluCode ?? null,
                        productId: item.productId ?? null,
                        unitPrice: item.unitPrice ?? 0,
                        quantity: item.quantity ?? 0,
                        total: item.total ?? 0,
                        summary: item.summary ?? ""
                    };
                };

                // --- 1️⃣ PROCESS CHANGED RECORDS ---
                for (let changed of changedRecords) {
                    const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));

                    if (index !== -1) {
                        currentSecondaryData[index] = {
                            ...currentSecondaryData[index],
                            ...filterFields(changed)
                        };
                    } else {
                        currentSecondaryData.push(filterFields(changed));
                    }
                }

                // --- 2️⃣ PROCESS ADDED RECORDS ---
                for (let added of addedRecords) {
                    currentSecondaryData.push(filterFields(added));
                }

                // --- 3️⃣ PROCESS DELETED RECORDS ---
                let deletedRecords = (batchChanges.deletedRecords || []).flat(Infinity);

                if (deletedRecords.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deletedRecords.some(del => matchRecord(item, del))
                    );
                }

                // --- 4️⃣ VALID ITEMS (clean final list) ---
                const validItems = currentSecondaryData.filter(item => {
                    if (!item.productId) return false;
                    if (!item.pluCode || item.pluCode.length < 5) return false;
                    if (item.quantity <= 0) return false;
                    if (item.unitPrice === null || item.unitPrice === undefined) return false;
                    return true;
                });

                console.log("📌 Final Valid Items:", validItems);
                console.log("❌ Final Deleted Items:", deletedRecords);

                return {
                    validItems,
                    deletedRecords,
                    summary: {
                        total: validItems.length,
                        added: addedRecords.length,
                        changed: changedRecords.length,
                        deleted: deletedRecords.length
                    }
                };
            },
            handleFormSubmit: async () => {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));

                    if (!validateForm()) {
                        state.isSubmitting = false;
                        return;
                    }

                    const userId = StorageManager.getUserId();
                    const { validItems, deletedRecords } = methods.prepareSecondaryDataForSubmission();

                    let response;

                    // ----------------------------------------------------
                    // Build Items DTO (Always convert PLU to integer)
                    // ----------------------------------------------------
                    const itemsDto = validItems.map(item => ({
                        Id: item.id || null,
                        pluCode: Number(item.pluCode),   // ✔ FORCE INTEGER
                        productId: item.productId,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        total: item.total,
                        summary: item.summary
                    }));

                    // -----------------------------
                    // CREATE NEW SALES ORDER
                    // -----------------------------
                    if (state.id === '') {

                        response = await services.createMainData(
                            state.orderDate,
                            state.description,
                            state.orderStatus,
                            state.taxId,        // REQUIRED
                            state.customerId,   // REQUIRED FOR SALES ORDER
                            userId,
                            itemsDto            // ✔ Contains numeric PLU
                        );

                        if (response.data.code === 200) {
                            state.id = response.data.content.data.id;
                            state.number = response.data.content.data.number;
                        }
                    }

                    // -----------------------------
                    // DELETE SALES ORDER
                    // -----------------------------
                    else if (state.deleteMode) {
                        response = await services.deleteMainData(state.id, userId);
                    }

                    // -----------------------------
                    // UPDATE SALES ORDER
                    // -----------------------------
                    else {

                        const deletedItemsDto = deletedRecords.flat(Infinity).map(x => ({
                            Id: x.id || null
                        }));

                        response = await services.updateMainData(
                            state.id,
                            state.orderDate,
                            state.description,
                            state.orderStatus,
                            state.taxId,
                            state.customerId,
                            userId,
                            itemsDto,          // ✔ Has numeric PLU
                            deletedItemsDto
                        );
                    }

                    // -----------------------------
                    // HANDLE SUCCESS RESPONSE
                    // -----------------------------
                    if (response.data.code === 200) {

                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            await methods.populateSecondaryData();
                            secondaryGrid.refresh();

                            state.mainTitle = 'Edit Sales Order';
                            state.showComplexDiv = true;

                            Swal.fire({
                                icon: 'success',
                                title: 'Save Successful',
                                timer: 1200,
                                showConfirmButton: false
                            });
                        }
                        else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Delete Successful',
                                timer: 1500,
                                showConfirmButton: false
                            });

                            setTimeout(() => {
                                mainModal.obj.hide();
                                resetFormState();
                            }, 1500);
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
                    secondaryGrid.clearBatchChanges();
                    state.isSubmitting = false;
                }
            },
            onMainModalHidden: () => {
                state.errors.orderDate = '';
                state.errors.customerId = '';
                state.errors.taxId = '';
                state.errors.orderStatus = '';
                taxListLookup.trackingChange = false;
            },
        };

        // Lookup Components
        const customerListLookup = {
            obj: null,
            create: () => {
                if (state.customerListLookupData && Array.isArray(state.customerListLookupData)) {
                    customerListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.customerListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Customer',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.customerListLookupData, query);
                        },
                        change: (e) => {
                            state.customerId = e.value;
                        }
                    });
                    customerListLookup.obj.appendTo(customerIdRef.value);
                }
            },
            refresh: () => {
                if (customerListLookup.obj) {
                    customerListLookup.obj.dataSource = state.customerListLookupData;
                    customerListLookup.obj.value = state.customerId;
                }
            }
        };

        const customerGroupListLookup = {
            obj: null,
            create: () => {
                if (customerState.customerGroupListLookupData && Array.isArray(customerState.customerGroupListLookupData)) {
                    customerGroupListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: customerState.customerGroupListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Customer Group',
                        change: (e) => {
                            customerState.customerGroupId = e.value;
                        }
                    });
                    customerGroupListLookup.obj.appendTo(customerGroupIdRef.value);
                } else {
                    console.error('Customer Group list lookup data is not available or invalid.');
                }
            },
            refresh: () => {
                if (customerGroupListLookup.obj) {
                    customerGroupListLookup.obj.value = customerState.customerGroupId;
                }
            },
        };

        const customerCategoryListLookup = {
            obj: null,
            create: () => {
                if (customerState.customerCategoryListLookupData && Array.isArray(customerState.customerCategoryListLookupData)) {
                    customerCategoryListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: customerState.customerCategoryListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Customer Category',
                        change: (e) => {
                            customerState.customerCategoryId = e.value;
                        }
                    });
                    customerCategoryListLookup.obj.appendTo(customerCategoryIdRef.value);
                } else {
                    console.error('Customer Category list lookup data is not available or invalid.');
                }
            },
            refresh: () => {
                if (customerCategoryListLookup.obj) {
                    customerCategoryListLookup.obj.value = customerState.customerCategoryId;
                }
            },
        };

        const taxListLookup = {
            obj: null,
            trackingChange: false,
            create: () => {
                if (state.taxListLookupData && Array.isArray(state.taxListLookupData)) {
                    taxListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.taxListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Tax',
                        change: async (e) => {
                            state.taxId = e.value;
                            if (e.isInteracted && taxListLookup.trackingChange) {
                                await methods.handleFormSubmit();
                            }
                        }
                    });
                    taxListLookup.obj.appendTo(taxIdRef.value);
                }
            },
            refresh: () => {
                if (taxListLookup.obj) {
                    taxListLookup.obj.value = state.taxId;
                }
            }
        };

        const salesOrderStatusListLookup = {
            obj: null,
            create: () => {
                if (state.salesOrderStatusListLookupData && Array.isArray(state.salesOrderStatusListLookupData)) {
                    salesOrderStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.salesOrderStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select an Order Status',
                        change: (e) => {
                            state.orderStatus = e.value;
                        }
                    });
                    salesOrderStatusListLookup.obj.appendTo(orderStatusRef.value);
                }
            },
            refresh: () => {
                if (salesOrderStatusListLookup.obj) {
                    salesOrderStatusListLookup.obj.value = state.orderStatus;
                }
            }
        };

        const orderDatePicker = {
            obj: null,
            create: () => {
                orderDatePicker.obj = new ej.calendars.DatePicker({
                    format: 'yyyy-MM-dd',
                    value: state.orderDate ? new Date(state.orderDate) : null,
                    change: (e) => {
                        state.orderDate = e.value;
                    }
                });
                orderDatePicker.obj.appendTo(orderDateRef.value);
            },
            refresh: () => {
                if (orderDatePicker.obj) {
                    orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null;
                }
            }
        };

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                    readonly: true
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        // Watchers
        Vue.watch(
            () => state.orderDate,
            (newVal, oldVal) => {
                orderDatePicker.refresh();
                state.errors.orderDate = '';
            }
        );

        Vue.watch(
            () => state.customerId,
            (newVal, oldVal) => {
                customerListLookup.refresh();
                state.errors.customerId = '';
            }
        );

        Vue.watch(
            () => state.taxId,
            (newVal, oldVal) => {
                taxListLookup.refresh();
                state.errors.taxId = '';
            }
        );

        Vue.watch(
            () => state.orderStatus,
            (newVal, oldVal) => {
                salesOrderStatusListLookup.refresh();
                state.errors.orderStatus = '';
            }
        );

        // Grids
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
                    groupSettings: { columns: ['customerName'] },
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
                        { field: 'orderDate', headerText: 'SO Date', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'customerName', headerText: 'Customer', width: 200, minWidth: 200 },
                        { field: 'orderStatusName', headerText: 'Status', width: 150, minWidth: 150 },
                        { field: 'taxName', headerText: 'Tax', width: 150, minWidth: 150 },
                        { field: 'afterTaxAmount', headerText: 'Total Amount', width: 150, minWidth: 150, format: 'N2' },
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
                        mainGrid.obj.autoFitColumns(['number', 'orderDate', 'customerName', 'orderStatusName', 'taxName', 'afterTaxAmount', 'createdAtUtc']);
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

                        //if (args.item.id === 'AddCustom') {
                        //    state.deleteMode = false;
                        //    state.mainTitle = 'Add Sales Order';
                        //    resetFormState();
                        //    state.secondaryData = [];
                        //    secondaryGrid.refresh();
                        //    state.showComplexDiv = false;
                        //    mainModal.obj.show();
                        //}
                        
                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'Add Sales Order';
                            resetFormState();
                            state.secondaryData = [];

                            // Create new grid properly
                            if (secondaryGrid.obj == null) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.refresh();
                            }

                            state.showComplexDiv = true;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Sales Order';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.customerId = selectedRecord.customerId ?? '';
                                state.taxId = selectedRecord.taxId ?? '';
                                taxListLookup.trackingChange = true;
                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.showComplexDiv = true;

                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();

                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Sales Order?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.customerId = selectedRecord.customerId ?? '';
                                state.taxId = selectedRecord.taxId ?? '';
                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.showComplexDiv = false;

                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();

                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/SalesOrders/SalesOrderPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
        //            allowSearching: false,        // << enable grid search
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
        //                    field: "pluCode",
        //                    headerText: "PLU Code",
        //                    width: 140,
        //                    editType: "stringedit",
        //                    validationRules: { required: true },

        //                    edit: {
        //                        create: () => {
        //                            let pluElem = document.createElement("input");
        //                            return pluElem;
        //                        },
        //                        read: () => pluObj?.value,
        //                        destroy: () => pluObj?.destroy(),

        //                        write: (args) => {
        //                            pluObj = new ej.inputs.TextBox({
        //                                value: args.rowData.pluCode ?? "",
        //                                placeholder: "Enter 5+ characters"
        //                            });

        //                            pluObj.appendTo(args.element);

        //                            // ============================================
        //                            // 🔥 GET THE ACTUAL INPUT ELEMENT
        //                            // ============================================
        //                            const inputElement = pluObj.element;

        //                            // ============================================
        //                            // 🔥 KEYDOWN EVENT - Attached to input element
        //                            // ============================================
        //                            inputElement.addEventListener('keydown', (e) => {
        //                                const key = e.key;

        //                                // Allow: alphanumeric, backspace, delete, arrows, tab, enter
        //                                const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
        //                                    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

        //                                if (!isValidKey) {
        //                                    e.preventDefault();
        //                                    console.log('❌ Invalid character blocked:', key);
        //                                }
        //                            });

        //                            // ============================================
        //                            // 🔥 KEYUP EVENT - Attached to input element (MAIN)
        //                            // ============================================
        //                            inputElement.addEventListener('keyup', async (e) => {
        //                                const enteredPLU = inputElement.value?.trim() ?? "";

        //                                console.log('⬆️ KEYUP Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

        //                                // Only proceed if 5+ characters
        //                                if (enteredPLU.length < 5) {
        //                                    console.log('⏳ Waiting for more characters... (' + enteredPLU.length + '/5)');
        //                                    return;
        //                                }

        //                                try {
        //                                    // 🔥 CALL API TO GET PRODUCT ID
        //                                    console.log('📡 Calling API for PLU:', enteredPLU);
        //                                    const result = await services.getProductIdByPLU(enteredPLU);
        //                                    const productId = result?.data?.content?.productId;

        //                                    if (!productId) {
        //                                        Swal.fire({
        //                                            icon: 'warning',
        //                                            title: 'Invalid PLU',
        //                                            text: 'No product found for this PLU code',
        //                                            timer: 2000,
        //                                            showConfirmButton: false
        //                                        });
        //                                        console.log('❌ No product found for PLU:', enteredPLU);
        //                                        return;
        //                                    }

        //                                    console.log('✅ Product found - ID:', productId);

        //                                    // SET PRODUCT ID IN ROW DATA
        //                                    args.rowData.productId = productId;

        //                                    // 🔥 UPDATE PRODUCT DROPDOWN
        //                                    if (productObj) {
        //                                        productObj.value = productId;
        //                                        productObj.dataBind();
        //                                        productObj.change({ value: productId });
        //                                        console.log('✅ Product dropdown updated with ID:', productId);
        //                                    }

        //                                } catch (error) {
        //                                    console.error('❌ KEYUP Error:', error);
        //                                    Swal.fire({
        //                                        icon: 'error',
        //                                        title: 'Error',
        //                                        text: 'Failed to fetch product details',
        //                                        timer: 2000
        //                                    });
        //                                }
        //                            });

        //                            // ============================================
        //                            // 🔥 CHANGE EVENT - Fallback for blur/paste
        //                            // ============================================
        //                            inputElement.addEventListener('change', async (e) => {
        //                                const enteredPLU = inputElement.value?.trim() ?? "";

        //                                console.log('📝 CHANGE Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

        //                                if (!enteredPLU || enteredPLU.length < 5) {
        //                                    console.log('❌ PLU too short, skipping API call');
        //                                    return;
        //                                }

        //                                try {
        //                                    // 🔥 CALL API TO GET PRODUCT ID
        //                                    console.log('📡 Calling API for PLU:', enteredPLU);
        //                                    const result = await services.getProductIdByPLU(enteredPLU);
        //                                    const productId = result?.data?.content?.productId;

        //                                    if (!productId) {
        //                                        Swal.fire({
        //                                            icon: 'warning',
        //                                            title: 'Invalid PLU',
        //                                            text: 'No product found for this PLU code',
        //                                            timer: 2000,
        //                                            showConfirmButton: false
        //                                        });
        //                                        console.log('❌ No product found for PLU:', enteredPLU);
        //                                        return;
        //                                    }

        //                                    console.log('✅ Product found - ID:', productId);

        //                                    // SET PRODUCT ID IN ROW DATA
        //                                    args.rowData.productId = productId;

        //                                    // 🔥 UPDATE PRODUCT DROPDOWN
        //                                    if (productObj) {
        //                                        productObj.value = productId;
        //                                        productObj.dataBind();
        //                                        productObj.change({ value: productId });
        //                                        console.log('✅ Product dropdown updated with ID:', productId);
        //                                    }

        //                                } catch (error) {
        //                                    console.error('❌ CHANGE Error:', error);
        //                                    Swal.fire({
        //                                        icon: 'error',
        //                                        title: 'Error',
        //                                        text: 'Failed to fetch product details',
        //                                        timer: 2000
        //                                    });
        //                                }
        //                            });
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 250,
        //                    validationRules: { required: true },
        //                    allowEditing: false,   // ❌ user cannot edit
        //                    disableHtmlEncode: false,

        //                    valueAccessor: (field, data) => {
        //                        const product = state.productListLookupData.find(x => x.id === data[field]);
        //                        return product ? product.name : "";
        //                    },

        //                    editType: 'dropdownedit',
        //                    edit: {
        //                        create: () => {
        //                            let productElem = document.createElement("input");
        //                            return productElem;
        //                        },
        //                        read: () => productObj?.value,
        //                        destroy: () => productObj?.destroy(),

        //                        write: (args) => {
        //                            productObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.productListLookupData,
        //                                fields: { value: 'id', text: 'name' },
        //                                value: args.rowData.productId,

        //                                enabled: false,   // ❌ disable dropdown UI completely

        //                                change: (e) => {
        //                                    // ⏭ THIS LOGIC STILL RUNS WHEN PROGRAMMATICALLY TRIGGERED
        //                                    const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
        //                                    if (!selectedProduct) return;

        //                                    args.rowData.productId = selectedProduct.id;

        //                                    // Set product number
        //                                    if (numberObj) numberObj.value = selectedProduct.number;

        //                                    // GET PRICE
        //                                    const priceDef = state.priceDefinitionListLookupData
        //                                        ?.find(x => x.productId === selectedProduct.id && x.isActive);

        //                                    const finalPrice = priceDef ? priceDef.salePrice : selectedProduct.unitPrice;

        //                                    if (priceObj) priceObj.value = finalPrice;

        //                                    // Summary
        //                                    if (summaryObj) summaryObj.value = selectedProduct.description;

        //                                    // Quantity + Total
        //                                    if (quantityObj) {
        //                                        quantityObj.value = 1;
        //                                        if (totalObj) totalObj.value = finalPrice * quantityObj.value;
        //                                    }
        //                                }
        //                            });

        //                            productObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'unitPrice',
        //                    headerText: 'Unit Price',
        //                    width: 200, validationRules: { required: true }, type: 'number', format: 'N2', textAlign: 'Right',
        //                    edit: {
        //                        create: () => {
        //                            let priceElem = document.createElement('input');
        //                            return priceElem;
        //                        },
        //                        read: () => {
        //                            return priceObj.value;
        //                        },
        //                        destroy: () => {
        //                            priceObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            priceObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.unitPrice ?? 0,
        //                                change: (e) => {
        //                                    if (quantityObj && totalObj) {
        //                                        const total = e.value * quantityObj.value;
        //                                        totalObj.value = total;
        //                                    }
        //                                }
        //                            });
        //                            priceObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'quantity',
        //                    headerText: 'Quantity',
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
        //                            let quantityElem = document.createElement('input');
        //                            return quantityElem;
        //                        },
        //                        read: () => {
        //                            return quantityObj.value;
        //                        },
        //                        destroy: () => {
        //                            quantityObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            quantityObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.quantity ?? 0,
        //                                change: (e) => {
        //                                    if (priceObj && totalObj) {
        //                                        const total = e.value * priceObj.value;
        //                                        totalObj.value = total;
        //                                    }
        //                                }
        //                            });
        //                            quantityObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'total',
        //                    headerText: 'Total',
        //                    width: 200, validationRules: { required: false }, type: 'number', format: 'N2', textAlign: 'Right',
        //                    edit: {
        //                        create: () => {
        //                            let totalElem = document.createElement('input');
        //                            return totalElem;
        //                        },
        //                        read: () => {
        //                            return totalObj.value;
        //                        },
        //                        destroy: () => {
        //                            totalObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            totalObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.total ?? 0,
        //                                readonly: true
        //                            });
        //                            totalObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'productNumber',
        //                    headerText: 'Product Number',
        //                    allowEditing: false,
        //                    width: 180,
        //                    edit: {
        //                        create: () => {
        //                            let numberElem = document.createElement('input');
        //                            return numberElem;
        //                        },
        //                        read: () => {
        //                            return numberObj.value;
        //                        },
        //                        destroy: () => {
        //                            numberObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            numberObj = new ej.inputs.TextBox();
        //                            numberObj.value = args.rowData.productNumber;
        //                            numberObj.readonly = true;
        //                            numberObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'summary',
        //                    headerText: 'Summary',
        //                    width: 200,
        //                    edit: {
        //                        create: () => {
        //                            let summaryElem = document.createElement('input');
        //                            return summaryElem;
        //                        },
        //                        read: () => {
        //                            return summaryObj.value;
        //                        },
        //                        destroy: () => {
        //                            summaryObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            summaryObj = new ej.inputs.TextBox();
        //                            summaryObj.value = args.rowData.summary;
        //                            summaryObj.appendTo(args.element);
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
        //            actionBegin: async function (args) {
        //                if (args.requestType === 'searching') {

        //                    const searchText = args.searchString ?? "";

        //                    //// 🔥 CALL YOUR API SERVICE
        //                    //const response = await services.searchSecondaryGridData(searchText, state.id);

        //                    //// response should be array of rows
        //                    //secondaryGrid.obj.setProperties({ dataSource: response });
        //                }
        //            },
        //        //    actionComplete: async (args) => {
        //        //        if (args.requestType === 'save' && args.action === 'add') {
        //        //            const salesOrderId = state.id;
        //        //            const userId = StorageManager.getUserId();
        //        //            const data = args.data;

        //        //            //await services.createSecondaryData(data?.unitPrice, data?.quantity, data?.summary, data?.productId, salesOrderId, userId);
        //        //            //await methods.populateSecondaryData(salesOrderId);
        //        //            secondaryGrid.refresh();

        //        //            Swal.fire({
        //        //                icon: 'success',
        //        //                title: 'Save Successful',
        //        //                timer: 2000,
        //        //                showConfirmButton: false
        //        //            });
        //        //        }
        //        //        if (args.requestType === 'save' && args.action === 'edit') {
        //        //            const salesOrderId = state.id;
        //        //            const userId = StorageManager.getUserId();
        //        //            const data = args.data;

        //        //            //await services.updateSecondaryData(data?.id, data?.unitPrice, data?.quantity, data?.summary, data?.productId, salesOrderId, userId);
        //        //            //await methods.populateSecondaryData(salesOrderId);
        //        //            secondaryGrid.refresh();

        //        //            Swal.fire({
        //        //                icon: 'success',
        //        //                title: 'Save Successful',
        //        //                timer: 2000,
        //        //                showConfirmButton: false
        //        //            });
        //        //        }
        //        //        if (args.requestType === 'delete') {
        //        //            const salesOrderId = state.id;
        //        //            const userId = StorageManager.getUserId();
        //        //            const data = args.data[0];

        //        //            await services.deleteSecondaryData(data?.id, userId);
        //        //            await methods.populateSecondaryData(salesOrderId);
        //        //            secondaryGrid.refresh();

        //        //            Swal.fire({
        //        //                icon: 'success',
        //        //                title: 'Delete Successful',
        //        //                timer: 2000,
        //        //                showConfirmButton: false
        //        //            });
        //        //        }

        //        //        await methods.populateMainData();
        //        //        mainGrid.refresh();
        //        //        await methods.refreshPaymentSummary(state.id);
        //        //    }
        //        });
        //        secondaryGrid.obj.appendTo(secondaryGridRef.value);
        //    },
        //    refresh: () => {
        //        if (!secondaryGrid.obj) return;   // <-- prevent crash
        //        secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
        //    }
        //};
        const secondaryGrid = {
            obj: null,

            // 🔥 ADD BATCH TRACKING
            manualBatchChanges: {
                addedRecords: [],
                changedRecords: [],
                deletedRecords: []
            },

            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource,
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowSearching: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'productName', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: false,
                    showColumnMenu: false,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
                        },
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
                                        placeholder: "Enter 5+ characters"
                                    });

                                    pluObj.appendTo(args.element);

                                    const inputElement = pluObj.element;

                                    inputElement.addEventListener('keydown', (e) => {
                                        const key = e.key;
                                        const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
                                            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

                                        if (!isValidKey) {
                                            e.preventDefault();
                                            console.log('❌ Invalid character blocked:', key);
                                        }
                                    });

                                    inputElement.addEventListener('keyup', async (e) => {
                                        const enteredPLU = inputElement.value?.trim() ?? "";

                                        console.log('⬆️ KEYUP Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                                        if (enteredPLU.length < 5) {
                                            console.log('⏳ Waiting for more characters... (' + enteredPLU.length + '/5)');
                                            return;
                                        }

                                        try {
                                            console.log('📡 Calling API for PLU:', enteredPLU);
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
                                                console.log('❌ No product found for PLU:', enteredPLU);
                                                return;
                                            }

                                            console.log('✅ Product found - ID:', productId);

                                            args.rowData.productId = productId;

                                            if (productObj) {
                                                productObj.value = productId;
                                                productObj.dataBind();
                                                productObj.change({ value: productId });
                                                console.log('✅ Product dropdown updated with ID:', productId);
                                            }

                                        } catch (error) {
                                            console.error('❌ KEYUP Error:', error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'Failed to fetch product details',
                                                timer: 2000
                                            });
                                        }
                                    });

                                    inputElement.addEventListener('change', async (e) => {
                                        const enteredPLU = inputElement.value?.trim() ?? "";

                                        console.log('📝 CHANGE Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                                        if (!enteredPLU || enteredPLU.length < 5) {
                                            console.log('❌ PLU too short, skipping API call');
                                            return;
                                        }

                                        try {
                                            console.log('📡 Calling API for PLU:', enteredPLU);
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
                                                console.log('❌ No product found for PLU:', enteredPLU);
                                                return;
                                            }

                                            console.log('✅ Product found - ID:', productId);

                                            args.rowData.productId = productId;

                                            if (productObj) {
                                                productObj.value = productId;
                                                productObj.dataBind();
                                                productObj.change({ value: productId });
                                                console.log('✅ Product dropdown updated with ID:', productId);
                                            }

                                        } catch (error) {
                                            console.error('❌ CHANGE Error:', error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'Failed to fetch product details',
                                                timer: 2000
                                            });
                                        }
                                    });
                                }
                            }
                        },
                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 250,
                            validationRules: { required: true },
                            allowEditing: false,
                            disableHtmlEncode: false,

                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(x => x.id === data[field]);
                                return product ? product.name : "";
                            },

                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    let productElem = document.createElement("input");
                                    return productElem;
                                },
                                read: () => productObj?.value,
                                destroy: () => productObj?.destroy(),

                                write: (args) => {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.productId,

                                        enabled: false,

                                        change: (e) => {
                                            const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
                                            if (!selectedProduct) return;

                                            args.rowData.productId = selectedProduct.id;

                                            if (numberObj) numberObj.value = selectedProduct.number;

                                            const priceDef = state.priceDefinitionListLookupData
                                                ?.find(x => x.productId === selectedProduct.id && x.isActive);

                                            const finalPrice = priceDef ? priceDef.salePrice : selectedProduct.unitPrice;

                                            if (priceObj) priceObj.value = finalPrice;

                                            if (summaryObj) summaryObj.value = selectedProduct.description;

                                            if (quantityObj) {
                                                quantityObj.value = 1;
                                                if (totalObj) totalObj.value = finalPrice * quantityObj.value;
                                            }
                                        }
                                    });

                                    productObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'unitPrice',
                            headerText: 'Unit Price',
                            width: 200, validationRules: { required: true }, type: 'number', format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    let priceElem = document.createElement('input');
                                    return priceElem;
                                },
                                read: () => {
                                    return priceObj.value;
                                },
                                destroy: () => {
                                    priceObj.destroy();
                                },
                                write: (args) => {
                                    priceObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.unitPrice ?? 0,
                                        change: (e) => {
                                            if (quantityObj && totalObj) {
                                                const total = e.value * quantityObj.value;
                                                totalObj.value = total;
                                            }
                                        }
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'quantity',
                            headerText: 'Quantity',
                            width: 200,
                            validationRules: {
                                required: true,
                                custom: [(args) => {
                                    return args['value'] > 0;
                                }, 'Must be a positive number and not zero']
                            },
                            type: 'number', format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    let quantityElem = document.createElement('input');
                                    return quantityElem;
                                },
                                read: () => {
                                    return quantityObj.value;
                                },
                                destroy: () => {
                                    quantityObj.destroy();
                                },
                                write: (args) => {
                                    quantityObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.quantity ?? 0,
                                        change: (e) => {
                                            if (priceObj && totalObj) {
                                                const total = e.value * priceObj.value;
                                                totalObj.value = total;
                                            }
                                        }
                                    });
                                    quantityObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'total',
                            headerText: 'Total',
                            width: 200, validationRules: { required: false }, type: 'number', format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    let totalElem = document.createElement('input');
                                    return totalElem;
                                },
                                read: () => {
                                    return totalObj.value;
                                },
                                destroy: () => {
                                    totalObj.destroy();
                                },
                                write: (args) => {
                                    totalObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.total ?? 0,
                                        readonly: true
                                    });
                                    totalObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'productNumber',
                            headerText: 'Product Number',
                            allowEditing: false,
                            width: 180,
                            edit: {
                                create: () => {
                                    let numberElem = document.createElement('input');
                                    return numberElem;
                                },
                                read: () => {
                                    return numberObj.value;
                                },
                                destroy: () => {
                                    numberObj.destroy();
                                },
                                write: (args) => {
                                    numberObj = new ej.inputs.TextBox();
                                    numberObj.value = args.rowData.productNumber;
                                    numberObj.readonly = true;
                                    numberObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'summary',
                            headerText: 'Summary',
                            width: 200,
                            edit: {
                                create: () => {
                                    let summaryElem = document.createElement('input');
                                    return summaryElem;
                                },
                                read: () => {
                                    return summaryObj.value;
                                },
                                destroy: () => {
                                    summaryObj.destroy();
                                },
                                write: (args) => {
                                    summaryObj = new ej.inputs.TextBox();
                                    summaryObj.value = args.rowData.summary;
                                    summaryObj.appendTo(args.element);
                                }
                            }
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
                    actionBegin: async function (args) {
                        if (args.requestType === 'searching') {
                            const searchText = args.searchString ?? "";
                            // Search logic here
                        }
                    },

                    // 🔥 UNCOMMENTED AND IMPLEMENTED actionComplete
                    actionComplete: async (args) => {
                        if (args.requestType === 'save' && args.action === 'add') {
                            // 🔥 TRACK ADDED ROW
                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
                            console.log('✅ Row Added:', args.data);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
                        }

                        if (args.requestType === 'save' && args.action === 'edit') {
                            // 🔥 TRACK MODIFIED ROW (update if exists, else add)
                            const index = secondaryGrid.manualBatchChanges.changedRecords.findIndex(
                                r => r.id === args.data?.id
                            );
                            if (index > -1) {
                                secondaryGrid.manualBatchChanges.changedRecords[index] = args.data;
                            } else {
                                secondaryGrid.manualBatchChanges.changedRecords.push(args.data);
                            }
                            console.log('🔄 Row Modified:', args.data);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
                        }

                        if (args.requestType === 'delete') {
                            // 🔥 TRACK DELETED ROW
                            secondaryGrid.manualBatchChanges.deletedRecords.push(args.data[0]);
                            console.log('❌ Row Deleted:', args.data[0]);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
                        }
                    }
                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            // 🔥 GET ALL BATCH CHANGES
            getBatchChanges: () => {
                return secondaryGrid.manualBatchChanges;
            },

            // 🔥 CLEAR BATCH CHANGES (after successful save)
            clearBatchChanges: () => {
                secondaryGrid.manualBatchChanges = {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };
                console.log('✅ Batch changes cleared');
            },

            refresh: () => {
                if (!secondaryGrid.obj) return;
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };

        // Modals
        const mainModal = {
            obj: null,
            create: () => {
                const mainModalEl = document.getElementById('MainModal');
                if (!mainModalEl) {
                    console.error('MainModal element not found in DOM');
                    return;
                }
                mainModal.obj = new bootstrap.Modal(mainModalEl, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        const customerModal = {
            obj: null,
            create: () => {
                const customerModalEl = document.getElementById('CustomerModal');
                if (!customerModalEl) {
                    console.error('CustomerModal element not found in DOM');
                    return;
                }
                customerModal.obj = new bootstrap.Modal(customerModalEl, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        // Lifecycle Hooks
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['SalesOrders']);
                await SecurityManager.validateToken();
                state.location = StorageManager.getLocation();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                customerModal.create();

                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateCustomerListLookupData();
                customerListLookup.create();
                await methods.populateTaxListLookupData();
                taxListLookup.create();
                await methods.populateSalesOrderStatusListLookupData();
                salesOrderStatusListLookup.create();
                orderDatePicker.create();
                numberText.create();
                await secondaryGrid.create(state.secondaryData);
                await methods.populateProductListLookupData();
                await methods.populateProductActivePriceLookupData();

            } catch (e) {
                console.error('Page initialization error:', e);
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
        });

        return {
            mainGridRef,
            mainModalRef,
            orderDateRef,
            numberRef,
            customerIdRef,
            taxIdRef,
            orderStatusRef,
            secondaryGridRef,
            customerGroupIdRef,
            customerCategoryIdRef,
            nameRef,
            CustomernumberRef,
            streetRef,
            cityRef,
            stateRef,
            zipCodeRef,
            countryRef,
            phoneNumberRef,
            faxNumberRef,
            emailAddressRef,
            websiteRef,
            whatsAppRef,
            linkedInRef,
            facebookRef,
            instagramRef,
            twitterXRef,
            tikTokRef,
            customerState,
            state,
            methods,
            handler: {
                handleSubmit: methods.handleFormSubmit,
                handleCustomerSubmit: methods.handleCustomerFormSubmit
            }
        };
    }
};

Vue.createApp(App).mount('#app');
