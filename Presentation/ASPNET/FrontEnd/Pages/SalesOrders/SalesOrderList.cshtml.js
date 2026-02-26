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
            // -----------------------------
            // Master / Header Data
            // -----------------------------
            mainData: [],
            deleteMode: false,
            mainTitle: '',
            id: '',
            number: '',
            orderDate: '',
            description: '',
            customerId: null,
            taxId: null,
            orderStatus: null,
            locationId: '',

            // -----------------------------
            // Lookups
            // -----------------------------
            customerListLookupData: [],
            taxListLookupData: [],
            salesOrderStatusListLookupData: [],
            productListLookupData: [],
            priceDefinitionListLookupData: [],
            discountDefinitionListLookupData: [],

            // -----------------------------
            // Detail / Grid
            // -----------------------------
            secondaryData: [],
            activeDetailRow: [],
            isAddMode: false,

            // -----------------------------
            // Calculation Totals (UI Display)
            // -----------------------------
            subTotalAmount: '0.00',     // Total of all items (before tax & discount)
            discountAmount: '0.00',     // Total discount applied
            taxAmount: '0.00',          // Calculated tax amount
            totalAmount: '0.00',        // Final payable amount

            // -----------------------------
            // Tax Context
            // -----------------------------
            selectedTaxRate: 0,         // e.g. 5, 12, 18

            // -----------------------------
            // UI / Validation
            // -----------------------------
            showComplexDiv: false,
            isSubmitting: false,
            errors: {
                orderDate: '',
                customerId: '',
                taxId: '',
                orderStatus: '',
                description: ''
            }
        });

        // 🔥 Wrap SignalR init in a check to prevent script crashes
        let connection = null;
        if (typeof signalR !== 'undefined') {
            connection = new signalR.HubConnectionBuilder()
                .withUrl("/ApprovalHub")
                .withAutomaticReconnect()
                .build();
            // 1. Listen for the response from the Hub
            if (connection) {
                connection.on("DiscountApproved", (data) => {
                    debugger;
                    // Find the specific row in the grid using PLU and ProductId
                    const gridData = secondaryGrid.obj.dataSource;
                    const row = gridData.find(r => r.pluCode === data.pluCode && r.productId === data.productId);
                    if (row) {
                        row.approvalStatus = data.status; // "Approved" or "Rejected"
                        row.approvalComments = data.comments;
                        row.approverName = data.approvedBy;

                        // If rejected, reset upToDiscount to 0 or max allowed without approval
                        if (data.status === 'Rejected') {
                            row.upToDiscount = 0; // Or set to currentUserLimit if needed
                            Swal.fire({
                                icon: 'error',
                                title: `Discount ${data.status}`,
                                text: `By: ${data.approvedBy}. Comments: ${data.comments}`,
                                timer: 3000
                            });
                        } else {
                            // For approved, the upToDiscount is already set, just update status
                            Swal.fire({
                                icon: 'success',
                                title: `Discount ${data.status}`,
                                text: `By: ${data.approvedBy}. Comments: ${data.comments}`,
                                timer: 3000
                            });
                        }

                        methods.calculateLiveTotals(); // Recalculate based on updated discount/status
                    }
                });
            }
        } else {
            console.error("❌ SignalR library not found. Please include the signalr.min.js script.");
        }
        // 3. Start Connection on Mount
        // In both Salesman and Manager JavaScript
        Vue.onMounted(async () => {
            try {
                await connection.start();
                const groupId = StorageManager.getUserGroupId();
                await connection.invoke("JoinGroup", groupId);
                console.log("✅ SignalR Connected. My Group ID:", groupId);
                console.log("✅ Connection ID:", connection.connectionId);
            } catch (err) {
                console.error("❌ SignalR Connection Error:", err);
            }
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
            //let currentSecondaryData = state.id !== ""
            //    ? [...state.secondaryData]
            //    : [];
            let currentSecondaryData = [...state.secondaryData];

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


                // --- 🔒 UPTO DISCOUNT APPROVAL CHECK ---
                // Check if an UpTo discount was entered
                const enteredUpTo = parseFloat(record.upToDiscount || 0);

                if (enteredUpTo > 0) {
                    // Block if status is not Approved or Auto-Approved
                    const isApproved = record.approvalStatus === 'Approved' || record.approvalStatus === 'Auto-Approved';

                    if (!isApproved) {
                        const status = record.approvalStatus || 'Pending';
                        state.errors.gridItems.push(`Row ${index + 1}: Discount (${enteredUpTo}%) status is "${status}". It must be Approved before submitting.`);
                        isValid = false;
                    }
                }
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
            //state.orderDate = '';
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
            state.discountAmount = '0.00'
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
                items,
                summaryTotals // 🔥 New parameter for totals
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
                        items,
                        // 🔥 Map individual summary fields to the payload
                        beforeTaxAmount: summaryTotals.beforeTaxAmount,
                        totalDiscountAmount: summaryTotals.totalDiscountAmount,
                        taxAmount: summaryTotals.taxAmount,
                        afterTaxAmount: summaryTotals.afterTaxAmount
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
                deletedItems,
                summaryTotals // 🔥 New parameter for totals
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
                        deletedItems,
                        // 🔥 Map individual summary fields to the payload
                        beforeTaxAmount: summaryTotals.beforeTaxAmount,
                        totalDiscountAmount: summaryTotals.totalDiscountAmount,
                        taxAmount: summaryTotals.taxAmount,
                        afterTaxAmount: summaryTotals.afterTaxAmount
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
                    const response = await AxiosManager.get('/Product/GetProductPriceDefinitionList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getDiscountDefinitionListLookupData: async () => {
                try {
                    const response = await AxiosManager.get(
                        '/Product/GetActiveProductDiscountDefinitionList',
                        {}
                    );
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
            GetProductStockByProductId: async ({ imei1, imei2, serviceNo }, productId) => {
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
            },
            //calculateSaleRate: (unitPrice, quantity, discountPercent, taxPercent) => {
            //    const discountPerUnit = (unitPrice * (discountPercent ?? 0)) / 100;
            //    const discountedRate = unitPrice - discountPerUnit;

            //    const taxPerUnit = (discountedRate * (taxPercent ?? 0)) / 100;
            //    const rateAfterTax = discountedRate + taxPerUnit;

            //    const totalAfterTax = rateAfterTax * (quantity ?? 1);

            //    return {
            //        discountPerUnit,
            //        discountedRate,
            //        taxPerUnit,
            //        rateAfterTax,
            //        totalAfterTax
            //    };
            //},
            calculateSaleRate: (unitPrice, taxPercent, quantity) => {
                //const discountPerUnit = (unitPrice * (discountPercent ?? 0)) / 100;
                //const discountedRate = unitPrice - discountPerUnit;

                const taxPerUnit = (unitPrice * (taxPercent ?? 0)) / 100;
                const rateAfterTax = unitPrice + taxPerUnit;

                const total = rateAfterTax * (quantity ?? 1);

                return {
                    taxPerUnit,
                    rateAfterTax,
                    total
                };
            },

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

                    if (!customerModal.obj) {
                        customerModal.create();
                    }

                    customerModal.obj.show();


                    const modalEl = document.getElementById("CustomerModal");

                    modalEl.addEventListener("hidden.bs.modal", () => {
                        const mainModal = document.getElementById("MainModal");
                        if (mainModal.classList.contains("show")) {
                            document.body.classList.add("modal-open");
                        }
                    });

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
            populateProductActivePriceLookupData: async () => {
                const response = await services.getpriceDefinitionListLookupData();
                state.priceDefinitionListLookupData = response?.data?.content?.data;
            },
            populateProductActiveDiscountLookupData: async () => {
                const response = await services.getDiscountDefinitionListLookupData();
                state.discountDefinitionListLookupData =
                    response?.data?.content?.data ?? [];
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
                let currentSecondaryData = [...state.secondaryData];
                const addedRecords = batchChanges.addedRecords || [];
                const changedRecords = batchChanges.changedRecords || [];

                const matchRecord = (a, b) => {
                    if (a.id && b.id) return a.id === b.id;
                    if (!a.id && !b.id) {
                        return a.productId === b.productId && a.pluCode === b.pluCode && a.unitPrice === b.unitPrice;
                    }
                    return false;
                };

                const filterFields = (item) => {
                    const { Attributes, errors } = methods.collectDetailAttributes(item);
                    if (errors.length > 0) throw new Error("ATTRIBUTE_VALIDATION_FAILED");

                    const qty = parseFloat(item.quantity || 0);
                    const price = parseFloat(item.unitPrice || 0);
                    const discPercent = parseFloat(item.discountPercentage || 0);
                    const discAmt = parseFloat(item.discountAmount || 0);
                    const taxPercent = parseFloat(item.taxId || 0);
                    const taxAmount = parseFloat(item.taxAmount || 0);
                    const totalAfterTax = parseFloat(item.totalAfterTax || 0);

                    item.__validatedAttributes = Attributes;

                    return {
                        id: item.id ?? null,
                        pluCode: Number(item.pluCode),
                        productId: item.productId,
                        unitPrice: price,
                        quantity: qty,
                        discountPercentage: discPercent,
                        discountAmount: discAmt,
                        // 🔥 ADDED APPROVAL FIELDS
                        upToDiscount: parseFloat(item.upToDiscount || 0),
                        approverGroupId: item.approverGroupId || null,
                        approvalStatus: item.approvalStatus || null,

                        grossAmount: qty * price,
                        taxPercent: taxPercent,
                        taxAmount: taxAmount,
                        totalAfterTax: totalAfterTax,
                        total: item.total ?? 0,
                        summary: item.summary ?? "",
                        detailEntries: item.__validatedAttributes ?? []
                    };
                };

                // Process records
                for (let changed of changedRecords) {
                    const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                    index !== -1 ? (currentSecondaryData[index] = { ...currentSecondaryData[index], ...filterFields(changed) })
                        : currentSecondaryData.push(filterFields(changed));
                }
                for (let added of addedRecords) {
                    const index = currentSecondaryData.findIndex(item => matchRecord(item, added));
                    index !== -1 ? (currentSecondaryData[index] = { ...currentSecondaryData[index], ...filterFields(added) })
                        : currentSecondaryData.push(filterFields(added));
                }

                let deletedRecords = (batchChanges.deletedRecords || []).flat(Infinity);
                if (deletedRecords.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item => !deletedRecords.some(del => matchRecord(item, del)));
                }

                const validItems = currentSecondaryData.filter(item => item.productId && item.pluCode?.toString().length >= 5 && item.quantity > 0);

                return { validItems, deletedRecords };
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
                    let SecondaryDataresult;

                    try {
                        SecondaryDataresult = methods.prepareSecondaryDataForSubmission();
                    } catch (e) {
                        if (e.message === "ATTRIBUTE_VALIDATION_FAILED") {
                            console.warn("Submission stopped due to validation error");
                            Swal.fire({
                                icon: "error",
                                title: "Validation Failed",
                                html: "Submission stopped due to Attributes validation error"
                            });
                            return;
                        }
                        throw e;
                    }

                    const { validItems, deletedRecords } = SecondaryDataresult;
                    let response;

                    // ----------------------------------------------------
                    // Build Items DTO with Discount & Gross Amounts
                    // ----------------------------------------------------
                    const itemsDto = validItems.map(item => ({
                        Id: item.id || null,
                        pluCode: Number(item.pluCode),
                        productId: item.productId,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        discountPercentage: Number(item.discountPercentage || 0),
                        discountAmount: Number(item.discountAmount || 0),

                        // 🔥 NEW FIELDS FOR BACKEND DTO
                        upToDiscount: Number(item.upToDiscount || 0),
                        approverGroupId: item.approverGroupId,
                        approvalStatus: item.approvalStatus,

                        grossAmount: Number(item.unitPrice || 0) * Number(item.quantity || 0),
                        taxId: item.taxId,
                        taxAmount: Number(item.taxAmount || 0),
                        totalAfterTax: Number(item.totalAfterTax),
                        total: item.total,
                        summary: item.summary,
                        Attributes: item.detailEntries,
                    }));
                    // ----------------------------------------------------
                    // Order-Level Summary Totals (Formatted for API)
                    // ----------------------------------------------------
                    // We strip commas from formatted strings before converting to numbers
                    const summaryTotals = {
                        beforeTaxAmount: parseFloat(state.subTotalAmount.replace(/,/g, '')), // Gross Total
                        totalDiscountAmount: parseFloat(state.discountAmount.replace(/,/g, '')),
                        taxAmount: parseFloat(state.taxAmount.replace(/,/g, '')),
                        afterTaxAmount: parseFloat(state.totalAmount.replace(/,/g, ''))     // Net Total
                    };

                    // -----------------------------
                    // CREATE NEW SALES ORDER
                    // -----------------------------
                    if (state.id === '') {
                        response = await services.createMainData(
                            state.orderDate,
                            state.description,
                            state.orderStatus,
                            null,
                            state.customerId,
                            userId,
                            itemsDto,
                            summaryTotals // ✔ Pass calculated totals to the service
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
                            null,
                            state.customerId,
                            userId,
                            itemsDto,
                            deletedItemsDto,
                            summaryTotals // ✔ Pass calculated totals to the service
                        );
                    }

                    // -----------------------------
                    // HANDLE SUCCESS RESPONSE
                    // -----------------------------
                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            await methods.populateSecondaryData(state.id);
                            secondaryGrid.refresh();

                            state.mainTitle = 'Edit Sales Order';
                            state.showComplexDiv = true;

                            Swal.fire({
                                icon: 'success',
                                title: 'Save Successful',
                                timer: 1200,
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
                // 9️⃣ Update Vue state
                state.subTotalAmount = 0;
                state.discountAmount = 0;
                state.taxAmount = 0;
                state.totalAmount = 0;
                secondaryGrid.clearBatchChanges();
            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
                }

            },
            openDetailModal: async (RowIndex) => {
                debugger;


                if (RowIndex === -1) {
                    console.error("Row not found for PO:", saleItemId);
                    return;
                }

                //state.currentDetailSaleItemId = saleItemId;
                state.currentDetailRowIndex = RowIndex;

                const originalRow = state.secondaryData[RowIndex];

                // -------------------------------------------------------
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
                const qty = parseFloat(rowData.quantity || 0);

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
                if (product.imei1) fields.push("imeI1");
                if (product.imei2) fields.push("imeI2");
                if (product.serviceNo) fields.push("serviceNo");

                const existingDetails = rowData.attributes || rowData.detailEntries || [];

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
                           data-field="${field.toLowerCase()}"
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

                await methods.attachDetailInputEvents(product);


                // -------------------------------------------------------
                // 7. OPEN MODAL
                // -------------------------------------------------------
                const modalEl = document.getElementById("detailModal");
                const modal = new bootstrap.Modal(modalEl);
                modal.show();

                // -------------------------------------------------------
                // 8. Save: Merge values back into original row
                // -------------------------------------------------------
                document.getElementById("detailSaveBtn").onclick = (e) => {
                    e.preventDefault();
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

            attachDetailInputEvents: async (product) => {

                // 🔥 Ensure styles exist
                methods.injectDetailStyles();

                const inputs = document.querySelectorAll(".detail-input");

                inputs.forEach(input => {

                    // ---------------------------
                    // KEYDOWN (restrict characters)
                    // ---------------------------
                    input.addEventListener("keydown", (e) => {
                        const field = input.dataset.field;
                        const key = e.key;

                        if (field === "IMEI1" || field === "IMEI2") {
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
                        await methods.handleDetailValueChange(input, product);
                    };

                    input.addEventListener("keyup", handler);
                    input.addEventListener("change", handler);
                });
            },

            handleDetailValueChange: async (input, product) => {
                const value = input.value.trim();
                const field = input.dataset.field;
                const index = parseInt(input.dataset.index, 10);

                // ---------------------------
                // IMEI VALIDATION
                // ---------------------------
                if (field.toLowerCase() === "imei1" || field.toLowerCase() === "imei2") {

                    if (value.length > 0 && value.length < 15) {
                        methods.showInlineError(input, `${field} must be 15 digits`);
                        return;
                    }

                    if (value.length === 15 && !/^\d{15}$/.test(value)) {
                        methods.showInlineError(input, `${field} must contain only digits`);
                        return;
                    }
                }

                if (!value) {
                    methods.clearInlineError(input);
                    return;
                }

                // ---------------------------
                // BUILD IDENTIFIER PAYLOAD
                // ---------------------------
                let imei1Value = '';
                let imei2Value = '';
                let serviceNoValue = '';

                if (field.toLowerCase() === "imei1") imei1Value = value;
                if (field.toLowerCase() === "imei2") imei2Value = value;
                if (field.toLowerCase() ===  "serviceno") serviceNoValue = value;

                
                try {
                    const response = await services.GetProductStockByProductId(
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

                    // ✅ EXACT MATCH (backend already filtered)
                    const matched = data.attributes[0];

                    // ---------------------------
                    // ENSURE STATE
                    // ---------------------------
                    if (!state.activeDetailRow.detailEntries) {
                        state.activeDetailRow.detailEntries = [];
                    }
                    if (!state.activeDetailRow.detailEntries[index]) {
                        state.activeDetailRow.detailEntries[index] = {};
                    }

                    // Save current value
                    state.activeDetailRow.detailEntries[index][field] = value;

                    // ---------------------------
                    // AUTO-BIND REMAINING FIELDS (NEW)
                    // ---------------------------
                    await methods.autoBindRemainingFieldsFromApi(
                        index,
                        matched,
                        field
                    );

                    methods.clearInlineError(input);

                    //document.getElementById("detailSaveBtn").onclick = () => {
                    //    methods.saveDetailEntries();
                    //    modal.hide();
                    //};


                } catch (error) {
                    console.error("❌ IMEI lookup failed:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to fetch product stock",
                        timer: 2000
                    });
                }
            },


            autoBindRemainingFieldsFromApi: async (index, matched, matchedField) => {

                const fieldMap = {
                    imeI1: matched.imeI1,
                    imeI2: matched.imeI2,
                    serviceNo: matched.serviceNo
                };

                Object.keys(fieldMap).forEach(field => {

                    if (field.toLowerCase() === matchedField.toLowerCase()) return;

                    const val = fieldMap[field];
                    if (!val) return;

                    //if (state.activeDetailRow.detailEntries[index][field]) return;

                    // Save to state
                    state.activeDetailRow.detailEntries[index][field] = val;

                    // Bind to UI
                    const input = document.querySelector(
                        `.detail-input[data-index="${index}"][data-field="${field.toLowerCase()}"]`
                    );

                    if (input) {
                        input.value = val;
                        //input.readOnly = true;
                        input.classList.add("auto-filled");
                    }
                });

                // Lock the entered field also
                const matchedInput = document.querySelector(
                    `.detail-input[data-index="${index}"][data-field="${matchedField.toLowerCase()}"]`
                );

                if (matchedInput) {
                    //matchedInput.readOnly = true;
                    matchedInput.classList.add("auto-filled");
                }
            },
            saveDetailEntries: async (item) => {
                //const poItemId = state.currentDetailPOItemId;
                //const rowIndex = state.secondaryData.findIndex(
                //    item => item.purchaseOrderItemId === poItemId
                //);

                //if (rowIndex === -1) {
                //    console.error("Cannot save — row not found");
                //    return;
                //}

                const rowIndex = state.currentDetailRowIndex;
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

                if (rowData.detailEntries.length !== rowData.quantity) {
                    Swal.fire({
                        icon: "error",
                        title: "Quantity not matching with Attributes length",
                        //    html: errors.join("<br>")
                    });
                    return;
                }
                secondaryGrid.refresh(state.secondaryData);

                console.log("Saved:", entries);
            },
            collectDetailAttributes: (row) => {
                const Attributes = [];
                const errors = [];


                const product = state.productListLookupData.find(p => p.id === row.productId);
                if (!product) {
                    errors.push(`Product not found for row with productId = ${row.productId}`);
                    return { Attributes, errors };
                }

                if (product.imei1 || product.imei2 || product.serviceNo) {
                    if (!row.detailEntries || row.detailEntries.length === 0) {
                        errors.push(`Please enter required product attributes (IMEI / Service No) for product`);
                        return { Attributes, errors };
                    }
                }
                // Local duplicates inside same GR item
                // -------------------------------
                const localIMEI1 = new Set();
                const localIMEI2 = new Set();
                const localServiceNo = new Set();

                // -------------------------------
                // Iterate detail rows
                // -------------------------------
                row.detailEntries.forEach((entry, index) => {
                    const imei1 = (entry.IMEI1 || entry.imeI1 || null).trim();
                    const imei2 = (entry.IMEI2 || entry.imeI2 || null).trim();
                    const serviceNo = (entry.ServiceNo || entry.serviceNo || null).trim();

                    // -------------------------------
                    // REQUIRED FIELD VALIDATION
                    // -------------------------------
                    if (product.imei1) {
                        if (!imei1) errors.push(`IMEI1 missing at row ${index + 1} for product ${row.productId}`);
                        else if (!/^\d{15}$/.test(imei1)) errors.push(`IMEI1 must be 15 digits at row ${index + 1}`);
                    }

                    if (product.imei2) {
                        if (!imei2) errors.push(`IMEI2 missing at row ${index + 1}`);
                        else if (!/^\d{15}$/.test(imei2)) errors.push(`IMEI2 must be 15 digits at row ${index + 1}`);
                    }

                    if (product.serviceNo) {
                        if (!serviceNo) errors.push(`Service No missing at row ${index + 1}`);
                    }

                    // -------------------------------
                    // IMEI1 != IMEI2 validation
                    // -------------------------------
                    if (product.imei1 && product.imei2) {
                        if (imei1 && imei2 && imei1 === imei2) {
                            errors.push(`IMEI1 and IMEI2 cannot be same at row ${index + 1}`);
                        }
                    }
                    if (product.imei1 && product.serviceNo) {
                        if (imei1 && serviceNo && imei1 === serviceNo) {
                            errors.push(`IMEI1 and ServiceNumber cannot be same at row ${index + 1}`);
                        }
                    }

                    if (product.imei2 && product.serviceNo) {
                        if (imei2 && serviceNo && imei2 === serviceNo) {
                            errors.push(`IMEI2 and ServiceNumber cannot be same at row ${index + 1}`);
                        }
                    }

                    // -------------------------------
                    // LOCAL DUPLICATE CHECK
                    // -------------------------------
                    if (imei1 && localIMEI1.has(imei1))
                        errors.push(`Duplicate IMEI1 (${imei1}) within same item at row ${index + 1}`);

                    if (imei2 && localIMEI2.has(imei2))
                        errors.push(`Duplicate IMEI2 (${imei2}) within same item at row ${index + 1}`);

                    if (serviceNo && localServiceNo.has(serviceNo))
                        errors.push(`Duplicate Service No (${serviceNo}) within same item at row ${index + 1}`);

                    localIMEI1.add(imei1);
                    localIMEI2.add(imei2);
                    localServiceNo.add(serviceNo);


                    // -------------------------------
                    // ADD TO RETURN PAYLOAD
                    // -------------------------------
                    Attributes.push({
                        RowIndex: index,
                        IMEI1: imei1,
                        IMEI2: imei2,
                        ServiceNo: serviceNo,
                    });
                });
                if (row.detailEntries.length !== row.quantity) {
                    errors.push("Received Quantity not matching with Attributes length");
                }

                return { Attributes, errors };
            },
            // Add this inside your 'methods' object
            calculateLiveTotals: async () => {
                const grid = secondaryGrid.obj;
                if (!grid) return;

                // 1️⃣ Base data
                let currentData = [...state.secondaryData];

                // 2️⃣ Batch changes
                const changes = secondaryGrid.getBatchChanges();
                const added = changes.addedRecords || [];
                const updated = changes.changedRecords || [];
                const deleted = changes.deletedRecords || [];

                // 3️⃣ Apply updates
                updated.forEach(upd => {
                    const idx = currentData.findIndex(item => item.id === upd.id);
                    if (idx !== -1) currentData[idx] = { ...currentData[idx], ...upd };
                });

                // check exist or not
                added.forEach(ad => {
                    const idx = currentData.findIndex(item => item.id === ad.id);
                    if (idx !== -1) currentData[idx] = { ...currentData[idx], ...ad };
                });

                // 4️⃣ Apply additions
                //currentData.push(...added);

                // 5️⃣ Apply deletions
                if (deleted.length > 0) {
                    currentData = currentData.filter(item =>
                        !deleted.some(del =>
                            (del.id && del.id === item.id) ||
                            (del.pluCode && del.pluCode === item.pluCode)
                        )
                    );
                }

                // 6️⃣ Calculate totals
                let totalGross = 0;      // Items total before discount
                let totalDiscount = 0;   // Total discount
                let totalAfterDiscount = 0; // Before tax
                let totalTaxAmount = 0;
               
                // Inside methods.calculateLiveTotals
                currentData.forEach(row => {
                    debugger;
                    const qty = parseFloat(row.quantity || 0);
                    const unitPrice = parseFloat(row.unitPrice || 0);
                    const gross = qty * unitPrice;

                    // Fetch active discount definitions for current product
                    const rowDiscounts = state.discountDefinitionListLookupData
                        ?.filter(x => x.productId === row.productId && x.isActive) ?? [];

                    // Sum the Percentages
                    const flatPercent = rowDiscounts
                        .filter(d => d.discountType === "Flat")
                        .reduce((sum, d) => sum + (d.discountPercentage || 0), 0);

                    const manualUpToPercent = parseFloat(row.upToDiscount || 0);
                    const combinedPercent = flatPercent + manualUpToPercent;

                    // Final Amounts
                    const rowDiscountAmt = (gross * combinedPercent) / 100;
                    const netAfterDiscount = gross - rowDiscountAmt;

                    totalGross += gross;
                    totalDiscount += rowDiscountAmt;
                    totalAfterDiscount += netAfterDiscount;
                    const taxPercent = taxObj?.value
                        ? (state.taxListLookupData.find(t => t.id === row.taxId)?.percentage || 0) : 0;

                    const calc = services.calculateSaleRate(netAfterDiscount, taxPercent, qty);
                    totalTaxAmount += calc.taxPerUnit;
                });
                // 7️⃣ Tax calculation
                //const taxRate = parseFloat(state.selectedTaxRate || 0); // e.g. 18
                //const taxAmount = (totalAfterDiscount * taxRate) / 100;

                // 8️⃣ Final payable
                const finalTotal = totalAfterDiscount + totalTaxAmount;

                // 9️⃣ Update Vue state
                state.subTotalAmount = NumberFormatManager.formatToLocale(totalGross);
                state.discountAmount = NumberFormatManager.formatToLocale(totalDiscount);
                state.taxAmount = NumberFormatManager.formatToLocale(totalTaxAmount);
                state.totalAmount = NumberFormatManager.formatToLocale(finalTotal);
            },
            // Inside methods object
            handleDiscountApproval: function (enteredVal, currentUserLimit, absoluteMax, details, rowData) {
                const currentUserGroupId = StorageManager.getUserGroupId();

                // Case 1: Within user's own limit
                if (enteredVal <= currentUserLimit) {
                    rowData.approvalStatus = "Auto-Approved";
                    rowData.approverGroupId = currentUserGroupId;
                    return { success: true, status: "Approved" };
                }

                // Case 2: Requires higher approval
                else if (enteredVal <= absoluteMax) {
                    // Find the lowest group that can approve this percentage
                    const higherGroup = details
                        .filter(d => d.maxPercentage >= enteredVal)
                        .sort((a, b) => a.maxPercentage - b.maxPercentage)[0];

                    rowData.approvalStatus = "Waiting Approval";
                    rowData.approverGroupId = higherGroup.userGroupId;

                    // 🔥 Trigger the SignalR Request
                    methods.sendImmediateApprovalRequest({
                        approverGroupId: higherGroup.userGroupId,
                        productId: rowData.productId,
                        productName: rowData.productName,
                        pluCode: rowData.pluCode,
                        quantity: rowData.quantity || 1, // Ensure quantity isn't null
                        percentage: enteredVal
                    });

                    Swal.fire({
                        icon: 'warning',
                        title: 'Waiting for Approval...',
                        text: `Percentage ${enteredVal}% requires approval from ${higherGroup.userGroupName}. A request has been sent.`,
                        showConfirmButton: false,
                        timer: 3500
                    });

                    return { success: true, status: "Waiting" };
                }

                // Case 3: Exceeds absolute system maximum
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Limit Exceeded',
                        text: `The absolute maximum allowed is ${absoluteMax}%.`,
                    });
                    return { success: false, status: "Blocked" };
                }
            },
            sendImmediateApprovalRequest: async function (data) {
                try {
                    // Ensure SignalR connection is active
                    if (connection && connection.state === signalR.HubConnectionState.Connected) {

                        // 1. Get the Current User's (Salesman) Group ID for the "Return Address"
                        const myGroupId = StorageManager.getUserGroupId();

                        // 2. Construct the DTO exactly as the Backend expects
                        const approvalDto = {
                            userGroupId: data.approverGroupId,      // The Manager's Group (Target)
                            requesterGroupId: myGroupId,           // The Salesman's Group (Source)
                            productId: data.productId,
                            pluCode: data.pluCode,
                            quantity: parseFloat(data.quantity),
                            // Note: If your backend DTO doesn't have 'percentage' or 'productName' yet, 
                            // they will be ignored, but it's good practice to send them.
                            productName: data.productName,
                            percentage: data.percentage
                        };

                        // 3. Invoke the Hub Method
                        await connection.invoke("RequestInstantApproval", approvalDto);

                        console.log("⚡ SignalR: Request sent to Group " + data.approverGroupId);
                    } else {
                        console.warn("SignalR not connected. Email might still trigger if handled via API.");
                    }
                } catch (err) {
                    console.error("SignalR Invoke Error:", err);
                    toast.error("Failed to send instant notification to managers.");
                }
            },
            updateRowStatus: function (productId, status) {
                // 1. Find the item in your local grid data array (replace 'gridData' with your actual variable)
                const item = gridData.find(row => row.productId === productId);

                if (item) {
                    // 2. Update the status and the visual indicator
                    item.approvalStatus = status; // e.g., "Approved" or "Rejected"

                    // 3. If you use a framework like Vue/React, the UI updates automatically.
                    // If you use DataTables, you need to redraw the row:
                    if ($.fn.DataTable.isDataTable('#salesGrid')) {
                        const table = $('#salesGrid').DataTable();
                        const row = table.row((idx, data) => data.productId === productId);

                        if (row.any()) {
                            const rowData = row.data();
                            rowData.approvalStatus = status;
                            row.data(rowData).draw(false);
                        }
                    }

                    console.log(`✅ Product ${productId} updated to status: ${status}`);
                }
            }
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
                        fields: {
                            value: 'id',
                            text: 'name'
                        },
                        placeholder: 'Select Tax',

                        change: async (e) => {
                            debugger;
                            // 1️⃣ Set Tax Id
                            state.taxId = e.value;

                            // 2️⃣ Find selected tax object
                            const selectedTax = state.taxListLookupData
                                .find(t => t.id === e.value);

                            // 3️⃣ Extract tax percentage (IMPORTANT FIX)
                            state.selectedTaxRate = Number(selectedTax?.percentage ?? 0);

                            // 4️⃣ Recalculate totals immediately
                            await methods.calculateLiveTotals();

                            // 5️⃣ Optional: Auto-save ONLY if user interacted
                            if (e.isInteracted && taxListLookup.trackingChange) {
                                // Comment this if you don’t want auto-save
                                // await methods.handleFormSubmit();
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
                const defaultDate = state.orderDate
                    ? new Date(state.orderDate)
                    : new Date();
                orderDatePicker.obj = new ej.calendars.DatePicker({
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false,
                    change: (e) => {
                        state.orderDate = e.value;
                    }
                });

                state.orderDate = defaultDate;

                orderDatePicker.obj.appendTo(orderDateRef.value);
            },
            refresh: () => {
                if (orderDatePicker.obj) {
                    const date = state.orderDate
                        ? new Date(state.orderDate)
                        : new Date();
                    state.orderDate = date;

                    orderDatePicker.obj.value = date;
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
        //Vue.watch(
        //    () => state.orderDate,
        //    (newVal, oldVal) => {
        //        orderDatePicker.refresh();
        //        state.errors.orderDate = '';
        //    }
        //);

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
                    //groupSettings: { columns: ['customerName'] },
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
                            state.isAddMode = true;

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
                            state.isAddMode = false;
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
                            state.isAddMode = false;
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
                            state.isAddMode = false;
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
        let gridObj;
       
        let isProgrammaticPriceUpdate = false;

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
                    created: function () {
                        gridObj = this;
                    },
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

                        //            inputElement.addEventListener('keydown', (e) => {
                        //                const key = e.key;
                        //                const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
                        //                    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

                        //                if (!isValidKey) {
                        //                    e.preventDefault();
                        //                    console.log('❌ Invalid character blocked:', key);
                        //                }
                        //            });

                        //            /* ===================== KEYUP ===================== */
                        //            inputElement.addEventListener('keyup', async () => {
                        //                const enteredPLU = inputElement.value?.trim() ?? "";

                        //                console.log('⬆️ KEYUP Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                        //                if (enteredPLU.length < 5) return;

                        //                try {
                        //                    const result = await services.getProductIdByPLU(enteredPLU);
                        //                    const productId = result?.data?.content?.productId;
                        //                    debugger
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
                        //                        const existingRow = GridData.find(r => r.productId === productId);

                        //                        if (existingRow && existingRow.pluCode === enteredPLU) {
                        //                            existingRow.quantity = (existingRow.quantity || 1) + 1;
                        //                            const price = existingRow.price || existingRow.unitPrice;
                        //                            existingRow.total = existingRow.quantity * price;
                        //                            gridObj.refresh();
                        //                            return;
                        //                        }
                        //                        else {
                        //                            const priceDef = state.priceDefinitionListLookupData
                        //                                ?.find(x => x.productId === productId && x.isActive);

                        //                            const selectedProduct =
                        //                                state.productListLookupData.find(
                        //                                    item => item.id === productObj.value
                        //                                );

                        //                            const finalPrice = priceDef
                        //                                ? priceDef.salePrice
                        //                                : selectedProduct.unitPrice;

                        //                            // 1. Get all active discounts for this product
                        //                            const discounts = state.discountDefinitionListLookupData
                        //                                ?.filter(x => x.productId === productId && x.isActive) ?? [];

                        //                            // 2. Identify if "Upto" exists to enable the field
                        //                            const isUpto = discounts.some(x => x.discountType === "Upto");

                        //                            // 3. Select the primary discount for auto-calc (Prefer Flat if auto-applying)
                        //                            const discountDef = discounts.find(x => x.discountType === "Flat")
                        //                                || discounts.find(x => x.discountType === "Upto");

                        //                            if (typeof upToDiscountObj !== 'undefined' && upToDiscountObj) {
                        //                                upToDiscountObj.enabled = isUpto;
                        //                            }
                        //                            // 🔥 UPTO DISCOUNT LOGIC END

                        //                            // ✅ FIXED: define discountAmount
                        //                            const discountAmount =
                        //                                discountDef
                        //                                    ? (finalPrice * (discountDef.discountPercentage || 0)) / 100
                        //                                    : 0;

                        //                            if (discountPercentObj) {
                        //                                discountPercentObj.value =
                        //                                    discountDef?.discountPercentage ?? 0;
                        //                            }

                        //                            if (discountAmountObj) {
                        //                                discountAmountObj.value = discountAmount;
                        //                            }

                        //                            if (quantityObj) {
                        //                                quantityObj.value = 1;
                        //                                const finalUnitPrice = finalPrice - discountAmount;
                        //                                const taxPercent =
                        //                                    state.taxListLookupData.find(t => t.id === taxObj?.value)?.percentage ?? 0;


                        //                                const calc = services.calculateSaleRate(finalUnitPrice, taxPercent, quantityObj.value = 1);

                        //                                if (quantityObj) {
                        //                                    quantityObj.value = 1;
                        //                                }
                        //                                if (taxAmountObj) {
                        //                                    taxAmountObj.value = calc.taxPerUnit;
                        //                                }
                        //                                if (totalAfterTaxObj) {
                        //                                    totalAfterTaxObj.value = calc.rateAfterTax;
                        //                                }
                        //                                if (totalObj) {
                        //                                    totalObj.value = calc.total;
                        //                                }
                        //                                //if (totalObj) {
                        //                                //    totalObj.value = finalPrice * quantityObj.value;
                        //                                //}

                        //                                // 🔥 DATA (THIS WAS MISSING)
                        //                                args.rowData.taxAmount = calc.taxPerUnit;
                        //                                args.rowData.totalAfterTax = calc.rateAfterTax;
                        //                                args.rowData.total = calc.total;
                        //                            }
                        //                        }
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

                        //            /* ===================== CHANGE ===================== */
                        //            inputElement.addEventListener('change', async () => {
                        //                const enteredPLU = inputElement.value?.trim() ?? "";

                        //                console.log('📝 CHANGE Event - PLU:', enteredPLU);

                        //                if (enteredPLU.length < 5) return;

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
                        //                        const existingRow = GridData.find(r => r.productId === productId);

                        //                        if (existingRow && existingRow.pluCode === enteredPLU) {
                        //                            existingRow.quantity = (existingRow.quantity || 1) + 1;
                        //                            const price = existingRow.price || existingRow.unitPrice;
                        //                            existingRow.total = existingRow.quantity * price;
                        //                            gridObj.refresh();
                        //                            return;
                        //                        }
                        //                        else {
                        //                            const priceDef = state.priceDefinitionListLookupData
                        //                                ?.find(x => x.productId === productId && x.isActive);

                        //                            const selectedProduct =
                        //                                state.productListLookupData.find(
                        //                                    item => item.id === productObj.value
                        //                                );

                        //                            // ✅ FIXED: product → selectedProduct
                        //                            const salePrice = priceDef
                        //                                ? priceDef.salePrice
                        //                                : selectedProduct.unitPrice;

                        //                            const discountDef =
                        //                                state.discountDefinitionListLookupData
                        //                                    ?.find(x => x.productId === productId && x.isActive);

                        //                            const discountAmount = discountDef ? (salePrice * (discountDef.discountPercentage || 0)) / 100 : 0;                                                    // ✅ FIXED: single finalPrice
                        //                            const finalPrice = salePrice - discountAmount;
                        //                            const taxPercent =
                        //                                state.taxListLookupData.find(t => t.id === taxObj?.value)?.percentage ?? 0;

                        //                            const calc = services.calculateSaleRate(finalPrice,  taxPercent, qty = 1);

                        //                            if (quantityObj) {
                        //                                quantityObj.value = 1;
                        //                            }
                        //                            if (taxAmountObj) {
                        //                                taxAmountObj.value = calc.taxPerUnit;
                        //                            }
                        //                            if (totalAfterTaxObj) {
                        //                                totalAfterTaxObj.value = calc.rateAfterTax;
                        //                            }
                        //                            if (totalObj) {
                        //                                totalObj.value = calc.total;
                        //                            }
                        //                            // 🔥 DATA (THIS WAS MISSING)
                        //                            args.rowData.taxAmount = calc.taxPerUnit;
                        //                            args.rowData.totalAfterTax = calc.rateAfterTax;
                        //                            args.rowData.total = calc.total;

                        //                        }
                        //                    }

                        //                } catch (error) {
                        //                    console.error('❌ CHANGE Error:', error);
                        //                    Swal.fire({
                        //                        icon: 'error',
                        //                        title: 'Error',
                        //                        text: 'Failed to fetch product details',
                        //                        timer: 2000
                        //                    });
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
                                        const priceDef = state.priceDefinitionListLookupData
                                            ?.find(x => x.productId === productId && x.isActive);
                                        const salePrice = priceDef ? priceDef.salePrice : (product?.unitPrice ?? 0);

                                        const discounts = state.discountDefinitionListLookupData
                                            ?.filter(x => x.productId === productId && x.isActive) ?? [];
                                        const flatDef = discounts.find(d => d.discountType === "Flat");
                                        const isUpto = discounts.some(d => d.discountType === "Upto");
                                        const discountPct = flatDef?.discountPercentage ?? 0;
                                        const discountAmt = (salePrice * discountPct) / 100;
                                        const netPrice = salePrice - discountAmt;

                                        const taxPercent = state.taxListLookupData
                                            .find(t => t.id === taxObj?.value)?.percentage ?? 0;
                                        const calc = services.calculateSaleRate(netPrice, taxPercent, qty);

                                        if (productObj) { productObj.value = productId; productObj.dataBind(); }
                                        if (priceObj) priceObj.value = salePrice;
                                        if (discountPercentObj) discountPercentObj.value = discountPct;
                                        if (discountAmountObj) discountAmountObj.value = discountAmt;
                                        if (quantityObj) quantityObj.value = qty;
                                        if (taxAmountObj) taxAmountObj.value = calc.taxPerUnit;
                                        if (totalAfterTaxObj) totalAfterTaxObj.value = calc.rateAfterTax;
                                        if (totalObj) totalObj.value = calc.total;
                                        if (typeof upToDiscountObj !== 'undefined' && upToDiscountObj)
                                            upToDiscountObj.enabled = isUpto;
                                        if (summaryObj) summaryObj.value = product?.description ?? "";
                                        if (numberObj) numberObj.value = product?.number ?? "";
                                        if (taxObj && product?.taxId) taxObj.value = product.taxId;

                                        args.rowData.productId = productId;
                                        args.rowData.unitPrice = salePrice;
                                        args.rowData.discountPercentage = discountPct;
                                        args.rowData.discountAmount = discountAmt;
                                        args.rowData.quantity = qty;
                                        args.rowData.taxAmount = calc.taxPerUnit;
                                        args.rowData.totalAfterTax = calc.rateAfterTax;
                                        args.rowData.total = calc.total;
                                        args.rowData.summary = product?.description ?? "";
                                        args.rowData.productNumber = product?.number ?? "";
                                        args.rowData.taxId = product?.taxId;
                                    };

                                    // ── HELPER B: Recalculate persisted row data ─────────────
                                    const recalcRowData = (rowData, productId, newQty) => {
                                        const priceDef = state.priceDefinitionListLookupData
                                            ?.find(x => x.productId === productId && x.isActive);
                                        const salePrice = priceDef ? priceDef.salePrice : (rowData.unitPrice ?? 0);
                                        const discounts = state.discountDefinitionListLookupData
                                            ?.filter(x => x.productId === productId && x.isActive) ?? [];
                                        const flatDef = discounts.find(d => d.discountType === "Flat");
                                        const discountPct = flatDef?.discountPercentage ?? rowData.discountPercentage ?? 0;
                                        const discountAmt = (salePrice * discountPct) / 100;
                                        const netPrice = salePrice - discountAmt;
                                        const taxPercent = state.taxListLookupData
                                            .find(t => t.id === (taxObj?.value ?? rowData.taxId))?.percentage ?? 0;
                                        const calc = services.calculateSaleRate(netPrice, taxPercent, newQty);

                                        rowData.quantity = newQty;
                                        rowData.unitPrice = salePrice;
                                        rowData.discountPercentage = discountPct;
                                        rowData.discountAmount = discountAmt;
                                        rowData.taxAmount = calc.taxPerUnit;
                                        rowData.totalAfterTax = calc.rateAfterTax;
                                        rowData.total = calc.total;
                                    };

                                    // ── HELPER C: Open attribute modal + auto-add next row ───
                                    const openAttributeModalWithAutoNext = async (rowData) => {
                                        let rowIndex = state.secondaryData
                                            .findIndex(r => r === rowData || (r.id && r.id === rowData.id));
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

                                                const newQty = (parseFloat(duplicateRow.quantity) || 1) + 1;
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
                                                methods.calculateLiveTotals();

                                                console.log(`✅ Duplicate PLU "${enteredPLU}" → qty = ${newQty}`);

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
                                                // This explicitly fixes the "need to click outside" issue.
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
                                                    }, 400); // Increased slightly to 400ms for safety
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
                                            debugger;
                                            const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
                                            if (!selectedProduct) return;

                                            args.rowData.productId = selectedProduct.id;

                                            if (numberObj) numberObj.value = selectedProduct.number;

                                            const priceDef = state.priceDefinitionListLookupData
                                                ?.find(x => x.productId === selectedProduct.id && x.isActive);

                                            const finalPrice = priceDef ? priceDef.salePrice : selectedProduct.unitPrice;

                                            if (priceObj) priceObj.value = finalPrice;
                                            if (taxObj) taxObj.value = selectedProduct.taxId;

                                            if (summaryObj) summaryObj.value = selectedProduct.description;

                                            //if (quantityObj) {
                                            //    quantityObj.value = 1;
                                            //    if (totalObj) totalObj.value = finalPrice * quantityObj.value;
                                            //}                                            
                                        }
                                    });

                                    productObj.appendTo(args.element);
                                }
                            }
                        },
                         {
                            field: 'unitPrice',
                            headerText: 'Rate',
                            width: 200, validationRules: { required: true },
                            allowEditing: false,
                            disableHtmlEncode: false,
                           type: 'number', format: 'N2', textAlign: 'Right',
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
                                        //change: (e) => {
                                        //    if (quantityObj && totalObj) {
                                        //        const total = e.value * quantityObj.value;
                                        //        totalObj.value = total;
                                        //    }
                                        //}
                                        change: (e) => {
                                            const unitPrice = e.value ?? 0;
                                            const qty = quantityObj?.value ?? 1;
                                            const Gross = unitPrice * qty;
                                            const discount = discountPercentObj?.value ?? 0;

                                            const taxPercent =
                                                state.taxListLookupData.find(t => t.id === taxObj?.value)?.percentage ?? 0;

                                            const discountAmount = Gross * (discount || 0) / 100 ?? 0;                                                    // ✅ FIXED: single finalPrice
                                            const finalPrice = Gross - discountAmount;
                                            const calc = services.calculateSaleRate(finalPrice, taxPercent, qty);
                                            discountAmountObj &&( discountAmountObj.value = discountAmount);
                                            taxAmountObj && (taxAmountObj.value = calc.taxPerUnit);
                                            totalAfterTaxObj && (totalAfterTaxObj.value = calc.rateAfterTax);
                                            totalObj && (totalObj.value = calc.total);

                                            // 🔥 DATA (THIS WAS MISSING)
                                            args.rowData.discountAmount = discountAmount;
                                            args.rowData.taxAmount = calc.taxPerUnit;
                                            args.rowData.totalAfterTax = calc.rateAfterTax;
                                            args.rowData.total = calc.total;
                                        }
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'discountPercentage',
                            headerText: 'Discount %',
                            width: 120,
                            type: 'number',
                            format: 'N0',
                            textAlign: 'Right',
                            allowEditing: false,
                            disableHtmlEncode: false,
                            edit: {
                                create: () => {
                                    return document.createElement('input');
                                },
                                read: () => {
                                    return discountPercentObj.value;
                                },
                                destroy: () => {
                                    discountPercentObj.destroy();
                                },
                                write: (args) => {
                                    discountPercentObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.discountPercentage ?? 0,
                                        min: 0,
                                        max: 100,
                                        format: 'n0',
                                        decimals: 0, //  FORCE INTEGER
                                        readonly: true, //  Enforce Read-Only
                                       
                                        change: (e) => {
                                            if (priceObj && quantityObj && discountAmountObj) {
                                                const gross = priceObj.value * quantityObj.value;
                                                const discountAmt = (gross * e.value) / 100;
                                                discountAmountObj.value = discountAmt;
                                            }
                                            const discount = e.value ?? 0;
                                            const unitPrice = priceObj?.value ?? 0;
                                            const qty = quantityObj?.value ?? 1;
                                            const gross = unitPrice * qty;
                                            const taxPercent =
                                                state.taxListLookupData.find(t => t.id === taxObj?.value)?.percentage ?? 0;
                                            const discountAmt = (gross * discount) / 100;

                                            const finalPrice = gross - discountAmt

                                            const calc = services.calculateSaleRate(finalPrice, taxPercent,qty);


                                            taxAmountObj && (taxAmountObj.value = calc.taxPerUnit);
                                            totalAfterTaxObj && (totalAfterTaxObj.value = calc.rateAfterTax);
                                            totalObj && (totalObj.value = calc.total);

                                            //  DATA (THIS WAS MISSING)
                                            args.rowData.taxAmount = calc.taxPerUnit;
                                            args.rowData.totalAfterTax = calc.rateAfterTax;
                                            args.rowData.total = calc.total;
                                        }

                                    });

                                    discountPercentObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'upToDiscount',
                            headerText: 'Up To % Discount',
                            width: 140,
                            type: 'number',
                            format: 'N0',
                            textAlign: 'Right',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => upToDiscountObj.value,
                                destroy: () => upToDiscountObj.destroy(),
                                write: (args) => {
                                    debugger;
                                    const currentUserGroupId = StorageManager.getUserGroupId();
                                    const discountDef = state.discountDefinitionListLookupData
                                        ?.find(x => x.productId === args.rowData.productId && x.isActive && x.discountType === "Upto");

                                    const isUptoType = !!discountDef;
                                    const details = discountDef?.productDiscountDetails || [];
                                    const currentUserLimit = details.find(d => d.userGroupId === currentUserGroupId)?.maxPercentage ?? 0;
                                    const absoluteMax = details.length > 0 ? Math.max(...details.map(d => d.maxPercentage)) : 0;
                                    const flatDef = state.discountDefinitionListLookupData
                                        ?.find(x => x.productId === args.rowData.productId && x.isActive && x.discountType === "Flat");

                                    upToDiscountObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.upToDiscount ?? 0,
                                        min: 0,
                                        max: 100,
                                        format: 'n0',
                                        decimals: 0,
                                        enabled: isUptoType,
                                        change: (e) => {
                                            const enteredVal = e.value || 0;
                                            debugger;
                                            //  Call the new approval function
                                            const result = methods.handleDiscountApproval(
                                                enteredVal,
                                                currentUserLimit,
                                                absoluteMax,
                                                details,
                                                args.rowData
                                            );

                                            if (result.reset) {
                                                upToDiscountObj.value = 0;
                                                processCalculations(0);
                                            } else {
                                                processCalculations(enteredVal);
                                            }
                                        }
                                    });

                                    function processCalculations(val) {
                                        if (priceObj && quantityObj && totalObj && discountAmountObj) {
                                            const qty = quantityObj.value || 0;
                                            const price = priceObj.value || 0;
                                            const gross = qty * price;
                                            const flatPercent = flatDef ? (flatDef.discountPercentage || 0) : 0;
                                            const totalDiscountAmt = (gross * (flatPercent + val)) / 100;
                                            const finalPrice = gross - totalDiscountAmt
                                            const taxPercent = taxObj?.value
                                                ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
                                                : 0;
                                            const calc = services.calculateSaleRate(finalPrice, taxPercent, qty);


                                            taxAmountObj && (taxAmountObj.value = calc.taxPerUnit);
                                            totalAfterTaxObj && (totalAfterTaxObj.value = calc.rateAfterTax);
                                            totalObj && (totalObj.value = calc.total);
                                            discountAmountObj.value = totalDiscountAmt;

                                        //    totalObj.value = gross - totalDiscountAmt;
                                        }
                                        methods.calculateLiveTotals();
                                    }

                                    upToDiscountObj.appendTo(args.element);
                                }
                            }
                        }, {
                            field: 'quantity',
                            headerText: 'Quantity',
                            width: 200,
                            validationRules: {
                                required: true,
                                custom: [
                                    (args) => args['value'] > 0,
                                    'Must be a positive number and not zero'
                                ]
                            },
                            type: 'number',
                            format: 'N0',
                            textAlign: 'Right',

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
                                        format: 'n0',
                                        decimals: 0, // FORCE INTEGER
                                        change: (e) => {
                                            if (!priceObj || !totalObj) return;

                                            const qty = e.value || 0;
                                            const price = priceObj.value || 0;

                                            // 🔹 gross amount
                                            const grossAmount = qty * price;

                                            // 🔹 discount %
                                            const discountPercent =
                                                discountPercentObj?.value ?? 0;

                                            // 🔹 discount amount
                                            const discountAmount =
                                                (grossAmount * discountPercent) / 100;

                                            if (discountAmountObj) {
                                                discountAmountObj.value = discountAmount;
                                            }
                                            //const discountAmountPerUnit = (price * (discountPercent || 0)) / 100 ;                                                    // ✅ FIXED: single finalPrice
                                            //const finalPrice = price - discountAmountPerUnit;
                                            const finalPrice = grossAmount - discountAmount;
                                            const taxPercent = taxObj?.value
                                                ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
                                                : 0;
                                            const calc = services.calculateSaleRate(finalPrice, taxPercent, qty);

                                           
                                            if (taxAmountObj) {
                                                taxAmountObj.value = calc.taxPerUnit;
                                            }
                                            if (totalAfterTaxObj) {
                                                totalAfterTaxObj.value = calc.rateAfterTax;
                                            }
                                            if (totalObj) {
                                                totalObj.value = calc.total;
                                            }
                                            //  DATA (THIS WAS MISSING)
                                            args.rowData.taxAmount = calc.taxPerUnit;
                                            args.rowData.totalAfterTax = calc.rateAfterTax;
                                            args.rowData.total = calc.total;
                                            // 🔹 net total
                                        //    totalObj.value = grossAmount - discountAmount;
                                        }
                                    });

                                    quantityObj.appendTo(args.element);
                                }
                            }
                        }, 
                        // =========================
                        // DISCOUNT AMOUNT
                        // =========================
                        {
                            field: 'discountAmount',
                            headerText: 'Discount Amount',
                            width: 140,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            allowEditing: false,
                            disableHtmlEncode: false,
                            edit: {
                                create: () => {
                                    return document.createElement('input');
                                },
                                read: () => {
                                    return discountAmountObj.value;
                                },
                                destroy: () => {
                                    discountAmountObj.destroy();
                                },
                                write: (args) => {
                                    discountAmountObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.discountAmount ?? 0,
                                        format: 'N2',
                                        readonly: true, //  Enforce Read-Only
                                    });

                                    discountAmountObj.appendTo(args.element);
                                }
                            }
                        },


                        {
                            field: 'taxId',
                            headerText: 'Tax',
                            width: 120,
                            editType: 'dropdownedit',
                            valueAccessor: (field, data) => {
                                debugger;
                                const tax = state.taxListLookupData.find(t => t.id === data[field]);
                                return tax ? `${tax.name} (${tax.percentage}%)` : '';
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => taxObj?.value,
                                destroy: () => taxObj?.destroy(),
                                write: (args) => {
                                    debugger;
                                    taxObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.taxListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.taxId ?? 0,
                                        placeholder: 'Select Tax',
                                        readonly: true

                                        //change: (e) => {
                                        //    const taxPercent =
                                        //        state.taxListLookupData.find(t => t.id === e.value)?.percentage ?? 0;

                                        //    const unitPrice = priceObj?.value ?? 0;
                                        //    const qty = quantityObj?.value ?? 1;
                                        //    const discount = discountPercentObj?.value ?? 0;

                                        //    const calc = services.calculatesalerate(unitprice, taxpercent, qty);

                                        //    args.rowData.taxId = e.value;
                                        //    args.rowData.taxAmount = calc.taxPerUnit;
                                        //    args.rowData.totalAfterTax = calc.rateAfterTax;
                                        //    args.rowData.total = calc.totalAfterTax;

                                        //    taxAmountObj && (taxAmountObj.value = calc.taxPerUnit);
                                        //    totalAfterTaxObj && (totalAfterTaxObj.value = calc.rateAfterTax);
                                        //    totalObj && (totalObj.value = calc.totalAfterTax);
                                        //}

                                    });

                                    taxObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'taxAmount',
                            headerText: 'Tax Amount',
                            width: 150,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            allowEditing: false,
                            disableHtmlEncode: false,
                            edit: {
                                create: () => {
                                    let taxAmtElement = document.createElement('input');
                                    return taxAmtElement;
                                },
                                read: () => taxAmountObj?.value ?? 0,

                                destroy: () => { debugger; taxAmountObj?.destroy() },
                                
                                 write: (args) => {
                                     taxAmountObj = new ej.inputs.NumericTextBox({
                                         value: args.rowData.taxAmount ?? 0,
                                        format: 'n2',
                                        decimals: 2, //  FORCE INTEGER
                                         readonly: true
                                    });

                                     taxAmountObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'totalAfterTax',
                            headerText: 'Rate After Tax',
                            width: 150,
                            type: 'number', format: 'N2', textAlign: 'Right',
                            allowEditing: false,
                            disableHtmlEncode: false,
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => totalAfterTaxObj?.value ?? 0,
                                destroy: () => totalAfterTaxObj?.destroy(),
                                write: (args) => {
                                    totalAfterTaxObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.totalAfterTax ?? 0,
                                        format: 'N2',
                                        decimals: 2, // FORCE INTEGER
                                        readonly: true


                                    });
                                    totalAfterTaxObj.appendTo(args.element);
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
        <a href="#" class="view-details" data-id="${data?.purchaseOrderItemId}">
            Attributes
        </a>
    `;
                            },
                            // Needed to allow HTML inside cell
                            allowEditing: false
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
                                read: () => totalObj?.value ?? 0,
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
                    dataBound: () => {  },
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
                    
                    // UNCOMMENTED AND IMPLEMENTED actionComplete
                    actionComplete: async (args) => {
                        if (args.requestType === 'save' && args.action === 'add') {
                            //  TRACK ADDED ROW
                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
                            console.log('✅ Row Added:', args.data);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
                        }

                        if (args.requestType === 'save' && args.action === 'edit') {
                            //  TRACK MODIFIED ROW (update if exists, else add)
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
                        // Recalculate whenever a row is added, saved, or deleted
                        if (args.requestType === 'save' || args.requestType === 'delete' || args.requestType === 'add') {
                            methods.calculateLiveTotals();
                        }
                    },
                    queryCellInfo: (args) => {
                        if (args.column.field === 'details') {
                            debugger;
                            const link = args.cell.querySelector('.view-details');

                            if (link) {
                                link.addEventListener('click', (e) => {
                                    debugger;
                                    e.preventDefault();
                                    
                                    //            const rowIndex = args.element.closest('.e-row').rowIndex;
                                    //            const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];
                                    //            const rowData = rowObj.changes ?? rowObj.data;
                                    //            const maxQty = parseFloat(rowData.remaingQuantity || 0);
                                    //            const val = parseFloat(args.value || 0);
                                    //            return val <= maxQty;
                                    //        }, 'Received Qty cannot exceed Remaining Qty']
                                    //const rowData = args.data;
                                    const rowIndex = e.currentTarget.closest('.e-row').rowIndex;
                                    const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];
                                    methods.openDetailModal(rowIndex);
                                });
                            }
                        }
                    },

                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            //  GET ALL BATCH CHANGES
            getBatchChanges: () => {
                return secondaryGrid.manualBatchChanges;
            },

            //  CLEAR BATCH CHANGES (after successful save)
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
            },
            destroy: () => {
                if(secondaryGrid.obj) {
                    secondaryGrid.obj.destroy();
                    secondaryGrid.obj = null;
                }
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
                await methods.populateProductActiveDiscountLookupData();
                
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);


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
