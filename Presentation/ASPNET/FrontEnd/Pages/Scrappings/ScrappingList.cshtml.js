const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            warehouseListLookupData: [],
            scrappingStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            scrappingDate: '',
            description: '',
            warehouseId: null,
            status: null,
            locationId :'',
            errors: {
                scrappingDate: '',
                warehouseId: '',
                status: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00'
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const scrappingDateRef = Vue.ref(null);
        const warehouseIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.scrappingDate = '';
            state.errors.warehouseId = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.scrappingDate) {
                state.errors.scrappingDate = 'Scrapping date is required.';
                isValid = false;
            }
            if (!state.warehouseId) {
                state.errors.warehouseId = 'Warehouse is required.';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }
            // ✅ End edit mode to commit pending changes
            if (secondaryGrid.obj.isEdit) {
                secondaryGrid.obj.endEdit();
            }

            // Get only EDITS made in grid (not additions)
            const batchChanges = secondaryGrid.getBatchChanges ? secondaryGrid.getBatchChanges() : {
                changedRecords: [],
                deletedRecords: [],
                addedRecords: []
            };
            console.log('Validation - Batch Changes:', batchChanges);

            // Build working dataset
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
            //currentSecondaryData.push(...addedRecords);

            console.log("Final data for validation:", currentSecondaryData);

            // --- NO ITEMS IN GRID ---
            if (currentSecondaryData.length === 0) {
                state.errors.gridItems.push('At least one item must be added to the order.');
                isValid = false;
            }

            // --- ROW VALIDATION (only your allowed fields) ---
            currentSecondaryData.forEach((record, index) => {

                //if (!record.pluCode || record.pluCode.length < 5) {
                //    state.errors.gridItems.push(`Row ${index + 1}: PLU code must be at least 5 characters.`);
                //    isValid = false;
                //}

                if (!record.productId) {
                    state.errors.gridItems.push(`Row ${index + 1}: Product is required.`);
                    isValid = false;
                }

            });

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.scrappingDate = '';
            state.description = '';
            state.warehouseId = null;
            state.status = null;
            state.errors = {
                scrappingDate: '',
                warehouseId: '',
                status: ''
            };
            state.secondaryData = [];
        };

        const scrappingDatePicker = {
            obj: null,
            create: () => {
                scrappingDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date',
                    format: 'yyyy-MM-dd',
                    value: state.scrappingDate ? new Date(state.scrappingDate) : null,
                    change: (e) => {
                        state.scrappingDate = e.value;
                    }
                });
                scrappingDatePicker.obj.appendTo(scrappingDateRef.value);
            },
            refresh: () => {
                if (scrappingDatePicker.obj) {
                    scrappingDatePicker.obj.value = state.scrappingDate ? new Date(state.scrappingDate) : null;
                }
            }
        };

        Vue.watch(
            () => state.scrappingDate,
            (newVal, oldVal) => {
                scrappingDatePicker.refresh();
                state.errors.scrappingDate = '';
            }
        );

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        const warehouseListLookup = {
            obj: null,
            create: () => {
                if (state.warehouseListLookupData && Array.isArray(state.warehouseListLookupData)) {
                    warehouseListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.warehouseListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Warehouse',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.warehouseListLookupData, query);
                        },
                        change: (e) => {
                            state.warehouseId = e.value;
                        }
                    });
                    warehouseListLookup.obj.appendTo(warehouseIdRef.value);
                }
            },
            refresh: () => {
                if (warehouseListLookup.obj) {
                    warehouseListLookup.obj.value = state.warehouseId;
                }
            }
        };

        Vue.watch(
            () => state.warehouseId,
            (newVal, oldVal) => {
                warehouseListLookup.refresh();
                state.errors.warehouseId = '';
            }
        );

        const statusListLookup = {
            obj: null,
            create: () => {
                if (state.scrappingStatusListLookupData && Array.isArray(state.scrappingStatusListLookupData)) {
                    statusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.scrappingStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    statusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (statusListLookup.obj) {
                    statusListLookup.obj.value = state.status;
                }
            }
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                statusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/Scrapping/GetScrappingList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (scrappingDate, description, status, warehouseId, createdById, items) => {
                try {
                    const response = await AxiosManager.post('/Scrapping/CreateScrapping', {
                        scrappingDate, description, status, warehouseId, createdById, items
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, scrappingDate, description, status, warehouseId, updatedById, items, deletedItems) => {
                try {
                    const response = await AxiosManager.post('/Scrapping/UpdateScrapping', {
                        id, scrappingDate, description, status, warehouseId, updatedById, items, deletedItems
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Scrapping/DeleteScrapping', {
                        id, deletedById
                    });
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
            getScrappingStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Scrapping/GetScrappingStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (moduleId) => {
                try {
                    const response = await AxiosManager.get('/InventoryTransaction/ScrappingGetInvenTransList?moduleId=' + moduleId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (moduleId, productId, movement, createdById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/ScrappingCreateInvenTrans', {
                        moduleId, productId, movement, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, productId, movement, updatedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/ScrappingUpdateInvenTrans', {
                        id, productId, movement, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/ScrappingDeleteInvenTrans', {
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
                    scrappingDate: new Date(item.scrappingDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateWarehouseListLookupData: async () => {
                const response = await services.getWarehouseListLookupData();
                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateScrappingStatusListLookupData: async () => {
                const response = await services.getScrappingStatusListLookupData();
                state.scrappingStatusListLookupData = response?.data?.content?.data;
            },
            populateSecondaryData: async (scrappingId) => {
                try {
                    debugger;
                    const response = await services.getSecondaryData(scrappingId);
                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    }));
                    methods.refreshSummary();
                } catch (error) {
                    state.secondaryData = [];
                }
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
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },

            onMainModalHidden: () => {
                state.errors.scrappingDate = '';
                state.errors.warehouseId = '';
                state.errors.status = '';
            },
            prepareSecondaryDataForSubmission: function () {

                const batchChanges = secondaryGrid.getBatchChanges ? secondaryGrid.getBatchChanges() : {
                    changedRecords: [],
                    deletedRecords: [],
                    addedRecords: []
                };
                let currentSecondaryData = [...state.secondaryData];

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
                    const { Attributes, errors } =
                        methods.collectDetailAttributes(item);
                    if (errors.length > 0) {
                        Swal.fire({
                            icon: "error",
                            title: "Validation Failed",
                            html: errors.join("<br>")
                        });
                        return;
                    }
                    // temporarily store attributes to use in DTO creation
                    item.__validatedAttributes = Attributes;
                    return {
                        id: item.id ?? null,
                        pluCode: item.pluCode ?? null,
                        productId: item.productId ?? null,
                        movement: item.movement ?? 0,
                        detailEntries: item.__validatedAttributes ?? []
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
                    //if (!item.pluCode || item.pluCode.length < 5) return false;
                    if (item.movement <= 0) return false;
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

            submitMainData: async () => {
                
                if (!validateForm()) {
                    state.isSubmitting = false;
                    return;
                }

                const { validItems, deletedRecords } = methods.prepareSecondaryDataForSubmission();


                // ----------------------------------------------------
                // Build Items DTO (Always convert PLU to integer)
                // ----------------------------------------------------
                //const itemsDto = validItems.map(item => ({
                //    Id: item.id || null,
                //    pluCode: Number(item.pluCode),   // ✔ FORCE INTEGER
                //    productId: item.productId,
                //    movement: item.movement,
                //    Attributes: JSON.parse(JSON.stringify(item.detailEntries)),
                //}));        

                const itemsDto = validItems.map(item => {
                    // 1️⃣ Decide attribute source
                    const attributesSource =
                        Array.isArray(item.detailEntries) && item.detailEntries.length > 0
                            ? item.detailEntries
                            : item.inventoryTransactionAttributesDetails?.[0]?.goodsReceiveItemDetails
                                ? [item.inventoryTransactionAttributesDetails[0].goodsReceiveItemDetails]
                                : [];

                    return {
                        Id: item.id || null,
                        pluCode: Number(item.pluCode),   // ✔ FORCE INTEGER
                        productId: item.productId,
                        movement: item.movement,
                        Attributes: JSON.parse(JSON.stringify(attributesSource)),
                    };
                });

                let response;

                try {

                    // -----------------------------
                    // CREATE
                    // -----------------------------
                    if (state.id === '') {

                        response = await services.createMainData(
                            state.scrappingDate,
                            state.description,
                            state.status,
                            state.warehouseId,
                            StorageManager.getUserId(),
                            itemsDto
                        );
                    }

                    // -----------------------------
                    // DELETE
                    // -----------------------------
                    else if (state.deleteMode) {

                        response = await services.deleteMainData(
                            state.id,
                            StorageManager.getUserId()
                        );
                    }

                    // -----------------------------
                    // UPDATE
                    // -----------------------------
                    else {

                        const deletedItemsDto = deletedRecords
                            .flat(Infinity)
                            .map(x => ({
                                Id: x.id || null
                            }));

                        response = await services.updateMainData(
                            state.id,
                            state.scrappingDate,
                            state.description,
                            state.status,
                            state.warehouseId,
                            StorageManager.getUserId(),
                            itemsDto,
                            deletedItemsDto
                        );
                    }

                    if (response.data.code === 200) {

                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            await methods.populateSecondaryData();
                            secondaryGrid.refresh();

                            state.mainTitle = 'Add Scrap List';
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

                    }
                    else {
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
                const qty = parseFloat(rowData.movement || 0);

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

                const existingDetails = rowData.inventoryTransactionAttributesDetails || [];

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
                        const val = existingDetails[i]?.goodsReceiveItemDetails?.[field] ?? "";

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

                //  Ensure styles exist
                methods.injectDetailStyles();

                const inputs = document.querySelectorAll(".detail-input");

                inputs.forEach(input => {

                    // ---------------------------
                    // KEYDOWN (restrict characters)
                    // ---------------------------
                    input.addEventListener("keydown", (e) => {
                        const field = input.dataset.field;
                        const key = e.key;

                        if (field === "imeI1" || field === "imeI2") {
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
                    const Keyhandler = async () => {
                        await methods.handleDetailValueChange(input, product);
                    };

                    input.addEventListener("keyup", Keyhandler);
                    input.addEventListener("change", Keyhandler);
                });
            },

            handleDetailValueChange: async (input, product) => {
                const value = input.value.trim();
                const field = input.dataset.field;
                const index = parseInt(input.dataset.index, 10);

                // ---------------------------
                // IMEI VALIDATION
                // ---------------------------
                if (field === "imeI1" || field === "imeI2") {

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

                if (field === "imeI1") imei1Value = value;
                if (field === "imeI2") imei2Value = value;
                if (field === "serviceNo") serviceNoValue = value;

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

                    //if (state.activeDetailRow.detailEntries[index][field]) return;

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
            saveDetailEntries: async () => {
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

                if (rowData.detailEntries.length !== rowData.movement) {
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
                if (row.detailEntries.length !== row.movement) {
                    errors.push("Received Quantity not matching with Attributes length");
                }

                return { Attributes, errors };
            },
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    const { isValid, response } = await methods.submitMainData();

                    //if (!isValid) {
                    //    return;
                    //}

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Scrapping';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            await methods.populateSecondaryData(state.id);
                            secondaryGrid.refresh();
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
                    }
                    else {
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
                await SecurityManager.authorizePage(['Scrappings']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden());


                await methods.populateWarehouseListLookupData();
                warehouseListLookup.create();
                await methods.populateScrappingStatusListLookupData();
                statusListLookup.create();
                scrappingDatePicker.create();
                numberText.create();

                await methods.populateProductListLookupData();

                await methods.populateSecondaryData();
                await secondaryGrid.create(state.secondaryData);

            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden());
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
                        { field: 'scrappingDate', headerText: 'Scrapping Date', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'warehouseName', headerText: 'Warehouse', width: 150, minWidth: 150 },
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
                        mainGrid.obj.autoFitColumns(['number', 'scrappingDate', 'warehouseName', 'statusName', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Scrapping';
                            resetFormState();
                            
                            state.secondaryData = [];

                            // Create new grid properly
                            if (secondaryGrid.obj == null) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.refresh();
                            }

                            state.showComplexDiv = true;
                            state.showComplexDiv = true;
                            mainModal.obj.show();

                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Scrapping';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.scrappingDate = selectedRecord.scrappingDate ? new Date(selectedRecord.scrappingDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.warehouseId = selectedRecord.warehouseId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = true;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Scrapping?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.scrappingDate = selectedRecord.scrappingDate ? new Date(selectedRecord.scrappingDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.warehouseId = selectedRecord.warehouseId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = false;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/Scrappings/ScrappingPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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

                                                try {
                                                    secondaryGrid.obj.setCellValue(
                                                        args.row.rowIndex,
                                                        'productId',
                                                        productId
                                                    );
                                                } catch (ex) { }
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

                                                try {
                                                    secondaryGrid.obj.setCellValue(
                                                        args.row.rowIndex,
                                                        'productId',
                                                        productId
                                                    );
                                                } catch (ex) { }
                                            }
                                            if (movementObj) 
                                                movementObj.value = 1

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

                                            if (movementObj) 
                                                movementObj.value = 1;
                                        }
                                    });

                                    productObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'movement',
                            headerText: 'Movement',
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
                                    movementElem = document.createElement('input');
                                    return movementElem;
                                },
                                read: () => {
                                    return movementObj.value;
                                },
                                destroy: function () {
                                    movementObj.destroy();
                                },
                                write: function (args) {
                                    movementObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.movement ?? 0,
                                    });
                                    movementObj.appendTo(movementElem);
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

                                return ` <a href="#" class="view-details">Attributes</a>`;
                            },

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
                            secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_edit'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['SecondaryGrid_edit'], false);
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
                        }
                    },
                    actionComplete: async (args) => {
                        if (args.requestType === 'save' && args.action === 'add') {

                            if (!secondaryGrid.manualBatchChanges) {
                                secondaryGrid.manualBatchChanges = {
                                    addedRecords: [],
                                    changedRecords: [],
                                    deletedRecords: []
                                };
                            }
                            // TRACK ADDED ROW
                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
                            console.log('✅ Row Added:', args.data);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
                        }

                        if (args.requestType === 'save' && args.action === 'edit') {
                            if (!secondaryGrid.manualBatchChanges) {
                                secondaryGrid.manualBatchChanges = {
                                    addedRecords: [],
                                    changedRecords: [],
                                    deletedRecords: []
                                };
                            }


                            // TRACK MODIFIED ROW (update if exists, else add)
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
                            if (!secondaryGrid.manualBatchChanges) {
                                secondaryGrid.manualBatchChanges = {
                                    addedRecords: [],
                                    changedRecords: [],
                                    deletedRecords: []
                                };
                            }

                            const index = secondaryGrid.manualBatchChanges.changedRecords.findIndex(
                                r => r.id === args.data?.id
                            );

                            // TRACK DELETED ROW
                            secondaryGrid.manualBatchChanges.deletedRecords.push(args.data[index]);
                            console.log('❌ Row Deleted:', args.data[index]);
                            console.log('📋 Current Batch Changes:', secondaryGrid.manualBatchChanges);
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
                                     const rowIndex = e.currentTarget.closest('.e-row').rowIndex;
                                    methods.openDetailModal(rowIndex);
                                });
                            }
                        }
                    },
                //    actionComplete: async (args) => {
                //        if (args.requestType === 'save' && args.action === 'add') {
                //            try {
                //                const response = await services.createSecondaryData(state.id, args.data.productId, args.data.movement, StorageManager.getUserId());
                //                await methods.populateSecondaryData(state.id);
                //                secondaryGrid.refresh();
                //                if (response.data.code === 200) {
                //                    Swal.fire({
                //                        icon: 'success',
                //                        title: 'Save Successful',
                //                        timer: 2000,
                //                        showConfirmButton: false
                //                    });
                //                } else {
                //                    Swal.fire({
                //                        icon: 'error',
                //                        title: 'Save Failed',
                //                        text: response.data.message ?? 'Please check your data.',
                //                        confirmButtonText: 'Try Again'
                //                    });
                //                }
                //            } catch (error) {
                //                Swal.fire({
                //                    icon: 'error',
                //                    title: 'An Error Occurred',
                //                    text: error.response?.data?.message ?? 'Please try again.',
                //                    confirmButtonText: 'OK'
                //                });
                //            }
                //        }
                //        if (args.requestType === 'save' && args.action === 'edit') {
                //            try {
                //                const response = await services.updateSecondaryData(args.data.id, args.data.productId, args.data.movement, StorageManager.getUserId());
                //                await methods.populateSecondaryData(state.id);
                //                secondaryGrid.refresh();
                //                if (response.data.code === 200) {
                //                    Swal.fire({
                //                        icon: 'success',
                //                        title: 'Update Successful',
                //                        timer: 2000,
                //                        showConfirmButton: false
                //                    });
                //                } else {
                //                    Swal.fire({
                //                        icon: 'error',
                //                        title: 'Update Failed',
                //                        text: response.data.message ?? 'Please check your data.',
                //                        confirmButtonText: 'Try Again'
                //                    });
                //                }
                //            } catch (error) {
                //                Swal.fire({
                //                    icon: 'error',
                //                    title: 'An Error Occurred',
                //                    text: error.response?.data?.message ?? 'Please try again.',
                //                    confirmButtonText: 'OK'
                //                });
                //            }
                //        }
                //        if (args.requestType === 'delete') {
                //            try {
                //                const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
                //                await methods.populateSecondaryData(state.id);
                //                secondaryGrid.refresh();
                //                if (response.data.code === 200) {
                //                    Swal.fire({
                //                        icon: 'success',
                //                        title: 'Delete Successful',
                //                        timer: 2000,
                //                        showConfirmButton: false
                //                    });
                //                } else {
                //                    Swal.fire({
                //                        icon: 'error',
                //                        title: 'Delete Failed',
                //                        text: response.data.message ?? 'Please check your data.',
                //                        confirmButtonText: 'Try Again'
                //                    });
                //                }
                //            } catch (error) {
                //                Swal.fire({
                //                    icon: 'error',
                //                    title: 'An Error Occurred',
                //                    text: error.response?.data?.message ?? 'Please try again.',
                //                    confirmButtonText: 'OK'
                //                });
                //            }
                //        }
                //        methods.refreshSummary();
                //    }
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

        //const mainModal = {
        //    obj: null,
        //    create: () => {
        //        mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
        //            backdrop: 'static',
        //            keyboard: false
        //        });
        //    }
        //};
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

        return {
            mainGridRef,
            mainModalRef,
            secondaryGridRef,
            scrappingDateRef,
            warehouseIdRef,
            statusRef,
            numberRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');