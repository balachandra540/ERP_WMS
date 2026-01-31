const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            goodsReceiveListLookupData: [],
            purchaseReturnStatusListLookupData: [],
            secondaryData: [],
            // 🔥 NEW (GRN STOCK HANDLING)
            allProductStocks: new Map(),   // productId → availableQty
            availableProducts: [],         // filtered products with stock > 0
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            returnDate: '',
            description: '',
            goodsReceiveId: null,
            status: null,
            errors: {
                returnDate: '',
                goodsReceiveId: '',
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
        const returnDateRef = Vue.ref(null);
        const goodsReceiveIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.returnDate = '';
            state.errors.goodsReceiveId = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.returnDate) {
                state.errors.returnDate = 'Return date is required.';
                isValid = false;
            }
            if (!state.goodsReceiveId) {
                state.errors.goodsReceiveId = 'Goods Receive is required.';
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
            //state.returnDate = '';
            state.description = '';
            state.goodsReceiveId = null;
            state.status = null;
            state.errors = {
                returnDate: '',
                goodsReceiveId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
            state.allProductStocks = new Map();
            state.availableProducts = [];

        };

        //const returnDatePicker = {
        //    obj: null,
        //    create: () => {
        //        returnDatePicker.obj = new ej.calendars.DatePicker({
        //            placeholder: 'Select Date',
        //            format: 'yyyy-MM-dd',
        //            value: state.returnDate ? new Date(state.returnDate) : null,
        //            change: (e) => {
        //                state.returnDate = e.value;
        //            }
        //        });
        //        returnDatePicker.obj.appendTo(returnDateRef.value);
        //    },
        //    refresh: () => {
        //        if (returnDatePicker.obj) {
        //            returnDatePicker.obj.value = state.returnDate ? new Date(state.returnDate) : null;
        //        }
        //    }
        //};

        const returnDatePicker = {
            obj: null,

            create: () => {
                const defaultDate = state.returnDate
                    ? new Date(state.returnDate)
                    : new Date();

                returnDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false   // 🔒 disabled
                });

                // ✅ CRITICAL: sync state manually
                state.returnDate = defaultDate;

                returnDatePicker.obj.appendTo(returnDateRef.value);
            },

            refresh: () => {
                if (returnDatePicker.obj) {
                    const date = state.returnDate
                        ? new Date(state.returnDate)
                        : new Date();

                    returnDatePicker.obj.value = date;

                    // ✅ keep state in sync
                    state.returnDate = date;
                }
            }
        };

        //Vue.watch(
        //    () => state.returnDate,
        //    (newVal, oldVal) => {
        //        returnDatePicker.refresh();
        //        state.errors.returnDate = '';
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

        const goodsReceiveListLookup = {
            obj: null,
            create: () => {
                if (state.goodsReceiveListLookupData && Array.isArray(state.goodsReceiveListLookupData)) {
                    goodsReceiveListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.goodsReceiveListLookupData,
                        fields: { value: 'id', text: 'number' },
                        placeholder: 'Select Goods Receive',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('number', 'startsWith', e.text, true);
                            }
                            e.updateData(state.goodsReceiveListLookupData, query);
                        },
                        change: async (e) => {
                            state.goodsReceiveId = e.value;

                            // 🔥 ONLY IN CREATE MODE → LOAD GRN ITEMS
                            if (e.value) {
                                state.secondaryData = [];
                                secondaryGrid.refresh();

                                await methods.populateSecondaryData(null, e.value);
                                secondaryGrid.refresh();
                            }
                        }

                    });
                    goodsReceiveListLookup.obj.appendTo(goodsReceiveIdRef.value);
                }
            },
            refresh: () => {
                if (goodsReceiveListLookup.obj) {
                    goodsReceiveListLookup.obj.value = state.goodsReceiveId
                }
            },
        };

        Vue.watch(
            () => state.goodsReceiveId,
            (newVal, oldVal) => {
                goodsReceiveListLookup.refresh();
                state.errors.goodsReceiveId = '';
            }
        );

        const purchaseReturnStatusListLookup = {
            obj: null,
            create: () => {
                if (state.purchaseReturnStatusListLookupData && Array.isArray(state.purchaseReturnStatusListLookupData)) {
                    purchaseReturnStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.purchaseReturnStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    purchaseReturnStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (purchaseReturnStatusListLookup.obj) {
                    purchaseReturnStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                purchaseReturnStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const locationid = StorageManager.getLocation();
                    const response = await AxiosManager.get('/PurchaseReturn/GetPurchaseReturnList?location=' + locationid, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (payload) => {
                try {
                    const response = await AxiosManager.post(
                        '/PurchaseReturn/CreatePurchaseReturn',
                        payload
                    );
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            updateMainData: async (payload) => {
                try {
                    const response = await AxiosManager.post(
                        '/PurchaseReturn/UpdatePurchaseReturn',
                        payload
                    );
                    return response;
                } catch (error) {
                    throw error;
                }
            },
       deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/PurchaseReturn/DeletePurchaseReturn', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getGoodsReceiveListLookupData: async () => {
                try {
                    const locationId = StorageManager.getLocation();

                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList?locationId=' + locationId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getPurchaseReturnStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/PurchaseReturn/GetPurchaseReturnStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            //getSecondaryData: async (moduleId) => {
            //    try {
            //        const response = await AxiosManager.get('/InventoryTransaction/PurchaseReturnGetInvenTransList?moduleId=' + moduleId, {});
            //        return response;
            //    } catch (error) {
            //        throw error;
            //    }
            //},
            getSecondaryData: async (modelId, goodsReceiveId) => {
                debugger;
                try {
                    let response;

                    if (modelId) {
                        // Fetch data by transferOutId (moduleId)
                        response = await AxiosManager.get('/InventoryTransaction/PurchaseReturnGetInvenTransList?moduleId=' + modelId, {});
                    } else if (goodsReceiveId) {
                        // Fetch data by warehouseFromId
                        response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveItemList?goodsReceiveId=' + goodsReceiveId, {});
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
                    const response = await AxiosManager.post('/InventoryTransaction/PurchaseReturnCreateInvenTrans', {
                        moduleId, warehouseId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/PurchaseReturnUpdateInvenTrans', {
                        id, warehouseId, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/PurchaseReturnDeleteInvenTrans', {
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
            populateGoodsReceiveListLookupData: async () => {
                const response = await services.getGoodsReceiveListLookupData();
                state.goodsReceiveListLookupData = response?.data?.content?.data;
            },
            populatePurchaseReturnStatusListLookupData: async () => {
                const response = await services.getPurchaseReturnStatusListLookupData();
                state.purchaseReturnStatusListLookupData = response?.data?.content?.data;
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
            populateSecondaryData: async (purchaseReturnId = null, goodsReceiveId = null) => {
                try {

                    // -----------------------------------------
                    // EDIT MODE → load existing return rows
                    // -----------------------------------------
                    if (purchaseReturnId) {

                        const response = await services.getSecondaryData(
                            purchaseReturnId,
                            null
                        );

                        state.secondaryData =
                            response?.data?.content?.data?.map(item => {

                                const receivedQty = Number(item.receivedQuantity || 0);
                                const returnedQty = Number(item.returnedQuantity || 0);
                                const availableQty = Math.max(receivedQty - returnedQty, 0);

                                return {
                                    ...item,
                                    orderQuantity: availableQty,
                                    availableQuantity: availableQty,
                                    maxReturnQty: availableQty,
                                    returnQuantity: item.returnQuantity ?? null,
                                    createdAtUtc: item.createdAtUtc
                                        ? new Date(item.createdAtUtc)
                                        : null
                                };
                            }) || [];

                        // No need to rebuild stock map in edit
                        state.allProductStocks = new Map();
                        state.availableProducts = [];
                    }

                    // -----------------------------------------
                    // CREATE MODE → GRN selected
                    // -----------------------------------------
                    else {

                        // Start with empty grid
                        state.secondaryData = [];

                        if (goodsReceiveId) {

                            const stockResponse = await services.getSecondaryData(
                                null,
                                goodsReceiveId
                            );

                            const stockData = stockResponse?.data?.content?.data || [];

                            // Build product → available qty map
                            state.allProductStocks = new Map(
                                stockData.map(item => {
                                    const receivedQty = Number(item.receivedQuantity || 0);
                                    const returnedQty = Number(item.returnedQuantity || 0);
                                    const availableQty = Math.max(receivedQty - returnedQty, 0);
                                    return [item.productId, availableQty];
                                })
                            );

                            // Filter products that have stock > 0
                            state.availableProducts =
                                state.productListLookupData?.filter(
                                    p => state.allProductStocks.has(p.id)
                                ) || [];
                        } else {
                            state.allProductStocks = new Map();
                            state.availableProducts = [];
                        }
                    }

                    methods.refreshSummary();
                    secondaryGrid.refresh();
                    state.showComplexDiv = true;

                } catch (error) {
                    console.error("populateSecondaryData error:", error);

                    state.secondaryData = [];
                    state.allProductStocks = new Map();
                    state.availableProducts = [];

                    methods.refreshSummary();
                    secondaryGrid.refresh();
                    state.showComplexDiv = true;
                }
            },
            getProductStock: (productId) => {
                return state.allProductStocks?.get(productId) || 0;
            },


          refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.returnDate = '';
                state.errors.goodsReceiveId = '';
                state.errors.status = '';
            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
                }

            },
            openDetailModal: async (RowIndex, rowData) => {
                state.currentDetailRowIndex = RowIndex;

                if (!rowData) {
                    console.error("Row data not found!");
                    return;
                }

                state.activeDetailRow = JSON.parse(JSON.stringify(rowData));
                const activeRow = state.activeDetailRow;
                state.activeReturnQuantity = Number(activeRow.returnQuantity || 0);

                // 🔹 Find product
                const product = state.productListLookupData.find(
                    p => p.id === activeRow.productId
                );

                if (!product) {
                    Swal.fire(
                        "Error",
                        "Product not found. Please select a product in the grid first.",
                        "error"
                    );
                    return;
                }

                const qty = parseInt(activeRow.orderQuantity || 0);
                if (qty <= 0) {
                    Swal.fire(
                        "Validation Error",
                        "Please enter a orderQuantity before adding attributes.",
                        "error"
                    );
                    return;
                }

                // -------------------------------------------------------
                // 🔹 CALL BACKEND (ModuleId = deliveryOrderId)
                // -------------------------------------------------------
                let apiAttributes = [];
                try {
                    const response = await services.getInventoryTransactionAttributes(
                        state.deliveryOrderId,     // ✅ moduleId
                        activeRow.productId        // ✅ productId
                    );

                    apiAttributes = response?.data?.content || [];
                } catch (error) {
                    console.error(error);
                    Swal.fire("Error", "Failed to load IMEI / Service details", "error");
                    return;
                }

                // -------------------------------------------------------
                // 🔹 Build fields based on product config
                // -------------------------------------------------------
                let fields = [];
                if (product.imei1) fields.push("imei1");
                if (product.imei2) fields.push("imei2");
                if (product.serviceNo) fields.push("serviceNo");

                // 🔹 Use API data first, fallback to existing row data
                const existingDetails =
                    apiAttributes.length > 0
                        ? apiAttributes
                        : (rowData.attributes || []);

                // -------------------------------------------------------
                // 🔹 Build HTML Table (WITH CHECKBOX)
                // -------------------------------------------------------
                let html = `
        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    <th style="width:60px;">✔</th>
                    ${fields.map(f => `<th>${f}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

                for (let i = 0; i < qty; i++) {
                    const row = existingDetails[i] || {};
                    const checked = row.isChecked ? "checked" : "";

                    html += `<tr>`;

                    // ✅ Checkbox
                    html += `
            <td class="text-center">
                <input type="checkbox"
                       class="form-check-input detail-checkbox"
                       data-index="${i}"
                       ${checked}>
            </td>
        `;

                    // 🔹 Dynamic fields
                    fields.forEach(field => {
                        const val = row[field] || "";
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

                // 🔥 Save Button
                const saveBtn = document.getElementById("detailSaveBtn");
                if (saveBtn) {
                    saveBtn.onclick = (e) => {
                        e.preventDefault();
                        methods.saveDetailEntries();
                    };
                }

                await methods.attachDetailInputEvents(product);

                const modalEl = document.getElementById("detailModal");
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
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
                if (field === "IMEI1" || field === "IMEI2") {

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

                if (field === "IMEI1") imei1Value = value;
                if (field === "IMEI2") imei2Value = value;
                if (field === "ServiceNo") serviceNoValue = value;

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
                    IMEI1: matched.imeI1,
                    IMEI2: matched.imeI2,
                    ServiceNo: matched.serviceNo
                };

                Object.keys(fieldMap).forEach(field => {

                    if (field === matchedField) return;

                    const val = fieldMap[field];
                    if (!val) return;

                    if (state.activeDetailRow.detailEntries[index][field]) return;

                    // Save to state
                    state.activeDetailRow.detailEntries[index][field] = val;

                    // Bind to UI
                    const input = document.querySelector(
                        `.detail-input[data-index="${index}"][data-field="${field}"]`
                    );

                    if (input) {
                        input.value = val;
                        input.readOnly = true;
                        input.classList.add("auto-filled");
                    }
                });

                // Lock the entered field also
                const matchedInput = document.querySelector(
                    `.detail-input[data-index="${index}"][data-field="${matchedField}"]`
                );

                if (matchedInput) {
                    matchedInput.readOnly = true;
                    matchedInput.classList.add("auto-filled");
                }
            },
            saveDetailEntries: () => {

                const rowIndex = state.currentDetailRowIndex;
                const returnQty = state.activeReturnQuantity;

                if (!returnQty || returnQty <= 0) {
                    Swal.fire("Validation Error", "Return Quantity must be greater than 0", "error");
                    return;
                }

                const rows = document.querySelectorAll("tbody tr");
                let selectedEntries = [];
                let selectedCount = 0;

                rows.forEach((row, index) => {

                    const checkbox = row.querySelector(".detail-checkbox");
                    const isChecked = checkbox?.checked;

                    const inputs = row.querySelectorAll(".detail-input");

                    let entry = {};
                    inputs.forEach(input => {
                        const field = input.dataset.field;
                        const value = input.value?.trim();

                        if (value) {
                            entry[field.toUpperCase()] = value;
                        }
                    });

                    // ❌ If unchecked but has values → ERROR
                    if (!isChecked && Object.keys(entry).length > 0) {
                        Swal.fire(
                            "Validation Error",
                            `Row ${index + 1} has values but is not selected`,
                            "error"
                        );
                        throw new Error("Unchecked row has values");
                    }

                    if (isChecked) {
                        selectedCount++;
                        selectedEntries.push({
                            RowIndex: index,
                            IMEI1: entry.IMEI1 || null,
                            IMEI2: entry.IMEI2 || null,
                            ServiceNo: entry.SERVICENO || null
                        });
                    }
                });

                // ❌ Quantity mismatch
                if (selectedCount !== returnQty) {
                    Swal.fire(
                        "Validation Error",
                        `Please select exactly ${returnQty} attributes`,
                        "error"
                    );
                    return;
                }

                // ✅ Attach ONLY selected entries
                const gridRowData = secondaryGrid.obj.getRowsObject()[rowIndex].data;
                gridRowData.detailEntries = selectedEntries;

                secondaryGrid.obj.updateRow(rowIndex, gridRowData);

                if (state.secondaryData.length > 0) {
                    state.secondaryData[rowIndex] = gridRowData;
                }

                const modalEl = document.getElementById("detailModal");
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal?.hide();

                Swal.fire({
                    icon: 'success',
                    title: 'Attributes saved',
                    timer: 1000,
                    showConfirmButton: false
                });
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
                    const imei1 = (entry.IMEI1 || "").trim();
                    const imei2 = (entry.IMEI2 || "").trim();
                    const serviceNo = (entry.ServiceNo || "").trim();

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
                if (row.detailEntries.length !== row.returnQuantity) {
                    errors.push(
                        `Return Quantity (${row.returnQuantity}) does not match selected attributes (${row.detailEntries.length})`
                    );
                }


                return { Attributes, errors };
            },
            prepareSecondaryDataForSubmission: function () {

                const batchChanges = secondaryGrid.getBatchChanges();

                // 1️⃣ Merge grid state
                let currentSecondaryData =
                    state.id !== "" ? [...state.secondaryData] : [];

                const added = batchChanges.addedRecords || [];
                const changed = batchChanges.changedRecords || [];
                const deleted = batchChanges.deletedRecords || [];

                const match = (a, b) => (a.id && b.id ? a.id === b.id : false);

                // Apply edits
                changed.forEach(row => {
                    const idx = currentSecondaryData.findIndex(item => match(item, row));
                    if (idx !== -1) currentSecondaryData[idx] = { ...currentSecondaryData[idx], ...row };
                });

                // Add new
                currentSecondaryData.push(...added);

                // Remove deleted
                if (deleted.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deleted.some(del => match(item, del))
                    );
                }

                // 2️⃣ Map to DTO + Attach Attributes
                let validationError = null;

                const itemsDto = currentSecondaryData.map((item, index) => {

                    const { Attributes, errors } =
                        methods.collectDetailAttributes(item);

                    // ❌ Attribute validation errors
                    if (errors.length > 0 && !validationError) {
                        validationError = `Row ${index + 1}: ${errors[0]}`;
                    }

                    // ❌ Return qty mismatch
                    if (
                        item.returnQuantity > 0 &&
                        Attributes.length !== Number(item.returnQuantity)
                    ) {
                        validationError =
                            `Row ${index + 1}: Selected attributes (${Attributes.length}) ` +
                            `must match Return Qty (${item.returnQuantity})`;
                    }

                    return {
                        id: item.id || null,
                        warehouseId: item.warehouseId,
                        productId: item.productId,

                        // 🔥 movement = returnQuantity
                        movement: Number(item.returnQuantity),

                        // 🔥 attach ONLY selected attributes
                        attributes: Attributes
                    };
                });

                return {
                    itemsDto,
                    deletedItems: deleted.map(x => ({ id: x.id })),
                    error: validationError
                };
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

        //            const response = state.id === ''
        //                ? await services.createMainData(state.returnDate, state.description, state.status, state.goodsReceiveId, StorageManager.getUserId())
        //                : state.deleteMode
        //                    ? await services.deleteMainData(state.id, StorageManager.getUserId())
        //                    : await services.updateMainData(state.id, state.returnDate, state.description, state.status, state.goodsReceiveId, StorageManager.getUserId());

        //            if (response.data.code === 200) {
        //                await methods.populateMainData();
        //                mainGrid.refresh();

        //                if (!state.deleteMode) {
        //                    state.mainTitle = 'Edit Purchase Return';
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

                    if (!validateForm()) return;

                    // 🔥 Collect grid + attributes
                    const {
                        itemsDto,
                        deletedItems,
                        error
                    } = methods.prepareSecondaryDataForSubmission();

                    if (error) {
                        Swal.fire('Validation Error', error, 'error');
                        return;
                    }

                    let payload;

                    // ===============================
                    // CREATE
                    // ===============================
                    if (state.id === '') {
                        payload = {
                            returnDate: state.returnDate,
                            status: state.status,
                            description: state.description,
                            goodsReceiveId: state.goodsReceiveId,
                            createdById: StorageManager.getUserId(),

                            // 🔥 IMPORTANT
                            items: itemsDto
                        };

                        var response = await services.createMainData(payload);
                    }

                    // ===============================
                    // UPDATE
                    // ===============================
                    else if (!state.deleteMode) {
                        payload = {
                            id: state.id,
                            returnDate: state.returnDate,
                            status: state.status,
                            description: state.description,
                            goodsReceiveId: state.goodsReceiveId,
                            updatedById: StorageManager.getUserId(),

                            // 🔥 IMPORTANT
                            items: itemsDto,
                            deletedItems: deletedItems.map(x => x.id)
                        };

                        var response = await services.updateMainData(payload);
                    }

                    // ===============================
                    // DELETE (UNCHANGED)
                    // ===============================
                    else {
                        var response = await services.deleteMainData(
                            state.id,
                            StorageManager.getUserId()
                        );
                    }

                    // ===============================
                    // RESPONSE HANDLING
                    // ===============================
                    if (response.data.code === 200) {

                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.id = response.data.content.data.id;
                            state.number = response.data.content.data.number;

                            await methods.populateSecondaryData(state.id);
                            secondaryGrid.refresh();
                            state.showComplexDiv = true;

                            Swal.fire({
                                icon: 'success',
                                title: 'Save Successful',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            mainModal.obj.hide();

                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Delete Successful',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            mainModal.obj.hide();
                            resetFormState();
                        }
                    }
                    else {
                        Swal.fire(
                            'Error',
                            response.data.message ?? 'Save failed',
                            'error'
                        );
                    }
                }
                catch (error) {
                    Swal.fire(
                        'Error',
                        error.response?.data?.message ?? 'Unexpected error',
                        'error'
                    );
                }
                finally {
                    state.isSubmitting = false;
                }
            }
        };
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['PurchaseReturns']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);

                await methods.populateGoodsReceiveListLookupData();
                await methods.populatePurchaseReturnStatusListLookupData();
                numberText.create();
                returnDatePicker.create();
                goodsReceiveListLookup.create();
                purchaseReturnStatusListLookup.create();

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
                        { field: 'goodsReceiveNumber', headerText: 'Goods Receive', width: 150, minWidth: 150 },
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
                        mainGrid.obj.autoFitColumns(['number', 'returnDate', 'goodsReceiveNumber', 'statusName', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Purchase Return';
                            resetFormState();
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
                                state.mainTitle = 'Edit Purchase Return';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.returnDate = selectedRecord.returnDate ? new Date(selectedRecord.returnDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.goodsReceiveId = selectedRecord.goodsReceiveId ?? '';
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
                                state.mainTitle = 'Delete Purchase Return?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.returnDate = selectedRecord.returnDate ? new Date(selectedRecord.returnDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.goodsReceiveId = selectedRecord.goodsReceiveId ?? '';
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
                                window.open('/PurchaseReturns/PurchaseReturnPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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

    //    const secondaryGrid = {
    //        obj: null,
    //        create: async (dataSource) => {
    //            secondaryGrid.obj = new ej.grids.Grid({
    //                height: 400,
    //                dataSource: dataSource,
    //                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
    //                allowFiltering: false,
    //                allowSorting: true,
    //                allowSelection: true,
    //                allowGrouping: false,
    //                allowTextWrap: true,
    //                allowResizing: true,
    //                allowPaging: false,
    //                allowExcelExport: true,
    //                filterSettings: { type: 'CheckBox' },
    //                sortSettings: { columns: [{ field: 'warehouseName', direction: 'Descending' }] },
    //                pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
    //                selectionSettings: { persistSelection: true, type: 'Single' },
    //                autoFit: false,
    //                showColumnMenu: false,
    //                gridLines: 'Horizontal',
    //                columns: [
    //                    { type: 'checkbox', width: 60 },
    //                    {
    //                        field: 'id', isPrimaryKey: true, headerText: 'Id', visible:
    //                            false
    //                    },
    //                    {
    //                        field: "pluCode",
    //                        headerText: "PLU Code",
    //                        width: 140,
    //                        editType: "stringedit",
    //                        validationRules: { required: true },

    //                        edit: {
    //                            create: () => {
    //                                let pluElem = document.createElement("input");
    //                                return pluElem;
    //                            },
    //                            read: () => pluObj?.value,
    //                            destroy: () => pluObj?.destroy(),

    //                            write: (args) => {
    //                                pluObj = new ej.inputs.TextBox({
    //                                    value: args.rowData.pluCode ?? "",
    //                                    placeholder: "Enter 5+ characters"
    //                                });

    //                                pluObj.appendTo(args.element);

    //                                const inputElement = pluObj.element;

    //                                inputElement.addEventListener('keydown', (e) => {
    //                                    const key = e.key;
    //                                    const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
    //                                        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

    //                                    if (!isValidKey) {
    //                                        e.preventDefault();
    //                                        console.log('❌ Invalid character blocked:', key);
    //                                    }
    //                                });

    //                                inputElement.addEventListener('keyup', async (e) => {
    //                                    const enteredPLU = inputElement.value?.trim() ?? "";

    //                                    console.log('⬆️ KEYUP Event - PLU:', getProductIdByPLUenteredPLU, 'Length:', enteredPLU.length);

    //                                    if (enteredPLU.length < 5) {
    //                                        console.log('⏳ Waiting for more characters... (' + enteredPLU.length + '/5)');
    //                                        return;
    //                                    }

    //                                    try {
    //                                        console.log('📡 Calling API for PLU:', enteredPLU);
    //                                        const result = await services.getProductIdByPLU(enteredPLU);
    //                                        const productId = result?.data?.content?.productId;

    //                                        if (!productId) {
    //                                            Swal.fire({
    //                                                icon: 'warning',
    //                                                title: 'Invalid PLU',
    //                                                text: 'No product found for this PLU code',
    //                                                timer: 2000,
    //                                                showConfirmButton: false
    //                                            });
    //                                            console.log('❌ No product found for PLU:', enteredPLU);
    //                                            return;
    //                                        }

    //                                        console.log('✅ Product found - ID:', productId);

    //                                        args.rowData.productId = productId;

    //                                        if (productObj) {
    //                                            productObj.value = productId;
    //                                            productObj.dataBind();
    //                                            productObj.change({ value: productId });
    //                                            console.log('✅ Product dropdown updated with ID:', productId);
    //                                        }

    //                                    }
    //                                    catch (error) {
    //                                        console.error('❌ KEYUP Error:', error);
    //                                        Swal.fire({
    //                                            icon: 'error',
    //                                            title: 'Error',
    //                                            text: 'Failed to fetch product details',
    //                                            timer: 2000
    //                                        });
    //                                    }
    //                                });

    //                                inputElement.addEventListener('change', async (e) => {
    //                                    const enteredPLU = inputElement.value?.trim() ?? "";

    //                                    console.log('📝 CHANGE Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

    //                                    if (!enteredPLU || enteredPLU.length < 5) {
    //                                        console.log('❌ PLU too short, skipping API call');
    //                                        return;
    //                                    }

    //                                    try {
    //                                        console.log('📡 Calling API for PLU:', enteredPLU);
    //                                        const result = await services.getProductIdByPLU(enteredPLU);
    //                                        const productId = result?.data?.content?.productId;

    //                                        if (!productId) {
    //                                            Swal.fire({
    //                                                icon: 'warning',
    //                                                title: 'Invalid PLU',
    //                                                text: 'No product found for this PLU code',
    //                                                timer: 2000,
    //                                                showConfirmButton: false
    //                                            });
    //                                            console.log('❌ No product found for PLU:', enteredPLU);
    //                                            return;
    //                                        }

    //                                        console.log('✅ Product found - ID:', productId);

    //                                        args.rowData.productId = productId;

    //                                        if (productObj) {
    //                                            productObj.value = productId;
    //                                            productObj.dataBind();
    //                                            productObj.change({ value: productId });
    //                                            console.log('✅ Product dropdown updated with ID:', productId);
    //                                        }

    //                                    } catch (error) {
    //                                        console.error('❌ CHANGE Error:', error);
    //                                        Swal.fire({
    //                                            icon: 'error',
    //                                            title: 'Error',
    //                                            text: 'Failed to fetch product details',
    //                                            timer: 2000
    //                                        });
    //                                    }
    //                                });
    //                            }
    //                        }
    //                    },
    //                    {
    //                        field: 'productId',
    //                        headerText: 'Product',
    //                        width: 250,
    //                        validationRules: { required: true },
    //                        disableHtmlEncode: false,
    //                        valueAccessor: (field, data, column) => {
    //                            const product = state.productListLookupData.find(item => item.id === data[field]);
    //                            return product ? `${product.numberName}` : '';
    //                        },
    //                        editType: 'dropdownedit',
    //                        edit: {
    //                            create: () => {
    //                                const productElem = document.createElement('input');
    //                                return productElem;
    //                            },
    //                            read: () => {
    //                                return productObj.value;
    //                            },
    //                            destroy: function () {
    //                                productObj.destroy();
    //                            },
    //                            write: function (args) {
    //                                productObj = new ej.dropdowns.DropDownList({
    //                                    dataSource: state.productListLookupData,
    //                                    fields: { value: 'id', text: 'numberName' },
    //                                    value: args.rowData.productId,
    //                                    change: function (e) {
    //                                        if (movementObj) {
    //                                            movementObj.value = 1;
    //                                        }
    //                                    },
    //                                    placeholder: 'Select a Product',
    //                                    floatLabelType: 'Never'
    //                                });
    //                                productObj.appendTo(args.element);
    //                            }
    //                        }
    //                    },
    //                    {
    //                        field: 'orderQuantity',
    //                        headerText: 'Order Qty',
    //                        width: 140,
    //                        textAlign: 'Right',
    //                        allowEditing: false,
    //                        type: 'number',
    //                        format: 'N2'
    //                    },

    //                    // ✅ RETURN QTY (USER ENTERED)
    //                    {
    //                        field: 'returnQuantity',
    //                        headerText: 'Return Qty',
    //                        width: 140,
    //                        textAlign: 'Right',
    //                        type: 'number',
    //                        format: 'N2',
    //                        validationRules: {
    //                            required: true,
    //                            custom: [
    //                                (args) => {
    //                                    const row = args.rowData;
    //                                    return args.value > 0 && args.value <= row.orderQuantity;
    //                                },
    //                                'Return Qty must be > 0 and ≤ Order Qty'
    //                            ]
    //                        },
    //                        edit: {
    //                            create: () => document.createElement('input'),
    //                            read: () => returnQtyObj.value,
    //                            destroy: () => returnQtyObj.destroy(),
    //                            write: (args) => {
    //                                returnQtyObj = new ej.inputs.NumericTextBox({
    //                                    value: args.rowData.returnQuantity || null,
    //                                    min: 0,
    //                                    max: args.rowData.orderQuantity,
    //                                    decimals: 2,
    //                                    placeholder: 'Enter Qty'
    //                                });
    //                                returnQtyObj.appendTo(args.element);
    //                            }
    //                        }
    //                    },
    //                    {
    //                        field: 'details',
    //                        headerText: 'Attributes',
    //                        width: 120,
    //                        disableHtmlEncode: false,

    //                        valueAccessor: (field, data) => {
    //                            const product = state.productListLookupData.find(p => p.id === data.productId);
    //                            if (!product) return '';
    //                            debugger;
    //                            const canShow =
    //                                product.imei1 || product.imei2 || product.serviceNo;

    //                            if (!canShow) return '';   // hide link, not column

    //                            return `
    //    <a href="#" class="view-details" data-id="${data?.purchaseOrderItemId}">
    //        Attributes
    //    </a>
    //`;
    //                        },


    //                        // Needed to allow HTML inside cell
    //                        allowEditing: false
    //                    },

    //                ],
    //                toolbar: [
    //                    'ExcelExport',
    //                    { type: 'Separator' },
    //                    'Add', 'Edit', 'Delete', 'Update', 'Cancel',
    //                ],
    //                beforeDataBound: () => { },
    //                dataBound: function () { },
    //                excelExportComplete: () => { },
    //                rowSelected: () => {
    //                    if (secondaryGrid.obj.getSelectedRecords().length == 1) {
    //                        secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
    //                    } else {
    //                        secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
    //                    }
    //                },
    //                rowDeselected: () => {
    //                    if (secondaryGrid.obj.getSelectedRecords().length == 1) {
    //                        secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
    //                    } else {
    //                        secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
    //                    }
    //                },
    //                rowSelecting: () => {
    //                    if (secondaryGrid.obj.getSelectedRecords().length) {
    //                        secondaryGrid.obj.clearSelection();
    //                    }
    //                },
    //                toolbarClick: (args) => {
    //                    if (args.item.id === 'SecondaryGrid_excelexport') {
    //                        secondaryGrid.obj.excelExport();
    //                    }
    //                },
    //                actionComplete: async (args) => {
    //                    if (args.requestType === 'save' && args.action === 'add') {
    //                        try {
    //                            const response = await services.createSecondaryData(state.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
    //                            await methods.populateSecondaryData(state.id);
    //                            secondaryGrid.refresh();
    //                            if (response.data.code === 200) {
    //                                Swal.fire({
    //                                    icon: 'success',
    //                                    title: 'Save Successful',
    //                                    timer: 2000,
    //                                    showConfirmButton: false
    //                                });
    //                            } else {
    //                                Swal.fire({
    //                                    icon: 'error',
    //                                    title: 'Save Failed',
    //                                    text: response.data.message ?? 'Please check your data.',
    //                                    confirmButtonText: 'Try Again'
    //                                });
    //                            }
    //                        } catch (error) {
    //                            Swal.fire({
    //                                icon: 'error',
    //                                title: 'An Error Occurred',
    //                                text: error.response?.data?.message ?? 'Please try again.',
    //                                confirmButtonText: 'OK'
    //                            });
    //                        }
    //                    }
    //                    if (args.requestType === 'save' && args.action === 'edit') {
    //                        try {
    //                            const response = await services.updateSecondaryData(args.data.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
    //                            await methods.populateSecondaryData(state.id);
    //                            secondaryGrid.refresh();
    //                            if (response.data.code === 200) {
    //                                Swal.fire({
    //                                    icon: 'success',
    //                                    title: 'Update Successful',
    //                                    timer: 2000,
    //                                    showConfirmButton: false
    //                                });
    //                            } else {
    //                                Swal.fire({
    //                                    icon: 'error',
    //                                    title: 'Update Failed',
    //                                    text: response.data.message ?? 'Please check your data.',
    //                                    confirmButtonText: 'Try Again'
    //                                });
    //                            }
    //                        } catch (error) {
    //                            Swal.fire({
    //                                icon: 'error',
    //                                title: 'An Error Occurred',
    //                                text: error.response?.data?.message ?? 'Please try again.',
    //                                confirmButtonText: 'OK'
    //                            });
    //                        }
    //                    }
    //                    if (args.requestType === 'delete') {
    //                        try {
    //                            const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
    //                            await methods.populateSecondaryData(state.id);
    //                            secondaryGrid.refresh();
    //                            if (response.data.code === 200) {
    //                                Swal.fire({
    //                                    icon: 'success',
    //                                    title: 'Delete Successful',
    //                                    timer: 2000,
    //                                    showConfirmButton: false
    //                                });
    //                            } else {
    //                                Swal.fire({
    //                                    icon: 'error',
    //                                    title: 'Delete Failed',
    //                                    text: response.data.message ?? 'Please check your data.',
    //                                    confirmButtonText: 'Try Again'
    //                                });
    //                            }
    //                        } catch (error) {
    //                            Swal.fire({
    //                                icon: 'error',
    //                                title: 'An Error Occurred',
    //                                text: error.response?.data?.message ?? 'Please try again.',
    //                                confirmButtonText: 'OK'
    //                            });
    //                        }
    //                    }
    //                    methods.refreshSummary();
    //                },
    //                queryCellInfo: (args) => {
    //                    if (args.column.field === 'details') {
    //                        const link = args.cell.querySelector('.view-details');

    //                        if (link) {
    //                            link.addEventListener('click', (e) => {
    //                                e.preventDefault();

    //                                // 1. Get the Syncfusion Row Object
    //                                const rowElement = e.currentTarget.closest('.e-row');
    //                                const rowIndex = rowElement.rowIndex;
    //                                const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];

    //                                // 2. Extract the actual data (Syncfusion stores it in .data)
    //                                const rowData = rowObj.data;

    //                                // 3. Pass the actual data object to the modal opener
    //                                methods.openDetailModal(rowIndex, rowData);
    //                            });
    //                        }
    //                    }
    //                },

    //            });
    //            secondaryGrid.obj.appendTo(secondaryGridRef.value);

    //        },
    //        refresh: () => {
    //            secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
    //        }
        //    };

        const secondaryGrid = {
            obj: null,

            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource,
                    editSettings: {
                        allowEditing: true,
                        allowAdding: true,
                        allowDeleting: true,
                        showDeleteConfirmDialog: true,
                        mode: 'Normal',
                        allowEditOnDblClick: true
                    },
                    allowSorting: true,
                    allowSelection: true,
                    allowTextWrap: true,
                    allowResizing: true,
                    gridLines: 'Horizontal',

                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },
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

                                    // 🔥 INPUT VALIDATION - Only alphanumeric
                                    inputElement.addEventListener('keydown', (e) => {
                                        const key = e.key;
                                        const isValidKey = /^[a-zA-Z0-9]$/.test(key) ||
                                            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);

                                        if (!isValidKey) {
                                            e.preventDefault();
                                            console.log('❌ Invalid character blocked:', key);
                                        }
                                    });

                                    // 🔥 KEYUP EVENT - Real-time validation
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
                                            args.rowData.orderQuantity = qty;
                                            args.rowData.maxReturnQty = qty;
                                            returnQtyObj = null;

                                            // 🔥 UPDATE PRODUCT DROPDOWN
                                            if (productObj) {
                                                productObj.value = productId;
                                                productObj.dataBind();
                                                productObj.change({ value: productId });
                                                console.log('✅ Product dropdown updated with ID:', productId);
                                            }

                                            // 🔥 UPDATE TOTAL STOCK - CRITICAL FIX
                                            const stock = methods.getProductStock?.(productId) || 0;
                                            if (orderQuantityObj) {
                                                orderQuantityObj.value = stock;
                                                orderQuantityObj.readOnly = true;
                                                console.log('✅ Total Stock updated:', stock);
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

                                    // 🔥 CHANGE EVENT - Final validation
                                    inputElement.addEventListener('change', async (e) => {
                                        debugger
                                        const enteredPLU = inputElement.value?.trim() ?? "";
                                        console.log('📝 CHANGE Event - PLU:', enteredPLU, 'Length:', enteredPLU.length);

                                        if (!enteredPLU || enteredPLU.length < 5) {
                                            console.log('❌ PLU too short, skipping API call');
                                            return;
                                        }

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

                                            args.rowData.productId = productId;
                                            if (productObj) {
                                                productObj.value = productId;
                                                productObj.dataBind();
                                                productObj.change({ value: productId });
                                            }

                                        } catch (error) {
                                            console.error('❌ CHANGE Error:', error);
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
                            disableHtmlEncode: false,
                            allowEditing: false,
                            valueAccessor: (field, data, column) => {
                                const product = state.productListLookupData.find(item => item.id === data[field]);
                                return product ? `${product.numberName}` : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    const productElem = document.createElement('input');
                                    return productElem;
                                },
                                read: () => {
                                    return productObj?.value;
                                },
                                destroy: function () {
                                    if (productObj) {
                                        productObj.destroy();
                                    }
                                },
                                write: function (args) {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        placeholder: 'Select a Product',
                                        floatLabelType: 'Never',
                                        enabled: false,

                                        change: function (e) {
                                            if (e.value) {
                                                console.log('📦 Product selected:', e.value);

                                                // 🔥 FETCH AND UPDATE TOTAL STOCK
                                                try {
                                                    const stock = methods.getProductStock?.(e.value) || 0;
                                                    console.log('Retrieved stock for product', e.value, ':', stock);

                                                    if (orderQuantityObj) {
                                                        orderQuantityObj.value = stock;
                                                        orderQuantityObj.readOnly = true;
                                                        console.log('✅ Total Stock updated to:', stock);
                                                    } else {
                                                        console.warn('⚠️ totalStockObj not initialized');
                                                    }
                                                } catch (error) {
                                                    console.error('❌ Error updating total stock:', error);
                                                }
                                            }
                                        }
                                    });
                                    productObj.appendTo(args.element);
                                }
                            }
                        },
                        // ============================================
                        // 🔥 TOTAL STOCK COLUMN (Read-only)
                        // ============================================
                        {
                            field: 'orderQuantity',
                            headerText: 'Order Quantity',
                            width: 150,
                            type: 'number',
                            format: 'N0',
                            textAlign: 'Right',
                            allowEditing: false,
                            editType: 'numericedit',
                            edit: {
                                create: () => {
                                    const orderQuantityElem = document.createElement('input');
                                    return orderQuantityElem;
                                },
                                read: () => {
                                    return orderQuantityObj ? orderQuantityObj.value : 0;
                                },
                                destroy: function () {
                                    if (orderQuantityObj) {
                                        orderQuantityObj.destroy();
                                        orderQuantityObj = null;
                                    }
                                },
                                write: function (args) {
                                    const currentStock = args.rowData.productId
                                        ? (methods.getProductStock?.(args.rowData.productId) || 0)
                                        : 0;

                                    orderQuantityObj = new ej.inputs.NumericTextBox({
                                        value: currentStock,
                                        format: 'N0',
                                        readOnly: true,
                                        enabled: false,
                                        cssClass: 'e-readonly-column'
                                    });
                                    orderQuantityObj.appendTo(args.element);
                                }
                            }
                        },

                        // ============================================
                        // 🔥 REQUEST STOCK COLUMN (Editable)
                        // ============================================
                        {
                            field: 'returnQuantity',
                            headerText: 'Return Qty',
                            width: 200,
                            validationRules: {
                                required: true,
                                custom: [(args) => args['value'] > 0, 'Must be a positive number and not zero']
                            },
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            edit: {
                                create: () => {
                                    const returnQuantityElem = document.createElement('input');
                                    return returnQuantityElem;
                                },
                                read: () => {
                                    return returnQuantityObj ? returnQuantityObj.value : null;
                                },
                                destroy: function () {
                                    if (returnQuantityObj) {
                                        returnQuantityObj.destroy();
                                        returnQuantityObj = null;
                                    }
                                },
                                write: function (args) {
                                    returnQuantityObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.requestStock ?? 0,
                                        min: 1,
                                        format: 'N2'
                                    });
                                    returnQuantityObj.appendTo(args.element);
                                }
                            }
                        },


                        // ===============================
                        // 🔥 ATTRIBUTES
                        // ===============================
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
                            }
                            ,

                            // Needed to allow HTML inside cell
                            allowEditing: false
                        },


                    ],

                    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],

                    queryCellInfo: (args) => {
                        if (args.column.field === 'details') {
                            const link = args.cell.querySelector('.view-details');
                            if (link) {
                                link.onclick = (e) => {
                                    e.preventDefault();

                                    // ✅ Get correct row index
                                    const rowIndex = args.row.rowIndex;

                                    // ✅ Get actual row data from grid
                                    const rowData =
                                        secondaryGrid.obj.getRowsObject()[rowIndex].data;

                                    // ✅ Call with BOTH parameters
                                    methods.openDetailModal(rowIndex, rowData);
                                };
                            }
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
            returnDateRef,
            goodsReceiveIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');