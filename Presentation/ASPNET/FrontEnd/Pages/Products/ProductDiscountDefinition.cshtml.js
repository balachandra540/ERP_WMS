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
            discountType: "Flat", // Default to Flat
            discountPercentage: 0,
            effectiveFrom: "",
            effectiveTo: "",
            isActive: true,

            // New: Upto Details (User Group Limits)
            discountDetails: [],

            // Lookups
            productListLookupData: [],
            userGroupLookupData: [], // Lookup for User Groups

            // Validation errors
            errors: {
                productId: "",
                discountName: "",
                discountType: "",
                discountPercentage: "",
                effectiveFrom: "",
                details: "" // Error for the detail table
            },

            isSubmitting: false
        });

        // -----------------------------
        //              REFS
        //------------------------------
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const productIdRef = Vue.ref(null);
        const discountTypeRef = Vue.ref(null);
        const statusRef = Vue.ref(null);

        // -----------------------------
        //      DETAIL ROW METHODS
        //------------------------------
        const detailMethods = {
            addDetailRow: () => {
                state.discountDetails.push({ userGroupId: null, maxPercentage: 0 });
            },
            removeDetailRow: (index) => {
                state.discountDetails.splice(index, 1);
            },
            // Logic to prevent selecting the same User Group twice
            getAvailableUserGroups: (currentIndex) => {
                const selectedIds = state.discountDetails
                    .map((d, idx) => idx !== currentIndex ? d.userGroupId : null)
                    .filter(id => id !== null);

                return state.userGroupLookupData.filter(ug => !selectedIds.includes(ug.id));
            }
        };

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

            // Flat Type Validation
            if (state.discountType === "Flat") {
                if (!state.discountPercentage || state.discountPercentage <= 0 || state.discountPercentage > 100) {
                    state.errors.discountPercentage = "Percentage must be between 1 and 100.";
                    isValid = false;
                }
            }

            // Upto Type Validation (Detail Rows)
            if (state.discountType === "Upto") {
                if (state.discountDetails.length === 0) {
                    state.errors.details = "At least one user group limit is required.";
                    isValid = false;
                }
                state.discountDetails.forEach((d, idx) => {
                    if (!d.userGroupId || d.maxPercentage <= 0 || d.maxPercentage > 100) {
                        state.errors.details = `Row ${idx + 1} has invalid group or percentage.`;
                        isValid = false;
                    }
                });
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
            state.discountType = "Flat";
            state.discountPercentage = 0;
            state.effectiveFrom = "";
            state.effectiveTo = "";
            state.isActive = true;
            state.discountDetails = [];

            Object.keys(state.errors).forEach(k => state.errors[k] = "");
            refreshAllLookups();
        };

        // -----------------------------
        //            SERVICES
        //------------------------------
        const services = {
            getMainData: async () =>
                await AxiosManager.get("/Product/GetProductDiscountDefinitionList", {}),

            getProductList: async () =>
                await AxiosManager.get("/Product/GetProductList", {}),

            getUserGroupList: async () =>
                await AxiosManager.get("/UserGroup/GetUserGroupList", {}),

            createData: async () =>
                await AxiosManager.post("/Product/CreateProductDiscountDefinition", {
                    productId: state.productId,
                    discountName: state.discountName,
                    discountType: state.discountType,
                    // FIX: Send 0 instead of null for non-nullable decimal
                    discountPercentage: state.discountType === "Flat" ? (state.discountPercentage || 0) : 0,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive,
                    // FIX: Match C# PascalCase keys for the internal objects
                    Details: state.discountType === "Upto" ? state.discountDetails.map(x => ({
                        UserGroupId: x.userGroupId,
                        MaxPercentage: x.maxPercentage
                    })) : []
                }),

            updateData: async () =>
                await AxiosManager.post("/Product/UpdateProductDiscountDefinition", {
                    id: state.id,
                    productId: state.productId,
                    discountName: state.discountName,
                    discountType: state.discountType,
                    // FIX: Send 0 instead of null
                    discountPercentage: state.discountType === "Flat" ? (state.discountPercentage || 0) : 0,
                    effectiveFrom: state.effectiveFrom,
                    effectiveTo: state.effectiveTo,
                    isActive: state.isActive,
                    // FIX: Match C# PascalCase keys
                    Details: state.discountType === "Upto" ? state.discountDetails.map(x => ({
                        UserGroupId: x.userGroupId,
                        MaxPercentage: x.maxPercentage
                    })) : []
                }),
            deleteData: async () =>
                await AxiosManager.post("/Product/DeleteProductDiscountDefinition", {
                    id: state.id
                })
        };

        // -----------------------------
        //          LOOKUPS (EJ2)
        //------------------------------
        const lookups = {
            product: null,
            type: null,
            status: null,

            create: () => {
                // Product Dropdown
                lookups.product = new ej.dropdowns.DropDownList({
                    dataSource: state.productListLookupData,
                    fields: { value: "id", text: "name" },
                    placeholder: "Select Product",
                    change: e => state.productId = e.value
                });
                lookups.product.appendTo(productIdRef.value);

                // Discount Type Dropdown
                lookups.type = new ej.dropdowns.DropDownList({
                    dataSource: [{ id: "Flat", text: "Flat" }, { id: "Upto", text: "Upto" }],
                    fields: { value: "id", text: "text" },
                    placeholder: "Select Type",
                    value: state.discountType,
                    change: e => state.discountType = e.value
                });
                lookups.type.appendTo(discountTypeRef.value);

                // Status Dropdown
                lookups.status = new ej.dropdowns.DropDownList({
                    dataSource: [{ id: true, text: "Active" }, { id: false, text: "Inactive" }],
                    fields: { value: "id", text: "text" },
                    value: state.isActive,
                    change: e => state.isActive = e.value
                });
                lookups.status.appendTo(statusRef.value);
            }
        };

        const refreshAllLookups = () => {
            if (lookups.product) lookups.product.value = state.productId;
            if (lookups.type) lookups.type.value = state.discountType;
            if (lookups.status) lookups.status.value = state.isActive;
        };

        // -----------------------------
        //          METHODS
        //------------------------------
        const methods = {
            populateMainData: async () => {
                const res = await services.getMainData();
                state.mainData = res?.data?.content?.data ?? [];
            },
            populateLookups: async () => {
                const [resP, resG] = await Promise.all([
                    services.getProductList(),
                    services.getUserGroupList()
                ]);
                state.productListLookupData = resP?.data?.content?.data ?? [];
                state.userGroupLookupData = resG?.data?.content?.data ?? [];
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
                            title: "Saved Successfully",
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => mainModal.obj.hide(), 1200);
                    } else {
                        Swal.fire("Failed", response.data.message, "error");
                    }
                } catch (e) {
                    Swal.fire("Error", "Unexpected server error", "error");
                } finally {
                    state.isSubmitting = false;
                }
            }
        };

        // -----------------------------
        //             GRID
        // -----------------------------
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: "350px",
                    dataSource,
                    allowSorting: true,
                    toolbar: [
                        'Search',
                        { text: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' }
                    ],
                    columns: [
                        { type: 'checkbox', width: 50 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'productName', headerText: 'Product', width: 160 },
                        { field: 'discountName', headerText: 'Discount Name', width: 160 },
                        { field: 'discountType', headerText: 'Type', width: 100 },
                        { field: 'isActive', headerText: 'Active', type: 'boolean', displayAsCheckBox: true, width: 100 }
                    ],
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
                            const row = mainGrid.obj.getSelectedRecords()[0];
                            if (!row) return;

                            state.deleteMode = false;
                            state.mainTitle = "Edit Discount Definition";

                            Object.assign(state, {
                                id: row.id,
                                productId: row.productId,
                                discountName: row.discountName,
                                discountType: row.discountType,
                                discountPercentage: row.discountPercentage,
                                effectiveFrom: row.effectiveFrom?.substring(0, 10),
                                effectiveTo: row.effectiveTo?.substring(0, 10),
                                isActive: row.isActive,

                                // FIX: Map 'productDiscountDetails' from the API to 'discountDetails' in state
                                // We also map the properties to ensure they match the lowercase names used in Vue
                                discountDetails: (row.productDiscountDetails || []).map(d => ({
                                    userGroupId: d.userGroupId,
                                    maxPercentage: d.maxPercentage
                                }))
                            });

                            refreshAllLookups();
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
            refresh: () => mainGrid.obj.setProperties({ dataSource: state.mainData })
        };

        // -----------------------------
        //            MODAL
        // -----------------------------
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
        // -----------------------------
        Vue.onMounted(async () => {
            await methods.populateLookups();
            await methods.populateMainData();
            await mainGrid.create(state.mainData);

            lookups.create();
            mainModal.create();
            mainModalRef.value.addEventListener("hidden.bs.modal", resetFormState);
        });

        return {
            mainGridRef,
            mainModalRef,
            productIdRef,
            discountTypeRef,
            statusRef,
            state,
            handler,
            detailMethods
        };
    }
};

Vue.createApp(App).mount("#app");