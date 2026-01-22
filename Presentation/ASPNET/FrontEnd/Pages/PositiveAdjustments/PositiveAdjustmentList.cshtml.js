const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            positiveAdjustmentStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            adjustmentDate: '',
            description: '',
            status: null,
            errors: {
                adjustmentDate: '',
                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            isAddMode: false

        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const adjustmentDateRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.adjustmentDate = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.adjustmentDate) {
                state.errors.adjustmentDate = 'Adjustment date is required.';
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
            state.adjustmentDate = '';
            state.description = '';
            state.status = null;
            state.errors = {
                adjustmentDate: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
        };

        //const adjustmentDatePicker = {
        //    obj: null,
        //    create: () => {
        //        adjustmentDatePicker.obj = new ej.calendars.DatePicker({
        //            placeholder: 'Select Date',
        //            format: 'yyyy-MM-dd',
        //            value: state.adjustmentDate ? new Date(state.adjustmentDate) : null,
        //            change: (e) => {
        //                state.adjustmentDate = e.value;
        //            }
        //        });
        //        adjustmentDatePicker.obj.appendTo(adjustmentDateRef.value);
        //    },
        //    refresh: () => {
        //        if (adjustmentDatePicker.obj) {
        //            adjustmentDatePicker.obj.value = state.adjustmentDate ? new Date(state.adjustmentDate) : null;
        //        }
        //    }
        //};

        const adjustmentDatePicker = {
            obj: null,

            create: () => {
                const defaultDate = state.adjustmentDate
                    ? new Date(state.adjustmentDate)
                    : new Date();

                adjustmentDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false   // 🔒 disabled
                });

                // ✅ CRITICAL: sync state manually
                state.adjustmentDate = defaultDate;

                adjustmentDatePicker.obj.appendTo(adjustmentDateRef.value);
            },

            refresh: () => {
                if (adjustmentDatePicker.obj) {
                    const date = state.adjustmentDate
                        ? new Date(state.adjustmentDate)
                        : new Date();

                    adjustmentDatePicker.obj.value = date;

                    // ✅ keep state in sync even though disabled
                    state.adjustmentDate = date;
                }
            }
        };

        //Vue.watch(
        //    () => state.adjustmentDate,
        //    (newVal, oldVal) => {
        //        adjustmentDatePicker.refresh();
        //        state.errors.adjustmentDate = '';
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

        const positiveAdjustmentStatusListLookup = {
            obj: null,
            create: () => {
                if (state.positiveAdjustmentStatusListLookupData && Array.isArray(state.positiveAdjustmentStatusListLookupData)) {
                    positiveAdjustmentStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.positiveAdjustmentStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    positiveAdjustmentStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (positiveAdjustmentStatusListLookup.obj) {
                    positiveAdjustmentStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                positiveAdjustmentStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/PositiveAdjustment/GetPositiveAdjustmentList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (adjustmentDate, description, status, createdById) => {
                try {
                    const response = await AxiosManager.post('/PositiveAdjustment/CreatePositiveAdjustment', {
                        adjustmentDate, description, status, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, adjustmentDate, description, status, updatedById) => {
                try {
                    const response = await AxiosManager.post('/PositiveAdjustment/UpdatePositiveAdjustment', {
                        id, adjustmentDate, description, status, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/PositiveAdjustment/DeletePositiveAdjustment', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getPositiveAdjustmentStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/PositiveAdjustment/GetPositiveAdjustmentStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (moduleId) => {
                try {
                    const response = await AxiosManager.get('/InventoryTransaction/PositiveAdjustmentGetInvenTransList?moduleId=' + moduleId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/PositiveAdjustmentCreateInvenTrans', {
                        moduleId, warehouseId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/PositiveAdjustmentUpdateInvenTrans', {
                        id, warehouseId, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/PositiveAdjustmentDeleteInvenTrans', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Product/GetProductList', {});
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
            }

        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    adjustmentDate: new Date(item.adjustmentDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populatePositiveAdjustmentStatusListLookupData: async () => {
                const response = await services.getPositiveAdjustmentStatusListLookupData();
                state.positiveAdjustmentStatusListLookupData = response?.data?.content?.data;
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
            populateSecondaryData: async (positiveAdjustmentId) => {
                try {
                    const response = await services.getSecondaryData(positiveAdjustmentId);
                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    }));
                    methods.refreshSummary();
                } catch (error) {
                    state.secondaryData = [];
                }
            },
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.adjustmentDate = '';
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
                // Save the index for the save operation later
                state.currentDetailRowIndex = RowIndex;

                // Use the rowData passed from the Grid directly
                if (!rowData) {
                    console.error("Row data not found!");
                    return;
                }

                // Clone the data for the active modal state
                state.activeDetailRow = JSON.parse(JSON.stringify(rowData));
                const activeRow = state.activeDetailRow;

                // 3. LOAD PRODUCT (Find product from your lookup list)
                const product = state.productListLookupData.find(p => p.id === activeRow.productId);
                if (!product) {
                    Swal.fire("Error", "Product not found. Please select a product in the grid first.", "error");
                    return;
                }

                const qty = parseFloat(activeRow.quantity || 0);
                if (qty <= 0) {
                    Swal.fire("Validation Error", "Please enter a quantity before adding attributes.", "error");
                    return;
                }


                // -------------------------------------------------------
                // 5. BUILD FIELDS BASED ON PRODUCT CONFIG
                // -------------------------------------------------------
                let fields = [];
                if (product.imei1) fields.push("imeI1");
                if (product.imei2) fields.push("imeI2");
                if (product.serviceNo) fields.push("serviceNo");

                const existingDetails = rowData.attributes || [];

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
                // 🔥 ADD THIS: Connect the Save Button
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
                        //input.readOnly = true;
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
                debugger;
                const rowIndex = state.currentDetailRowIndex;

                // 1. Validation check for the index
                if (rowIndex === undefined || rowIndex === null || rowIndex < 0) {
                    console.error("No valid row index found.");
                    return;
                }

                // 2. Collect entries from modal inputs
                let entries = [];
                const inputs = document.querySelectorAll(".detail-input");
                inputs.forEach(input => {
                    const i = input.dataset.index;
                    const f = input.dataset.field;
                    if (!entries[i]) entries[i] = {};

                    // Normalize field names
                    const normalizedField = f.toUpperCase() === "IMEI1" ? "IMEI1" :
                        f.toUpperCase() === "IMEI2" ? "IMEI2" :
                            f.toUpperCase() === "SERVICENO" ? "ServiceNo" : f;
                    entries[i][normalizedField] = input.value;
                });

                // 3. 🔥 GET DATA FROM GRID (Since state.secondaryData is empty)
                // This retrieves the actual row object currently displayed in the grid
                const gridRowData = secondaryGrid.obj.getRowsObject()[rowIndex].data;

                // 4. Attach the attributes to that object
                gridRowData.detailEntries = entries;

                // 5. Update the Grid UI and notify the manual batch tracker
                secondaryGrid.obj.updateRow(rowIndex, gridRowData);

                // 6. Sync back to state if you need it for prepareSecondaryDataForSubmission
                if (state.secondaryData.length > 0) {
                    state.secondaryData[rowIndex] = gridRowData;
                }

                // 7. Close Modal
                const modalEl = document.getElementById("detailModal");
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                Swal.fire({ icon: 'success', title: 'Attributes updated', timer: 1000, showConfirmButton: false });
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
                if (row.detailEntries.length !== row.quantity) {
                    errors.push("Received Quantity not matching with Attributes length");
                }

                return { Attributes, errors };
            },

            prepareSecondaryDataForSubmission: function () {
                const batchChanges = secondaryGrid.getBatchChanges();

                // 1. Merge current state with batch additions and edits
                let currentSecondaryData = state.id !== "" ? [...state.secondaryData] : [];

                const added = batchChanges.addedRecords || [];
                const changed = batchChanges.changedRecords || [];
                const deleted = batchChanges.deletedRecords || [];

                const match = (a, b) => (a.id && b.id ? a.id === b.id : false);

                // Apply edits from the grid
                changed.forEach(row => {
                    const idx = currentSecondaryData.findIndex(item => match(item, row));
                    if (idx !== -1) currentSecondaryData[idx] = { ...currentSecondaryData[idx], ...row };
                });

                // Add new rows to the working set
                currentSecondaryData.push(...added);

                // Remove deleted rows from the working set
                if (deleted.length > 0) {
                    currentSecondaryData = currentSecondaryData.filter(item =>
                        !deleted.some(del => match(item, del))
                    );
                }

                // 2. Map to DTO and Validate Quantity > 0
                let validationError = null;
                const itemsDto = currentSecondaryData.map((item, index) => {
                    const { Attributes, errors } = methods.collectDetailAttributes(item);

                    // 🔥 Validate: Quantity must be greater than 0
                    if (!item.quantity || item.quantity <= 0) {
                        validationError = `Row ${index + 1}: Quantity must be greater than 0.`;
                    }

                    return {
                        id: item.id || null,
                        warehouseId: StorageManager.getLocation(), //
                        productId: item.productId,
                        movement: item.quantity,
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

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Validate Header Form (Date and Status)
                    if (!validateForm()) {
                        state.isSubmitting = false;
                        return;
                    }

                    // Prepare Grid Data and check for quantity errors
                    const { itemsDto, deletedItems, error } = methods.prepareSecondaryDataForSubmission();

                    if (error) {
                        Swal.fire({ icon: 'error', title: 'Validation Error', text: error });
                        state.isSubmitting = false;
                        return;
                    }

                    const userId = StorageManager.getUserId();
                    let response;

                    // Execute Batch Create or Update
                    if (state.id === '') {
                        response = await AxiosManager.post('/PositiveAdjustment/CreatePositiveAdjustment', {
                            adjustmentDate: state.adjustmentDate,
                            description: state.description,
                            status: state.status,
                            createdById: userId,
                            items: itemsDto
                        });
                    } else if (state.deleteMode) {
                        response = await services.deleteMainData(state.id, userId);
                    } else {
                        response = await AxiosManager.post('/PositiveAdjustment/UpdatePositiveAdjustment', {
                            id: state.id,
                            adjustmentDate: state.adjustmentDate,
                            description: state.description,
                            status: state.status,
                            updatedById: userId,
                            items: itemsDto,
                            deletedItems: deletedItems
                        });
                    }

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();
                        secondaryGrid.clearBatchChanges(); // Reset manual tracking

                        Swal.fire({ icon: 'success', title: 'Save Successful', timer: 2000 });
                        if (state.deleteMode) mainModal.obj.hide();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: response.data.message });
                    }
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'System Error', text: 'An unexpected error occurred.' });
                } finally {
                    state.isSubmitting = false;
                }
            }
        };
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['PositiveAdjustments']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);

                await methods.populatePositiveAdjustmentStatusListLookupData();
                numberText.create();
                adjustmentDatePicker.create();
                positiveAdjustmentStatusListLookup.create();

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
                        { field: 'adjustmentDate', headerText: 'Adjustment Date', width: 150, format: 'yyyy-MM-dd' },
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
                        mainGrid.obj.autoFitColumns(['number', 'adjustmentDate', 'statusName', 'createdAtUtc']);
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
                            state.isAddMode = true;
                            state.mainTitle = 'Add Positive Adjustment';
                            resetFormState();
                            state.showComplexDiv = true;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            state.isAddMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Positive Adjustment';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.adjustmentDate = selectedRecord.adjustmentDate ? new Date(selectedRecord.adjustmentDate) : null;
                                state.description = selectedRecord.description ?? '';
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
                                state.mainTitle = 'Delete Positive Adjustment?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.adjustmentDate = selectedRecord.adjustmentDate ? new Date(selectedRecord.adjustmentDate) : null;
                                state.description = selectedRecord.description ?? '';
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
                                window.open('/PositiveAdjustments/PositiveAdjustmentPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
        //            allowExcelExport: true,
        //            filterSettings: { type: 'CheckBox' },
        //            sortSettings: { columns: [{ field: 'warehouseName', direction: 'Descending' }] },
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
        //                    field: 'warehouseId',
        //                    headerText: 'Warehouse',
        //                    width: 250,
        //                    validationRules: { required: true },
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        const warehouse = state.warehouseListLookupData.find(item => item.id === data[field]);
        //                        return warehouse ? `${warehouse.name}` : '';
        //                    },
        //                    editType: 'dropdownedit',
        //                    edit: {
        //                        create: () => {
        //                            const warehouseElem = document.createElement('input');
        //                            return warehouseElem;
        //                        },
        //                        read: () => {
        //                            return warehouseObj.value;
        //                        },
        //                        destroy: function () {
        //                            warehouseObj.destroy();
        //                        },
        //                        write: function (args) {
        //                            warehouseObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.warehouseListLookupData,
        //                                fields: { value: 'id', text: 'name' },
        //                                value: args.rowData.warehouseId,
        //                                placeholder: 'Select a Warehouse',
        //                                floatLabelType: 'Never'
        //                            });
        //                            warehouseObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 250,
        //                    validationRules: { required: true },
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        const product = state.productListLookupData.find(item => item.id === data[field]);
        //                        return product ? `${product.numberName}` : '';
        //                    },
        //                    editType: 'dropdownedit',
        //                    edit: {
        //                        create: () => {
        //                            const productElem = document.createElement('input');
        //                            return productElem;
        //                        },
        //                        read: () => {
        //                            return productObj.value;
        //                        },
        //                        destroy: function () {
        //                            productObj.destroy();
        //                        },
        //                        write: function (args) {
        //                            productObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.productListLookupData,
        //                                fields: { value: 'id', text: 'numberName' },
        //                                value: args.rowData.productId,
        //                                change: function (e) {
        //                                    if (movementObj) {
        //                                        movementObj.value = 1;
        //                                    }
        //                                },
        //                                placeholder: 'Select a Product',
        //                                floatLabelType: 'Never'
        //                            });
        //                            productObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'movement',
        //                    headerText: 'Movement',
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
        //                            const movementElem = document.createElement('input');
        //                            return movementElem;
        //                        },
        //                        read: () => {
        //                            return movementObj.value;
        //                        },
        //                        destroy: function () {
        //                            movementObj.destroy();
        //                        },
        //                        write: function (args) {
        //                            movementObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.movement ?? 0,
        //                            });
        //                            movementObj.appendTo(args.element);
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
        //            actionComplete: async (args) => {
        //                if (args.requestType === 'save' && args.action === 'add') {
        //                    try {
        //                        const response = await services.createSecondaryData(state.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Save Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Save Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                if (args.requestType === 'save' && args.action === 'edit') {
        //                    try {
        //                        const response = await services.updateSecondaryData(args.data.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Update Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Update Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                if (args.requestType === 'delete') {
        //                    try {
        //                        const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
        //                        await methods.populateSecondaryData(state.id);
        //                        secondaryGrid.refresh();
        //                        if (response.data.code === 200) {
        //                            Swal.fire({
        //                                icon: 'success',
        //                                title: 'Delete Successful',
        //                                timer: 2000,
        //                                showConfirmButton: false
        //                            });
        //                        } else {
        //                            Swal.fire({
        //                                icon: 'error',
        //                                title: 'Delete Failed',
        //                                text: response.data.message ?? 'Please check your data.',
        //                                confirmButtonText: 'Try Again'
        //                            });
        //                        }
        //                    } catch (error) {
        //                        Swal.fire({
        //                            icon: 'error',
        //                            title: 'An Error Occurred',
        //                            text: error.response?.data?.message ?? 'Please try again.',
        //                            confirmButtonText: 'OK'
        //                        });
        //                    }
        //                }
        //                methods.refreshSummary();
        //            }
        //        });
        //        secondaryGrid.obj.appendTo(secondaryGridRef.value);

        //    },
        //    refresh: () => {
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

                                        }
                                        catch (error) {
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

                                            //if (numberObj) numberObj.value = selectedProduct.number;

                                           
                                            if (quantityObj) {
                                                quantityObj.value = 1;
                                            }
                                        }
                                    });

                                    productObj.appendTo(args.element);
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
                                                                                  }
                                    });
                                    quantityObj.appendTo(args.element);
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
            adjustmentDateRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');