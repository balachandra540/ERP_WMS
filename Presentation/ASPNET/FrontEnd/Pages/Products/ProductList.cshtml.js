const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            productGroupListLookupData: [],
            AttributeListLookupData: [],
            unitMeasureListLookupData: [],
            taxListLookupData: [],

            mainTitle: null,

            // Form fields
            id: '',
            name: '',
            number: '',
            unitPrice: '',
            description: '',
            productGroupId: null,
            unitMeasureId: null,
            taxId: null,
            attribute1: null,      // ← Added (Attribute 1 dropdown)
            attribute2: null,      // ← Added (Attribute 2 dropdown)
            physical: false,
            serviceNo: false,      // ← Added
            IMEI1: false,          // ← Added (or rename to imei1 if you prefer lowercase)
            IMEI2: false,          // ← Added

            location: '',          // Warehouse ID / location

            // Validation errors
            errors: {
                name: '',
                unitPrice: '',
                productGroupId: '',
                unitMeasureId: '',
                taxId: '',             // ← Usually required, so keep error field
                attribute1: '',        // ← Optional: add if you want to validate
                attribute2: ''         // ← Optional: add if you want to validate
            },

            isSubmitting: false
        });
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const productGroupIdRef = Vue.ref(null);
        const unitMeasureIdRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const unitPriceRef = Vue.ref(null);
        const taxIdRef = Vue.ref(null);
        const attribute1Ref = Vue.ref(null);
        const attribute2Ref = Vue.ref(null);

        const validateForm = function () {
            // Reset all errors
            state.errors.name = '';
            state.errors.unitPrice = '';
            state.errors.productGroupId = '';
            state.errors.unitMeasureId = '';
            state.errors.taxId = '';
            state.errors.attribute1 = '';
            state.errors.attribute2 = '';

            let isValid = true;

            if (!state.name) {
                state.errors.name = 'Name is required.';
                isValid = false;
            }
            if (!state.unitPrice) {
                state.errors.unitPrice = 'Unit price is required.';
                isValid = false;
            } else if (!/^\d+(\.\d{1,2})?$/.test(state.unitPrice)) {
                state.errors.unitPrice = 'Unit price must be a numeric value with up to two decimal places.';
                isValid = false;
            }
            if (!state.productGroupId) {
                state.errors.productGroupId = 'Product Group is required.';
                isValid = false;
            }
            if (!state.unitMeasureId) {
                state.errors.unitMeasureId = 'Unit Measure is required.';
                isValid = false;
            }
            if (!state.taxId) {
                state.errors.taxId = 'Tax is required.';
                isValid = false;
            }

            // NEW: Attribute1 and Attribute2 cannot be the same
            if (state.attribute1 && state.attribute2 && state.attribute1 === state.attribute2) {
                state.errors.attribute1 = 'Attribute 1 and Attribute 2 cannot be the same.';
                state.errors.attribute2 = 'Cannot select the same attribute twice.';
                isValid = false;
            }

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.name = '';
            state.number = '';
            state.unitPrice = '';
            state.description = '';
            state.productGroupId = null;
            state.unitMeasureId = null;
            state.physical = false;
            state.serviceNo = false;
            state.IMEI1 = false;
            state.IMEI2 = false;
            state.taxId = null;
            state.attribute1 = null;
            state.attribute2 = null;
            state.errors = {
                name: '',
                unitPrice: '',
                taxId: '',
                productGroupId: '',
                unitMeasureId: '',
                attribute1: '',
                attribute2: ''
            };
        };
        const services = {
            getMainData: async () => {
                try {
                    const warehouseId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Product/GetProductList?warehouseId=' + warehouseId, {});
                        
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (name, unitPrice, physical, description, productGroupId, unitMeasureId, createdById, warehouseId, taxId, attribute1, attribute2, serviceNo, IMEI1, IMEI2) => {
                try {
                    const response = await AxiosManager.post('/Product/CreateProduct', {
                        name, unitPrice, physical, description, productGroupId, unitMeasureId,
                        createdById, warehouseId, taxId,
                        attribute1Id: attribute1,     // ← matches backend Attribute1Id
                        attribute2Id: attribute2,     // ← matches backend Attribute2Id
                        serviceNo, IMEI1, IMEI2
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, name, unitPrice, physical, description, productGroupId, unitMeasureId, updatedById, warehouseId, taxId, attribute1, attribute2, serviceNo, IMEI1, IMEI2) => {
                try {
                    const response = await AxiosManager.post('/Product/UpdateProduct', {
                        id,
                        name,
                        unitPrice,
                        physical,
                        description,
                        productGroupId,
                        unitMeasureId,
                        updatedById,
                        warehouseId,
                        taxId,
                        attribute1Id: attribute1,
                        attribute2Id: attribute2,

                        serviceNo,
                        imei1: IMEI1,   // <-- backend expects "Imei1"
                        imei2: IMEI2    // <-- backend expects "Imei2"
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Product/DeleteProduct', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductGroupListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/ProductGroup/GetProductGroupList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getAttributeListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Attribute/GetAttributeList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getUnitMeasureListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/UnitMeasure/GetUnitMeasureList', {});
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
        };

        const methods = {
            populateProductGroupListLookupData: async () => {
                const response = await services.getProductGroupListLookupData();
                state.productGroupListLookupData = response?.data?.content?.data;
            },
            populateAttributeListLookupData: async () => {
                const response = await services.getAttributeListLookupData();
                state.AttributeListLookupData = response?.data?.content?.data;
            },
            populateUnitMeasureListLookupData: async () => {
                const response = await services.getUnitMeasureListLookupData();
                state.unitMeasureListLookupData = response?.data?.content?.data;
            },
            populateTaxListLookupData: async () => {
                const response = await services.getTaxListLookupData();
                state.taxListLookupData = response?.data?.content?.data;
            },
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
        };

        const productGroupListLookup = {
            obj: null,
            create: () => {
                if (state.productGroupListLookupData && Array.isArray(state.productGroupListLookupData)) {
                    productGroupListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.productGroupListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Product Group',
                        popupHeight: '200px',
                        change: (e) => {
                            state.productGroupId = e.value;
                        }
                    });
                    productGroupListLookup.obj.appendTo(productGroupIdRef.value);
                } else {
                    console.error('ProductGroup list lookup data is not available or invalid.');
                }
            },
            refresh: () => {
                if (productGroupListLookup.obj) {
                    productGroupListLookup.obj.value = state.productGroupId;
                }
            },
        };
        const Attribute1ListLookup = {
            obj: null,
            create: () => {
                if (state.AttributeListLookupData && Array.isArray(state.AttributeListLookupData)) {
                    Attribute1ListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.AttributeListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Attribute 1 (Optional)',
                        popupHeight: '200px',
                        change: (e) => {
                            state.attribute1 = e.value;

                            // If user picks the same as Attribute2 → auto-clear Attribute2
                            if (e.value && state.attribute2 === e.value) {
                                state.attribute2 = null;
                                if (Attribute2ListLookup.obj) {
                                    Attribute2ListLookup.obj.value = null;
                                }
                            }

                            // Clear errors
                            state.errors.attribute1 = '';
                            state.errors.attribute2 = '';
                        }
                    });
                    Attribute1ListLookup.obj.appendTo(attribute1Ref.value);
                }
            },
            refresh: () => {
                if (Attribute1ListLookup.obj) {
                    Attribute1ListLookup.obj.value = state.attribute1;
                }
            },
        };

        const Attribute2ListLookup = {
            obj: null,
            create: () => {
                if (state.AttributeListLookupData && Array.isArray(state.AttributeListLookupData)) {
                    Attribute2ListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.AttributeListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Attribute 2 (Optional)',
                        popupHeight: '200px',
                        change: (e) => {
                            state.attribute2 = e.value;

                            // If user picks the same as Attribute1 → auto-clear Attribute1
                            if (e.value && state.attribute1 === e.value) {
                                state.attribute1 = null;
                                if (Attribute1ListLookup.obj) {
                                    Attribute1ListLookup.obj.value = null;
                                }
                            }

                            state.errors.attribute1 = '';
                            state.errors.attribute2 = '';
                        }
                    });
                    Attribute2ListLookup.obj.appendTo(attribute2Ref.value);
                }
            },
            refresh: () => {
                if (Attribute2ListLookup.obj) {
                    Attribute2ListLookup.obj.value = state.attribute2;
                }
            },
        };
        const unitMeasureListLookup = {
            obj: null,
            create: () => {
                if (state.unitMeasureListLookupData && Array.isArray(state.unitMeasureListLookupData)) {
                    unitMeasureListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.unitMeasureListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Unit Measure',
                        popupHeight: '200px',
                        change: (e) => {
                            state.unitMeasureId = e.value;
                        }
                    });
                    unitMeasureListLookup.obj.appendTo(unitMeasureIdRef.value);
                } else {
                    console.error('UnitMeasure list lookup data is not available or invalid.');
                }
            },
            refresh: () => {
                if (unitMeasureListLookup.obj) {
                    unitMeasureListLookup.obj.value = state.unitMeasureId;
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

        const nameText = {
            obj: null,
            create: () => {
                nameText.obj = new ej.inputs.TextBox({
                    placeholder: 'Enter Name',
                });
                nameText.obj.appendTo(nameRef.value);
            },
            refresh: () => {
                if (nameText.obj) {
                    nameText.obj.value = state.name;
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
            },
            refresh: () => {
                if (numberText.obj) {
                    numberText.obj.value = state.number;
                }
            }
        };

        const unitPriceNumber = {
            obj: null,
            create: () => {
                unitPriceNumber.obj = new ej.inputs.NumericTextBox({
                    format: 'n2',
                    placeholder: 'Enter Unit Price',
                    min: 0,
                    step: 0.01,
                    validateDecimalOnType: true
                });
                unitPriceNumber.obj.appendTo(unitPriceRef.value);
            },
            refresh: () => {
                if (unitPriceNumber.obj) {
                    unitPriceNumber.obj.value = state.unitPrice;
                }
            }
        };

        Vue.watch(
            () => state.name,
            (newVal, oldVal) => {
                state.errors.name = '';
                nameText.refresh();
            }
        );

        Vue.watch(
            () => state.number,
            (newVal, oldVal) => {
                numberText.refresh();
            }
        );

        Vue.watch(
            () => state.unitPrice,
            (newVal, oldVal) => {
                state.errors.unitPrice = '';
                unitPriceNumber.refresh();
            }
        );

        Vue.watch(
            () => state.productGroupId,
            (newVal, oldVal) => {
                state.errors.productGroupId = '';
                productGroupListLookup.refresh();
            }
        );

        Vue.watch(
            () => state.unitMeasureId,
            (newVal, oldVal) => {
                state.errors.unitMeasureId = '';
                unitMeasureListLookup.refresh();
            }
        );
        Vue.watch(() => state.attribute1, () => {
            state.errors.attribute1 = '';
            state.errors.attribute2 = '';
            Attribute1ListLookup.refresh();

            if (state.attribute1 && state.attribute2 && state.attribute1 === state.attribute2) {
                state.errors.attribute1 = 'Attribute 1 and Attribute 2 cannot be the same.';
                state.errors.attribute2 = 'Cannot select the same attribute twice.';
            }
        });

        Vue.watch(() => state.attribute2, () => {
            state.errors.attribute1 = '';
            state.errors.attribute2 = '';
            Attribute2ListLookup.refresh();

            if (state.attribute1 && state.attribute2 && state.attribute1 === state.attribute2) {
                state.errors.attribute1 = 'Attribute 1 and Attribute 2 cannot be the same.';
                state.errors.attribute2 = 'Cannot select the same attribute twice.';
            }
        });
        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    const response = state.id === ''
                        ? await services.createMainData(
                            state.name, state.unitPrice, state.physical, state.description,
                            state.productGroupId, state.unitMeasureId,
                            StorageManager.getUserId(), state.location, state.taxId,
                            state.attribute1, state.attribute2, state.serviceNo, state.IMEI1, state.IMEI2
                        )
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(
                                state.id, state.name, state.unitPrice, state.physical, state.description,
                                state.productGroupId, state.unitMeasureId,
                                StorageManager.getUserId(), state.location, state.taxId,
                                state.attribute1, state.attribute2, state.serviceNo, state.IMEI1, state.IMEI2
                            );
                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Product';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            state.name = response?.data?.content?.data.name ?? '';
                            state.unitPrice = response?.data?.content?.data.unitPrice ?? '';
                            state.description = response?.data?.content?.data.description ?? '';
                            state.productGroupId = response?.data?.content?.data.productGroupId ?? '';
                            state.unitMeasureId = response?.data?.content?.data.unitMeasureId ?? '';
                            state.physical = response?.data?.content?.data.physical ?? false;
                            state.taxId = response?.data?.content?.data.taxId ?? '';

                            Swal.fire({
                                icon: 'success',
                                title: state.deleteMode ? 'Delete Successful' : 'Save Successful',
                                text: 'Form will be closed...',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            setTimeout(() => {
                                mainModal.obj.hide();
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
                await SecurityManager.authorizePage(['Products']);
                await SecurityManager.validateToken();

                //  Get location from localStorage (JSON array or single)
                let selectedLocation = StorageManager.getLocation();
                state.location = selectedLocation;


                await methods.populateMainData();
                await mainGrid.create(state.mainData);
                await methods.populateProductGroupListLookupData();
                productGroupListLookup.create();
                await methods.populateAttributeListLookupData();
                Attribute1ListLookup.create();
                Attribute2ListLookup.create();

                await methods.populateUnitMeasureListLookupData();
                unitMeasureListLookup.create();
                await methods.populateTaxListLookupData();
                taxListLookup.create();

                nameText.create();
                numberText.create();
                unitPriceNumber.create();
               
                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', () => {
                    resetFormState();
                });

            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
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
                    //groupSettings: {
                    //    columns: ['productGroupName']
                    //},
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
                        { field: 'number', headerText: 'Number', width: 200, minWidth: 200 },
                        { field: 'name', headerText: 'Name', width: 200, minWidth: 200 },
                        { field: 'productGroupName', headerText: 'Product Group', width: 100, minWidth: 150 },
                        { field: 'unitPrice', headerText: 'Unit Price', width: 100, minWidth: 150, format: 'N2' },
                        { field: 'unitMeasureName', headerText: 'Unit Measure', width: 100, minWidth: 150 },
                        { field: 'taxName', headerText: 'Tax', width: 150, minWidth: 100 },
                        { field: 'physical', headerText: 'Physical Product', width: 200, minWidth: 200, textAlign: 'Center', type: 'boolean', displayAsCheckBox: true },
                        { field: 'createdAtUtc', headerText: 'Created At UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        mainGrid.obj.autoFitColumns(['number', 'name', 'productGroupName', 'unitPrice', 'unitMeasureName', 'physical', 'createdAtUtc']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
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
                            state.mainTitle = 'Add Product';
                            resetFormState();
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            debugger;
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Product';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.unitPrice = selectedRecord.unitPrice ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.productGroupId = selectedRecord.productGroupId ?? '';
                                state.unitMeasureId = selectedRecord.unitMeasureId ?? '';
                                state.physical = selectedRecord.physical ?? false;
                                state.taxId = selectedRecord.taxId ?? null;
                                // THESE WERE MISSING — NOW ADDED!
                                state.attribute1 = selectedRecord.attribute1Id ?? null;    // maps to Attribute1Id
                                state.attribute2 = selectedRecord.attribute2Id ?? null;    // maps to Attribute2Id
                                state.serviceNo = selectedRecord.serviceNo ?? false;
                                state.IMEI1 = selectedRecord.imei1 ?? false;               // or imei1 if lowercase in API
                                state.IMEI2 = selectedRecord.imei2 ?? false;               // or imei2
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Product?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.unitPrice = selectedRecord.unitPrice ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.productGroupId = selectedRecord.productGroupId ?? '';
                                state.unitMeasureId = selectedRecord.unitMeasureId ?? '';
                                state.physical = selectedRecord.physical ?? false;
                                mainModal.obj.show();
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
            productGroupIdRef,
            unitMeasureIdRef,
            nameRef,
            numberRef,
            unitPriceRef,
            state,
            handler,
            taxIdRef, // 👈 Add this line
            attribute1Ref,
            attribute2Ref
        };
    }
};

Vue.createApp(App).mount('#app');