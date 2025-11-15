const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            mainTitle: null,

            // Model fields
            id: "",
            productId: null,
            productName: "",
            costPrice: 0,
            marginPercentage: 10,
            salePrice: 0,
            currencyCode: "INR",
            effectiveFrom: "",
            effectiveTo: "",
            isActive: true,

            // Lookups
            productListLookupData: [],

            // Validation errors
            errors: {
                productId: "",
                productName: "",
                costPrice: "",
                effectiveFrom: ""
            },

            isSubmitting: false
        });

        // Refs
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const productIdRef = Vue.ref(null);
        //const nameRef = Vue.ref(null);

        // -----------------------------
        //       VALIDATION
        //------------------------------
        const validateForm = function () {
            state.errors.productId = "";
            state.errors.costPrice = "";
            state.errors.effectiveFrom = "";

            let isValid = true;

            if (!state.productId) {
                state.errors.productId = "Product is required.";
                isValid = false;
            }

            ////if (!state.productName) {
            ////    state.errors.productId = "Product Name is required.";
            ////    isValid = false;
            ////}

            if (!state.costPrice || state.costPrice <= 0) {
                state.errors.costPrice = "Cost price must be greater than zero.";
                isValid = false;
            }

            if (!state.effectiveFrom) {
                state.errors.effectiveFrom = "Effective From date is required.";
                isValid = false;
            }

            return isValid;
        };

        // Reset Form
        const resetFormState = () => {
            state.id = "";
            state.productId = null;
            state.productName = "";
            state.costPrice = 0;
            state.marginPercentage = 10;
            state.salePrice = 0;
            state.currencyCode = "INR";
            state.effectiveFrom = "";
            state.effectiveTo = "";
            state.isActive = true;

            state.errors = {
                productId: "",
                productName: "",
                costPrice: "",
                effectiveFrom: "",
                salePrice: "",
            };
        };

        // -----------------------------
        //       SERVICES (API)
        //------------------------------
        const services = {
            getMainData: async () => {
                return await AxiosManager.get("/Product/GetProductPriceDefinitionList", {});
            },
            getProductList: async () => {
                return await AxiosManager.get("/Product/GetProductList", {});
            },
            createData: async () => {
                return await AxiosManager.post("/Product/CreateProductPriceDefinition", {
                    productId: state.productId,
                    productName: state.productName,
                    costPrice: state.costPrice,
                    marginPercentage: state.marginPercentage,
                    currencyCode: state.currencyCode,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive
                });
            },
            updateData: async () => {
                return await AxiosManager.post("/Product/UpdateProductPriceDefinition", {
                    id: state.id,
                    productId: state.productId,
                    productName: state.productName,
                    costPrice: state.costPrice,
                    marginPercentage: state.marginPercentage,
                    currencyCode: state.currencyCode,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive
                });
            },
            deleteData: async () => {
                return await AxiosManager.post("/Product/DeleteProductPriceDefinition", {
                    id: state.id
                });
            }
        };

        // -----------------------------
        //     METHODS & LOOKUPS
        //------------------------------
        const methods = {
            populateProductListLookupData: async () => {
                const response = await services.getProductList();
                state.productListLookupData = response?.data?.content?.data ?? [];
            },
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data ?? [];
            }
        };

        const productLookup = {
            obj: null,
            create: () => {
                productLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.productListLookupData,
                    fields: { value: "id", text: "name" },
                    placeholder: "Select Product",
                    change: (e) => {
                        state.productId = e.value;
                    },
                    enabled: false  // Disable the dropdown

                });
                productLookup.obj.appendTo(productIdRef.value);
            },
            refresh: () => {
                if (productLookup.obj) {
                    productLookup.obj.value = state.productId;
                }
            }
        };

        // -----------------------------
        //   AUTO SALE PRICE CALCULATION
        //------------------------------
        Vue.watch(
            () => [state.costPrice, state.marginPercentage],
            () => {
                const cost = parseFloat(state.costPrice) || 0;
                const margin = parseFloat(state.marginPercentage) || 0;

                state.salePrice = cost + (cost * margin / 100);
            },
            { deep: true }
        );

        // -----------------------------
        //      SUBMIT HANDLER
        //------------------------------
        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;

                    if (!validateForm()) return;

                    let response;

                    if (state.id === "") {
                        response = await services.createData();
                    }
                    else if (state.deleteMode) {
                        response = await services.deleteData();
                    }
                    else {
                        response = await services.updateData();
                    }

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        Swal.fire({
                            icon: "success",
                            title: "Success",
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => mainModal.obj.hide(), 1500);
                    }
                    else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: response.data.message
                        });
                    }

                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.response?.data?.message ?? "Unexpected error"
                    });
                } finally {
                    state.isSubmitting = false;
                }
            }
        };

        // -----------------------------
        //        GRID
        //------------------------------
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: "350px",
                    dataSource,
                    allowPaging: true,
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
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        //{ text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                    ],

                    columns: [
                        { type: 'checkbox', width: 60 },
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
                        },
                        { field: "productName", headerText: "Product", width: 150 },
                        { field: "costPrice", headerText: "Cost Price", format: "N2", width: 120 },
                        { field: "marginPercentage", headerText: "Margin %", width: 120 },
                        { field: "salePrice", headerText: "Sale Price", format: "N2", width: 120 },
                        { field: "currencyCode", headerText: "Currency", width: 120 },
                        { field: "effectiveFrom", headerText: "Effective From", format: "yyyy-MM-dd", width: 130 },
                        { field: "effectiveTo", headerText: "Effective To", format: "yyyy-MM-dd", width: 130 },
                        { field: "isActive", headerText: "Active", type: "boolean", displayAsCheckBox: true, width: 100 }
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false);
                        mainGrid.obj.autoFitColumns(['productName', 'costPrice', 'marginPercentage', 'salePrice', 'effectiveFrom', 'effectiveTo', 'isActive','currencyCode']);
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

                    toolbarClick: (args) => {
                        if (args.item.id === "AddCustom") {
                            state.deleteMode = false;
                            resetFormState();
                            state.mainTitle = "Add Price Definition";
                            mainModal.obj.show();
                        }

                        if (args.item.id === "EditCustom") {
                            const row = mainGrid.obj.getSelectedRecords()[0];
                            if (!row) return;

                            state.deleteMode = false;
                            state.mainTitle = "Edit Price Definition";

                            state.id = row.id;
                            state.productId = row.productId;
                            state.productName = row.productName;
                            state.costPrice = row.costPrice;
                            state.marginPercentage = row.marginPercentage;
                            state.salePrice = row.salePrice;
                            state.currencyCode = row.currencyCode;
                            state.effectiveFrom = row.effectiveFrom?.substring(0, 10);
                            state.effectiveTo = row.effectiveTo?.substring(0, 10);
                            state.isActive = row.isActive;

                            productLookup.refresh();

                            mainModal.obj.show();
                        }

                        if (args.item.id === "DeleteCustom") {
                            const row = mainGrid.obj.getSelectedRecords()[0];
                            if (!row) return;

                            state.deleteMode = true;
                            state.id = row.id;

                            Swal.fire({
                                title: "Confirm Delete?",
                                icon: "warning",
                                showCancelButton: true
                            }).then(async (r) => {
                                if (r.isConfirmed) {
                                    await handler.handleSubmit();
                                }
                            });
                        }
                    }
                });
                debugger;
                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () => {
                debugger;
                mainGrid.obj.setProperties({ dataSource: state.mainData });
            }
        };

        // -----------------------------
        //        MODAL
        //------------------------------
        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
                    backdrop: "static",
                    keyboard: false
                });
            }
        };

        // -----------------------------
        //      INITIAL LOAD
        //------------------------------
        Vue.onMounted(async () => {
            await methods.populateMainData();
            await mainGrid.create(state.mainData);

            await methods.populateProductListLookupData();
            productLookup.create();

            mainModal.create();

            mainModalRef.value.addEventListener("hidden.bs.modal", resetFormState);
        });

        return {
            mainGridRef,
            mainModalRef,
            productIdRef,
            state,
            handler
        };
    }
};

Vue.createApp(App).mount("#app");
