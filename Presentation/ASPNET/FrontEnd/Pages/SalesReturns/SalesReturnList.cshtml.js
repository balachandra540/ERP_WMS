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
            totalMovementFormatted: '0.00',
            isAddMode : false,
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
            //state.returnDate = '';
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
                const defaultDate = state.returnDate
                    ? new Date(state.returnDate)
                    : new Date();
                returnDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false,
                    change: (e) => {
                        state.returnDate = e.value;
                    }
                });
                state.returnDate = defaultDate;
                returnDatePicker.obj.appendTo(returnDateRef.value);
            },
            refresh: () => {
                if (returnDatePicker.obj) {
                    const Date = state.returnDate
                        ? new Date(state.returnDate)
                        : new Date();
                    state.returnDate = Date;

                    returnDatePicker.obj.value = Date;
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
            getInventoryTransactionAttributes: async (moduleId, productId) => {
                try {
                    const response = await AxiosManager.get(
                        '/GoodsReceive/GetInventoryTransactionAttributes',
                        {
                            params: {
                                moduleId: moduleId,
                                productId: productId
                            }
                        }
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
    //        openDetailModal: async (RowIndex, rowData) => {
    //            // Save the index for the save operation later
    //            state.currentDetailRowIndex = RowIndex;

    //            // Use the rowData passed from the Grid directly
    //            if (!rowData) {
    //                console.error("Row data not found!");
    //                return;
    //            }

    //            // Clone the data for the active modal state
    //            state.activeDetailRow = JSON.parse(JSON.stringify(rowData));
    //            const activeRow = state.activeDetailRow;

    //            // 3. LOAD PRODUCT (Find product from your lookup list)
    //            const product = state.productListLookupData.find(p => p.id === activeRow.productId);
    //            if (!product) {
    //                Swal.fire("Error", "Product not found. Please select a product in the grid first.", "error");
    //                return;
    //            }

    //            const qty = parseFloat(activeRow.quantity || 0);
    //            if (qty <= 0) {
    //                Swal.fire("Validation Error", "Please enter a quantity before adding attributes.", "error");
    //                return;
    //            }


    //            // -------------------------------------------------------
    //            // 5. BUILD FIELDS BASED ON PRODUCT CONFIG
    //            // -------------------------------------------------------
    //            let fields = [];
    //            if (product.imei1) fields.push("imeI1");
    //            if (product.imei2) fields.push("imeI2");
    //            if (product.serviceNo) fields.push("serviceNo");

    //            const existingDetails = rowData.attributes || [];

    //            // -------------------------------------------------------
    //            // 6. BUILD HTML TABLE
    //            // -------------------------------------------------------
    //            let html = `
    //    <table class="table table-bordered table-sm">
    //        <thead>
    //            <tr>
    //                ${fields.map(f => `<th>${f}</th>`).join("")}
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
    //                <input type="text"
    //                       class="form-control detail-input"
    //                       data-index="${i}"
    //                       data-field="${field}"
    //                       value="${val}">
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
    //            // 🔥 ADD THIS: Connect the Save Button
    //            const saveBtn = document.getElementById("detailSaveBtn");
    //            if (saveBtn) {
    //                saveBtn.onclick = (e) => {
    //                    e.preventDefault();
    //                    methods.saveDetailEntries();
    //                };
    //            }
    //            await methods.attachDetailInputEvents(product);
    //            const modalEl = document.getElementById("detailModal");
    //            const modal = new bootstrap.Modal(modalEl);
    //            modal.show();
            //        },

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

    //        openDetailModal: async (RowIndex, rowData) => {
    //            state.currentDetailRowIndex = RowIndex;

    //            if (!rowData) {
    //                console.error("Row data not found!");
    //                return;
    //            }

    //            state.activeDetailRow = JSON.parse(JSON.stringify(rowData));
    //            const activeRow = state.activeDetailRow;

    //            // 🔹 Find product
    //            const product = state.productListLookupData.find(p => p.id === activeRow.productId);
    //            if (!product) {
    //                Swal.fire("Error", "Product not found. Please select a product in the grid first.", "error");
    //                return;
    //            }

    //            const qty = parseInt(activeRow.orderQuantity || 0);
    //            if (qty <= 0) {
    //                Swal.fire("Validation Error", "Please enter a orderQuantity before adding attributes.", "error");
    //                return;
    //            }

    //            // -------------------------------------------------------
    //            // 🔹 Build fields based on product config
    //            // -------------------------------------------------------
    //            let fields = [];
    //            if (product.imei1) fields.push("imeI1");
    //            if (product.imei2) fields.push("imeI2");
    //            if (product.serviceNo) fields.push("serviceNo");

    //            const existingDetails = rowData.attributes || [];

    //            // -------------------------------------------------------
    //            // 🔹 Build HTML Table (WITH CHECKBOX)
    //            // -------------------------------------------------------
    //            let html = `
    //    <table class="table table-bordered table-sm">
    //        <thead>
    //            <tr>
    //                <th style="width:60px;">✔</th>
    //                ${fields.map(f => `<th>${f}</th>`).join("")}
    //            </tr>
    //        </thead>
    //        <tbody>
    //`;

    //            for (let i = 0; i < qty; i++) {
    //                const row = existingDetails[i] || {};
    //                const checked = row.isChecked ? "checked" : "";

    //                html += `<tr>`;

    //                // ✅ Checkbox column
    //                html += `
    //        <td class="text-center">
    //            <input type="checkbox"
    //                   class="form-check-input detail-checkbox"
    //                   data-index="${i}"
    //                   ${checked}>
    //        </td>
    //    `;

    //                // 🔹 Dynamic fields
    //                fields.forEach(field => {
    //                    const val = row[field] || "";
    //                    html += `
    //            <td>
    //                <input type="text"
    //                       class="form-control detail-input"
    //                       data-index="${i}"
    //                       data-field="${field}"
    //                       value="${val}">
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

    //            // 🔥 Save Button
    //            const saveBtn = document.getElementById("detailSaveBtn");
    //            if (saveBtn) {
    //                saveBtn.onclick = (e) => {
    //                    e.preventDefault();
    //                    methods.saveDetailEntries();
    //                };
    //            }

    //            await methods.attachDetailInputEvents(product);

    //            const modalEl = document.getElementById("detailModal");
    //            const modal = new bootstrap.Modal(modalEl);
    //            modal.show();
    //        },

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
            //saveDetailEntries: () => {
            //    debugger;
            //    const rowIndex = state.currentDetailRowIndex;

            //    // 1. Validation check for the index
            //    if (rowIndex === undefined || rowIndex === null || rowIndex < 0) {
            //        console.error("No valid row index found.");
            //        return;
            //    }

            //    // 2. Collect entries from modal inputs
            //    let entries = [];
            //    const inputs = document.querySelectorAll(".detail-input");
            //    inputs.forEach(input => {
            //        const i = input.dataset.index;
            //        const f = input.dataset.field;
            //        if (!entries[i]) entries[i] = {};

            //        // Normalize field names
            //        const normalizedField = f.toUpperCase() === "IMEI1" ? "IMEI1" :
            //            f.toUpperCase() === "IMEI2" ? "IMEI2" :
            //                f.toUpperCase() === "SERVICENO" ? "ServiceNo" : f;
            //        entries[i][normalizedField] = input.value;
            //    });

            //    // 3. 🔥 GET DATA FROM GRID (Since state.secondaryData is empty)
            //    // This retrieves the actual row object currently displayed in the grid
            //    const gridRowData = secondaryGrid.obj.getRowsObject()[rowIndex].data;

            //    // 4. Attach the attributes to that object
            //    gridRowData.detailEntries = entries;

            //    // 5. Update the Grid UI and notify the manual batch tracker
            //    secondaryGrid.obj.updateRow(rowIndex, gridRowData);

            //    // 6. Sync back to state if you need it for prepareSecondaryDataForSubmission
            //    if (state.secondaryData.length > 0) {
            //        state.secondaryData[rowIndex] = gridRowData;
            //    }

            //    // 7. Close Modal
            //    const modalEl = document.getElementById("detailModal");
            //    const modal = bootstrap.Modal.getInstance(modalEl);
            //    if (modal) modal.hide();

            //    Swal.fire({ icon: 'success', title: 'Attributes updated', timer: 1000, showConfirmButton: false });
            //},
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
            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
                }

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

        //            // Ensure grid edit is committed
        //            await new Promise(resolve => setTimeout(resolve, 300));

        //            if (!validateForm()) {
        //                return;
        //            }

        //            // ✅ VALIDATION: returnQuantity must be >= 1
        //            const invalidRow = state.secondaryData.find(
        //                item => item.returnQuantity == null || Number(item.returnQuantity) < 1
        //            );

        //            if (invalidRow) {
        //                Swal.fire({
        //                    icon: 'warning',
        //                    title: 'Invalid Return Quantity',
        //                    text: 'Return Quantity must be 1 or greater for all items.'
        //                });
        //                return;
        //            }

        //            // ✅ Prepare secondary data
        //            const items = state.secondaryData.map(item => ({
        //                id: item.id || null,
        //                warehouseId: item.warehouseId,
        //                productId: item.productId,

        //                // ✅ movement = user-entered returnQuantity
        //                movement: Number(item.returnQuantity)
        //            }));

        //            const userId = StorageManager.getUserId();
        //            let response;

        //            if (state.deleteMode) {
        //                response = await services.deleteMainData(state.id, userId);

        //            } else if (state.id === '') {
        //                response = await services.createMainData(
        //                    state.returnDate,
        //                    state.description,
        //                    state.status,
        //                    state.deliveryOrderId,
        //                    items,
        //                    userId
        //                );

        //            } else {
        //                response = await services.updateMainData(
        //                    state.id,
        //                    state.returnDate,
        //                    state.description,
        //                    state.status,
        //                    state.deliveryOrderId,
        //                    items,
        //                    userId
        //                );
        //            }

        //            if (response.data.code === 200) {

        //                await methods.populateMainData();
        //                mainGrid.refresh();

        //                if (!state.deleteMode) {
        //                    state.mainTitle = 'Edit Sales Return';
        //                    state.id = response?.data?.content?.data.id ?? '';
        //                    state.number = response?.data?.content?.data.number ?? '';

        //                    // Reload secondary data with DB IDs
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
        //    }
        //};
        const handler = {

        handleSubmit: async function () {
            try {
                state.isSubmitting = true;

                await new Promise(resolve => setTimeout(resolve, 300));

                if (!validateForm()) return;

                // ❌ Return Quantity validation
                const invalidRow = state.secondaryData.find(
                    r => !r.returnQuantity || Number(r.returnQuantity) < 1
                );

                if (invalidRow) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Invalid Return Quantity',
                        text: 'Return Quantity must be at least 1 for all rows.'
                    });
                    return;
                }

                // 🔥 Prepare payload WITH attributes
                const {
                    itemsDto,
                    deletedItems,
                    error
                } = methods.prepareSecondaryDataForSubmission();

                if (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: error
                    });
                    return;
                }

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
                        itemsDto,
                        userId
                    );

                } else {
                    response = await services.updateMainData(
                        state.id,
                        state.returnDate,
                        state.description,
                        state.status,
                        state.deliveryOrderId,
                        itemsDto,
                        userId
                    );
                }

                if (response.data.code === 200) {

                    await methods.populateMainData();
                    mainGrid.refresh();

                    Swal.fire({
                        icon: 'success',
                        title: 'Saved Successfully',
                        timer: 1500,
                        showConfirmButton: false
                    });

                } else {
                    throw new Error(response.data.message);
                }

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Save Failed',
                    text: error.message || 'Please try again.'
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
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);

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
                            state.isAddMode = false;

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
                            state.isAddMode = false;
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
                            }
                            ,

                            // Needed to allow HTML inside cell
                            allowEditing: false
                        },

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
                    queryCellInfo: (args) => {
                        if (args.column.field === 'details') {
                            const link = args.cell.querySelector('.view-details');

                            if (link) {
                                link.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    // 1. Get the Syncfusion Row Object
                                    const rowElement = e.currentTarget.closest('.e-row');
                                    const rowIndex = rowElement.rowIndex;
                                    const rowObj = secondaryGrid.obj.getRowsObject()[rowIndex];

                                    // 2. Extract the actual data (Syncfusion stores it in .data)
                                    const rowData = rowObj.data;

                                    // 3. Pass the actual data object to the modal opener
                                    methods.openDetailModal(rowIndex, rowData);
                                });
                            }
                        }
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