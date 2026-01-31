const App = {
    setup() {

        // -----------------------------
        //            STATE
        //------------------------------
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            mainTitle: "",

            // Model fields
            id: "",
            productId: null,
            productName: "",
            discountName: "",
            discountType: "",
            discountPercentage: 0,
            maxDiscountAmount: null,
            effectiveFrom: "",
            effectiveTo: "",
            isActive: true,

            // Lookups
            productListLookupData: [],

            // Validation errors
            errors: {
                productId: "",
                discountName: "",
                discountType: "",
                discountPercentage: "",
                maxDiscountAmount: "",
                effectiveFrom: ""
            },

            isSubmitting: false
        });

        // -----------------------------
        //              REFS
        //------------------------------
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const productIdRef = Vue.ref(null);

        // -----------------------------
        //           VALIDATION
        //------------------------------
        const validateForm = () => {
            Object.keys(state.errors).forEach(k => state.errors[k] = "");
            let isValid = true;

            if (!state.productId) {
                state.errors.productId = "Product is required.";
                isValid = false;
            }

            if (!state.discountName) {
                state.errors.discountName = "Discount name is required.";
                isValid = false;
            }

            if (!state.discountType) {
                state.errors.discountType = "Discount type is required.";
                isValid = false;
            }

            if (!state.discountPercentage || state.discountPercentage <= 0 || state.discountPercentage > 100) {
                state.errors.discountPercentage = "Discount percentage must be between 1 and 100.";
                isValid = false;
            }

            if (state.discountType === "Upto" && (!state.maxDiscountAmount || state.maxDiscountAmount <= 0)) {
                state.errors.maxDiscountAmount = "Max discount amount is required for Upto.";
                isValid = false;
            }

            if (!state.effectiveFrom) {
                state.errors.effectiveFrom = "Effective From date is required.";
                isValid = false;
            }

            return isValid;
        };

        // -----------------------------
        //          RESET FORM
        //------------------------------
        const resetFormState = () => {
            state.id = "";
            state.productId = null;
            state.productName = "";
            state.discountName = "";
            state.discountType = "";
            state.discountPercentage = 0;
            state.maxDiscountAmount = null;
            state.effectiveFrom = "";
            state.effectiveTo = "";
            state.isActive = true;

            Object.keys(state.errors).forEach(k => state.errors[k] = "");
        };

        // -----------------------------
        //            SERVICES
        //------------------------------
        const services = {
            getMainData: async () =>
                await AxiosManager.get("/Product/GetProductDiscountDefinitionList", {}),

            getProductList: async () =>
                await AxiosManager.get("/Product/GetProductList", {}),

            createData: async () =>
                await AxiosManager.post("/Product/CreateProductDiscountDefinition", {
                    productId: state.productId,
                    discountName: state.discountName,
                    discountType: state.discountType,
                    discountPercentage: state.discountPercentage,
                    maxDiscountAmount: state.discountType === "Upto" ? state.maxDiscountAmount : null,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive
                }),

            updateData: async () =>
                await AxiosManager.post("/Product/UpdateProductDiscountDefinition", {
                    id: state.id,
                    productId: state.productId,
                    discountName: state.discountName,
                    discountType: state.discountType,
                    discountPercentage: state.discountPercentage,
                    maxDiscountAmount: state.discountType === "Upto" ? state.maxDiscountAmount : null,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive
                }),

            deleteData: async () =>
                await AxiosManager.post("/Product/DeleteProductDiscountDefinition", {
                    id: state.id
                })
        };

        // -----------------------------
        //          LOOKUPS
        //------------------------------
        const productLookup = {
            obj: null,
            create: () => {
                productLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.productListLookupData,
                    fields: { value: "id", text: "name" },
                    placeholder: "Select Product",
                    change: e => state.productId = e.value
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
        //          METHODS
        //------------------------------
        const methods = {
            populateMainData: async () => {
                debugger;
                const res = await services.getMainData();
                state.mainData = res?.data?.content?.data ?? [];
            },
            populateProductListLookupData: async () => {
                const res = await services.getProductList();
                state.productListLookupData = res?.data?.content?.data ?? [];
            }
        };

        // -----------------------------
        //          SUBMIT
        //------------------------------
        const handler = {
            handleSubmit: async () => {
                try {
                    state.isSubmitting = true;
                    if (!validateForm()) return;

                    let response;
                    if (!state.id) response = await services.createData();
                    else if (state.deleteMode) response = await services.deleteData();
                    else response = await services.updateData();

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        Swal.fire({
                            icon: "success",
                            title: "Success",
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => mainModal.obj.hide(), 1200);
                    } else {
                        Swal.fire("Failed", response.data.message, "error");
                    }
                } catch (e) {
                    Swal.fire("Error", e.response?.data?.message ?? "Unexpected error", "error");
                } finally {
                    state.isSubmitting = false;
                }
            }
        };

        // -----------------------------
        //             GRID
        //------------------------------
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: "350px",
                    dataSource,
                    allowPaging: true,
                    allowSorting: true,
                    allowFiltering: true,
                    filterSettings: { type: "CheckBox" },
                    pageSettings: { pageSize: 50 },
                    toolbar: [
                        'Search',
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ],
                    columns: [
                        { type: 'checkbox', width: 50 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'productName', headerText: 'Product', width: 160 },
                        { field: 'discountName', headerText: 'Discount Name', width: 160 },
                        { field: 'discountType', headerText: 'Type', width: 100 },
                        { field: 'discountPercentage', headerText: 'Discount %', width: 120 },
                        { field: 'maxDiscountAmount', headerText: 'Max Amount', width: 120 },
                        { field: 'effectiveFrom', headerText: 'Effective From', format: 'yyyy-MM-dd', width: 130 },
                        { field: 'effectiveTo', headerText: 'Effective To', format: 'yyyy-MM-dd', width: 130 },
                        { field: 'isActive', headerText: 'Active', type: 'boolean', displayAsCheckBox: true, width: 100 }
                    ],
                    rowSelected: () =>
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], true),
                    rowDeselected: () =>
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom'], false),
                    toolbarClick: (args) => {
                        const row = mainGrid.obj.getSelectedRecords()[0];
                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = "Add Discount Definition";
                            resetFormState();
                            mainModal.obj.show();
                            return;
                        }
                        if (!row) return;

                        if (args.item.id === "EditCustom") {
                            state.deleteMode = false;
                            state.mainTitle = "Edit Discount Definition";

                            Object.assign(state, {
                                id: row.id,
                                productId: row.productId,
                                productName: row.productName,
                                discountName: row.discountName,
                                discountType: row.discountType,
                                discountPercentage: row.discountPercentage,
                                maxDiscountAmount: row.maxDiscountAmount,
                                effectiveFrom: row.effectiveFrom?.substring(0, 10),
                                effectiveTo: row.effectiveTo?.substring(0, 10),
                                isActive: row.isActive
                            });

                            productLookup.refresh();
                            mainModal.obj.show();
                        }

                        if (args.item.id === "DeleteCustom") {
                            state.deleteMode = true;
                            state.id = row.id;

                            Swal.fire({
                                title: "Confirm Delete?",
                                icon: "warning",
                                showCancelButton: true
                            }).then(r => r.isConfirmed && handler.handleSubmit());
                        }
                    }
                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () =>
                mainGrid.obj.setProperties({ dataSource: state.mainData })
        };

        // -----------------------------
        //            MODAL
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
        //          ON MOUNT
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
