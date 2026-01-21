const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            vendorListLookupData: [],
            taxListLookupData: [],
            purchaseOrderStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            orderDate: '',
            description: '',
            vendorId: null,
            taxId: null,
            orderStatus: null,
            locationId:'',
            errors: {
                orderDate: '',
                vendorId: '',
                taxId: '',
                orderStatus: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            subTotalAmount: '0.00',
            taxAmount: '0.00',
            totalAmount: '0.00',
            attributeRows: [],
            attributeModal: null,
            currentRowContext: null,
            productGroupId: '',
            isAddMode : false,

        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const orderDateRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const vendorIdRef = Vue.ref(null);
        const taxIdRef = Vue.ref(null);
        const orderStatusRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.orderDate = '';
            state.errors.vendorId = '';
            state.errors.taxId = '';
            state.errors.orderStatus = '';
            state.errors.gridItems = [];

            let isValid = true;

            // Validate form fields
            if (!state.orderDate) {
                state.errors.orderDate = 'Order date is required.';
                isValid = false;
            }
            if (!state.vendorId) {
                state.errors.vendorId = 'Vendor is required.';
                isValid = false;
            }            
            if (!state.orderStatus) {
                state.errors.orderStatus = 'Order status is required.';
                isValid = false;
            }
            debugger;

            // 🔥 FORCE grid to commit the current edit
            if (secondaryGrid.obj && secondaryGrid.obj.isEdit) {
                console.log("Ending edit mode before validation...");
                 secondaryGrid.obj.endEdit();
            }

            // GET BATCH CHANGES HERE
            const batchChanges = secondaryGrid.getBatchChanges();

            console.log('Validation Time - Reading Batch Changes:');
            console.log('Added Records:', batchChanges.addedRecords);
            console.log('Changed Records:', batchChanges.changedRecords);
            console.log('Deleted Records:', batchChanges.deletedRecords);

            // Initialize data
            let currentSecondaryData = state.id !== ""
                ? [...state.secondaryData]
                : [...(batchChanges.changedRecords || [])];

            // Helper function to match records
            const matchRecord = (a, b) => {
                if (a.purchaseOrderItemId && b.purchaseOrderItemId) {
                    return a.purchaseOrderItemId === b.purchaseOrderItemId;
                }
                if (a.id && b.id) {
                    return a.id === b.id;
                }
                return false;
            };

            // Apply batch changes
            const changedRecords = batchChanges.changedRecords || [];
            for (let changed of changedRecords) {
                const index = currentSecondaryData.findIndex(item => matchRecord(item, changed));
                if (index !== -1) {
                    currentSecondaryData[index] = { ...currentSecondaryData[index], ...changed };
                }
            }

            // Filter deleted records
            const deletedRecords = batchChanges.deletedRecords || [];
            if (deletedRecords.length > 0) {
                currentSecondaryData = currentSecondaryData.filter(item =>
                    !deletedRecords.some(deleted => matchRecord(item, deleted))
                );
            }

            // Add new records
            const addedRecords = batchChanges.addedRecords || [];
            if (addedRecords.length > 0) {
                currentSecondaryData = [...currentSecondaryData, ...addedRecords];
            }

            console.log('Final data for validation:', currentSecondaryData);

            // Check if there are items
            if (currentSecondaryData.length === 0) {
                state.errors.gridItems.push('At least one item must be added to the order.');
                isValid = false;
            }

            // Validate each item
            for (let i = 0; i < currentSecondaryData.length; i++) {
                const record = currentSecondaryData[i];

                if (!record.productId) {
                    state.errors.gridItems.push(`Row ${i + 1}: Product is required.`);
                    isValid = false;
                }

                if (!record.taxId) {
                    state.errors.gridItems.push(`Row ${i + 1}: Tax is required.`);
                    isValid = false;
                }

                if (!record.quantity || record.quantity <= 0) {
                    state.errors.gridItems.push(`Row ${i + 1}: Quantity must be greater than 0.`);
                    isValid = false;
                }

                if (!record.unitPrice || record.unitPrice <= 0) {
                    state.errors.gridItems.push(`Row ${i + 1}: Unit price must be greater than 0.`);
                    isValid = false;
                }
            }

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.orderDate = '';
            state.description = '';
            state.vendorId = null;
            state.taxId = null;
            state.orderStatus = null;
            state.errors = {
                orderDate: '',
                vendorId: '',
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
        
        const services = {           
            getMainData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/PurchaseOrder/GetPurchaseOrderList?LocationId=' + locationId);
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (orderDate, description, orderStatus, vendorId, beforeTaxAmount, taxAmount, afterTaxAmount, createdById, items = []) => {
                try {
                    const locationId = StorageManager.getLocation();

                    // Sanitize numbers: Remove commas and ensure numeric type
                    const formatNumber = (numStr) => {
                        if (typeof numStr === 'string') {
                            return parseFloat(numStr.replace(/,/g, '')); // e.g., "420,000.00" -> 420000
                        }
                        return numStr;
                    };

                    const payload = {
                        orderDate,  // Keep as ISO string
                        description,
                        orderStatus,  // Ensure this is passed (e.g., "Draft")
                        vendorId,
                        createdById,
                        locationId,
                        beforeTaxAmount: formatNumber(beforeTaxAmount),  // Add and format
                        taxAmount: formatNumber(taxAmount),
                        afterTaxAmount: formatNumber(afterTaxAmount),
                        items  // Already good; ensure unitPrice etc. are numbers
                    };

                    console.log('Sanitized payload:', JSON.stringify(payload, null, 2));
                    const response = await AxiosManager.post('/PurchaseOrder/CreatePurchaseOrder', payload);
                    return response;
                } catch (error) {
                    console.error('Frontend error:', error);
                    throw error;
                }
            },
            updateMainData: async (id, orderDate, description, orderStatus, vendorId, beforeTaxAmount, taxAmount, afterTaxAmount, updatedById, items = [], deletedItemIds = []) => {
                try {
                    const locationId = StorageManager.getLocation();

                    // Sanitize numbers: Remove commas and ensure numeric type
                    const formatNumber = (numStr) => {
                        if (typeof numStr === 'string') {
                            return parseFloat(numStr.replace(/,/g, '')); // e.g., "420,000.00" -> 420000
                        }
                        return numStr;
                    };
                    // CRITICAL FIX: Extract just the IDs, not the whole object
                    const flattenedDeletedIds = (deletedItemIds || [])
                        .flat(Infinity)
                        .map(item => typeof item === 'string' ? item : item?.Id)
                        .filter(id => id && id !== null);

                    const payload = {
                        id,
                        orderDate,  // Keep as ISO string
                        description,
                        orderStatus,  // Ensure this is passed (e.g., "Draft")
                        vendorId,
                        updatedById,
                        locationId,
                        beforeTaxAmount: formatNumber(beforeTaxAmount),  // Add and format
                        taxAmount: formatNumber(taxAmount),
                        afterTaxAmount: formatNumber(afterTaxAmount),
                        items,  // Already good; ensure unitPrice etc. are numbers
                        deletedItemIds: flattenedDeletedIds  // Just array of ID strings
                    };
                    console.log('Sanitized payload:', JSON.stringify(payload, null, 2));

                    const response = await AxiosManager.post('/PurchaseOrder/UpdatePurchaseOrder', payload);
                    return response;
                } catch (error) {
                    console.error('Frontend error:', error);
                    throw error;
                }
            },

            deleteMainData: async (id, deletedById) => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.post('/PurchaseOrder/DeletePurchaseOrder', {
                        id, deletedById, locationId
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getVendorListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Vendor/GetVendorList', {});
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
            getPurchaseOrderStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/PurchaseOrder/GetPurchaseOrderStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (purchaseOrderId) => {
                try {
                    const response = await AxiosManager.get('/PurchaseOrderItem/GetPurchaseOrderItemByPurchaseOrderIdList?purchaseOrderId=' + purchaseOrderId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (unitPrice, quantity, summary, productId, purchaseOrderId, createdById) => {
                try {
                    const response = await AxiosManager.post('/PurchaseOrderItem/CreatePurchaseOrderItem', {
                        unitPrice, quantity, summary, productId, purchaseOrderId, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById) => {
                debugger;
                try {
                    const response = await AxiosManager.post('/PurchaseOrderItem/UpdatePurchaseOrderItem', {
                        id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/PurchaseOrderItem/DeletePurchaseOrderItem', {
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
            getAttributeDetails: async (attributeId) => {
                debugger
                try {
                    const requestBody = {
                        attributeId: attributeId,
                        isDeleted: false
                    };
                    return AxiosManager.post('/Attribute/GetAttributeDetails', requestBody);

                      } catch (error) {
                    throw error;
                }
            },

            //,
            //getAttributesAndValuesByProductGroupId: async (productGroupId) => {
            //    try {
            //        if (!productGroupId) return [];

            //        const [attrResponse, valResponse] = await Promise.all([
            //            AxiosManager.get(`/ProductGroup/GetAttributes?productGroupId=${productGroupId}`),
            //            AxiosManager.get(`/ProductGroup/GetAttributeValues?productGroupId=${productGroupId}`)
            //        ]);

            //        const attributes = attrResponse?.data?.content?.data || [];
            //        const values = valResponse?.data?.content?.data || [];

            //        // ✅ Only include attributes that have values
            //        return attributes
            //            .map(attr => ({
            //                id: attr.id,
            //                name: attr.attributeName,
            //                values: values.filter(v => v.attributeId === attr.id)
            //            }))
            //            .filter(attr => attr.values && attr.values.length > 0);

            //    } catch (error) {
            //        console.error("Error fetching attributes and values:", error);
            //        return [];
            //    }
            //},
        };

        const methods = {
            populateVendorListLookupData: async () => {
                const response = await services.getVendorListLookupData();
                state.vendorListLookupData = response?.data?.content?.data;
            },
            populateTaxListLookupData: async () => {
                const response = await services.getTaxListLookupData();
                state.taxListLookupData = response?.data?.content?.data;
            },
            populatePurchaseOrderStatusListLookupData: async () => {
                const response = await services.getPurchaseOrderStatusListLookupData();
                state.purchaseOrderStatusListLookupData = response?.data?.content?.data;
            },
            populateMainData: async () => {
                const response = await services.getMainData();
                debugger;
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    orderDate: item.orderDate ? new Date(item.orderDate).toISOString().split('T')[0] : '',
                    createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc).toISOString().replace('T', ' ').split('.')[0] : '', 
                }));
            },
            populateSecondaryData: async (purchaseOrderId) => {
                try {
                    const response = await services.getSecondaryData(purchaseOrderId);
                    const items = response?.data?.content?.data || [];

                    // For each row, load attribute lists based on its productId (concurrently)
                    await Promise.all(items.map(async (row) => {
                        // Ensure createdAtUtc is a Date if present
                        if (row.createdAtUtc) row.createdAtUtc = new Date(row.createdAtUtc);

                        // Initialize lists so grid valueAccessors don't break
                        row.attribute1List = [];
                        row.attribute2List = [];

                        // find product to get attribute definitions
                        const product = state.productListLookupData.find(p => p.id === row.productId);
                        if (product) {
                            if (product.attribute1Id) {
                                try {
                                    const resp1 = await services.getAttributeDetails(product.attribute1Id);
                                    row.attribute1List = resp1.data?.content?.data ?? [];
                                } catch (e) {
                                    row.attribute1List = [];
                                }
                            }
                            if (product.attribute2Id) {
                                try {
                                    const resp2 = await services.getAttributeDetails(product.attribute2Id);
                                    row.attribute2List = resp2.data?.content?.data ?? [];
                                } catch (e) {
                                    row.attribute2List = [];
                                }
                            }
                        }
                    }));

                    state.secondaryData = items;
                    methods.refreshPaymentSummary(purchaseOrderId);
                    // Make sure grid refresh uses new row-level lists
                    secondaryGrid.refresh();
                } catch (error) {
                    console.error('populateSecondaryData error:', error);
                    state.secondaryData = [];
                }
            },
             populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data;
            },
            refreshPaymentSummary: async (id) => {
                const record = state.mainData.find(item => item.id === id);
                if (record) {
                    state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0);
                    state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0);
                    state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0);
                }
            },
            calculateTotals: async () => {
                let subTotal = 0;
                let taxTotal = 0;
                let grandTotal = 0;
                state.secondaryData.forEach(row => {
                    const preTaxLine = (row.unitPrice || 0) * (row.quantity || 0);
                    const taxLine = (row.taxAmount || 0) * (row.quantity || 0);
                    subTotal += preTaxLine;
                    taxTotal += taxLine;
                    grandTotal += row.total || 0;  // Or compute as preTaxLine + taxLine for verification
                });

                state.subTotalAmount = NumberFormatManager.formatToLocale(subTotal ?? 0);
                state.taxAmount = NumberFormatManager.formatToLocale(taxTotal ?? 0);
                state.totalAmount = NumberFormatManager.formatToLocale(grandTotal ?? 0);
            },
            prepareSecondaryDataForSubmission: function () {
                // Get batch changes from grid
                const batchChanges = secondaryGrid.getBatchChanges();

                console.log('Batch Changes:', batchChanges);

                // Initialize with existing data if record exists, otherwise use changed records
                let currentSecondaryData = state.id !== ""
                    ? [...state.secondaryData]
                    : [...(batchChanges.changedRecords || [])];

                // Helper function to match records by ID or purchaseOrderItemId
                const matchRecord = (a, b) => {
                    if (a.purchaseOrderItemId && b.purchaseOrderItemId) {
                        return a.purchaseOrderItemId === b.purchaseOrderItemId;
                    }
                    if (a.id && b.id) {
                        return a.id === b.id;
                    }
                    return false;
                };

                // Apply changed records - merge updates with existing data
                const changedRecords = batchChanges.changedRecords || [];
                for (let changed of changedRecords) {
                    const index = currentSecondaryData.findIndex(item =>
                        matchRecord(item, changed)
                    );

                    if (index !== -1) {
                        // Merge changed data with existing record, preserving important fields
                        currentSecondaryData[index] = {
                            ...currentSecondaryData[index],
                            ...changed,
                            // Ensure these critical fields are properly set
                            unitPrice: changed.unitPrice ?? currentSecondaryData[index].unitPrice,
                            quantity: changed.quantity ?? currentSecondaryData[index].quantity,
                            taxId: changed.taxId ?? currentSecondaryData[index].taxId,
                            taxAmount: changed.taxAmount ?? currentSecondaryData[index].taxAmount,
                            totalAfterTax: changed.totalAfterTax ?? currentSecondaryData[index].totalAfterTax,
                            total: changed.total ?? currentSecondaryData[index].total,
                            // 🔥 ADD ATTRIBUTE FIELDS
                            attribute1DetailId: changed.attribute1DetailId ?? currentSecondaryData[index].attribute1DetailId,
                            attribute2DetailId: changed.attribute2DetailId ?? currentSecondaryData[index].attribute2DetailId
                        };
                    }
                }

                // Remove deleted items from the data array - FLATTEN IF NESTED
                let deletedRecords = batchChanges.deletedRecords || [];
                deletedRecords = deletedRecords.flat(Infinity);  // ADD THIS LINE

                // Add newly created records
                const addedRecords = batchChanges.addedRecords || [];
                if (addedRecords.length > 0) {
                    currentSecondaryData = [...currentSecondaryData, ...addedRecords];
                }

                // Validate and filter final items
                const validItems = currentSecondaryData.filter(item => {
                    // Check required fields
                    if (!item.productId || item.productId === undefined) return false;
                    if (item.quantity === undefined || item.quantity === null || item.quantity <= 0) return false;
                    if (item.unitPrice === undefined || item.unitPrice === null) return false;

                    
                    return true;
                });

                console.log('Valid Items for submission:', validItems);
                console.log('Deleted Items:', deletedRecords);

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
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    let response;
                    const userId = StorageManager.getUserId();
                    const { validItems, deletedRecords } = methods.prepareSecondaryDataForSubmission();

                    debugger
                    if (state.id === '') {
                        // Create DTO for items
                        const itemsDto = validItems.map(item => ({
                            productId: item.productId,
                            unitPrice: item.unitPrice,
                            quantity: item.quantity,
                            taxId: item.taxId,
                            taxAmount: item.taxAmount,
                            totalAfterTax: item.totalAfterTax,
                            total: item.total,
                            summary: item.summary,
                            attribute1DetailId: item.attribute1DetailId || null,  // 🔥 ADD
                            attribute2DetailId: item.attribute2DetailId || null   // 🔥 ADD

                        }));

                        // Call API with all fields
                        const response = await services.createMainData(
                            state.orderDate,
                            state.description,
                            state.orderStatus,
                            state.vendorId,
                            state.subTotalAmount,     // BeforeTaxAmount
                            state.taxAmount,    // TaxAmount
                            state.totalAmount,  // AfterTaxAmount
                            userId,             // CreatedById
                            itemsDto            // Items
                        );

                        if (response.data.code === 200) {
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                        }
                    }
                     else if (state.deleteMode) {
                        // **DELETE GOODS RECEIPT**
                        response = await services.deleteMainData(state.id, userId);
                    } else {
                        const DeleteditemsDto = (deletedRecords || [])
                            .flat(Infinity)  // First: flatten to [{id: "123"}]
                            .map(item => ({   // Then: map over flattened array
                                Id: item?.id ?? null
                            }));

                        // **UPDATE EXISTING GOODS RECEIPT WITH ITEMS IN ONE REQUEST**
                        const itemsDto = validItems.map(item => ({
                            Id: item.id || null,  // Include ID for updates/deletes
                            productId: item.productId,
                            unitPrice: item.unitPrice,
                            quantity: item.quantity,
                            taxId: item.taxId,
                            taxAmount: item.taxAmount,
                            totalAfterTax: item.totalAfterTax,
                            total: item.total,
                            summary: item.summary,
                            attribute1DetailId: item.attribute1DetailId || null,  // 🔥 ADD
                            attribute2DetailId: item.attribute2DetailId || null   // 🔥 ADD

                        }));

                        // Filter out deleted items (zero quantity or explicitly marked; assume prepareSecondaryDataForSubmission handles this)
                        const filteredItemsDto = itemsDto.filter(item => item.quantity > 0);

                        response = await services.updateMainData(
                            state.id,
                            state.orderDate,
                            state.description,
                            state.orderStatus,
                            state.vendorId,
                            state.subTotalAmount,     // BeforeTaxAmount
                            state.taxAmount,    // TaxAmount
                            state.totalAmount,  // AfterTaxAmount
                            userId,             // CreatedById
                            filteredItemsDto,            // Items
                            DeleteditemsDto
                        );

                        if (response.data.code === 200) {
                            // No need for separate secondary calls; all handled in single request
                        }
                    }

                    // **HANDLE RESPONSE**
                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            // Refresh secondary data after successful save
                            await methods.populateSecondaryData();
                            secondaryGrid.refresh();
                            state.mainTitle = 'Edit Goods Receive';
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
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
                            text: response.data.message ?? 'Please check your data.',
                            confirmButtonText: 'Try Again'
                        });
                    }
                } catch (error) {
                    console.error('Submit error:', error);
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
                state.errors.vendorId = '';
                state.errors.taxId = '';
                state.errors.orderStatus = '';
                taxListLookup.trackingChange = false;
            },
            onMainModalShown: () => {
                if (state.isAddMode) {
                    setTimeout(() => {
                        secondaryGrid.obj.addRecord();
                    }, 200);
                }

            },
            //,
            // ───────── Attribute Combination Modal ─────────

            //openAttributeModal: (attributes, rowData) => {
            //    state.currentProductAttributes = attributes;
            //    state.attributeRows = [];       // reset old data
            //    state.currentRowContext = rowData;

            //    if (!state.attributeModal) {
            //        state.attributeModal = new bootstrap.Modal(document.getElementById('AttributeModal'));
            //    }
            //    state.attributeModal.show();
            //    methods.addAttributeRow();
            //},

            //addAttributeRow: () => {
            //    debugger;
            //    const newRow = {
            //        id: Date.now(),
            //        values: {},
            //        quantity: 1
            //    };
            //    state.attributeRows.push(newRow);
            //},

            //removeAttributeRow: (index) => {
            //    state.attributeRows.splice(index, 1);
            //},
            //validateAttributeQuantity: () => {
            //    const totalQty = state.attributeRows.reduce((sum, r) => sum + (r.quantity || 0), 0);
            //    const expectedQty = state.currentRowContext.quantity;

            //    if (totalQty > expectedQty) {
            //        Swal.fire({
            //            icon: 'warning',
            //            title: 'Quantity Limit Exceeded',
            //            text: `Total quantity (${totalQty}) cannot exceed ${expectedQty}.`
            //        });
            //    }
            //},

            //saveAttributeCombinations: () => {
            //    if (!state.currentRowContext) return;

            //    // Validation
            //    let totalQty = 0;
            //    for (const row of state.attributeRows) {
            //        const missing = state.currentProductAttributes.filter(a => !row.values[a.id]);
            //        if (missing.length) {
            //            Swal.fire({ icon: 'warning', text: `Select values for: ${missing.map(a => a.name).join(', ')}` });
            //            return;
            //        }
            //        if (!row.quantity || row.quantity <= 0) {
            //            Swal.fire({ icon: 'warning', text: 'Each row must have quantity > 0' });
            //            return;
            //        }
            //        totalQty += row.quantity;
            //    }

            //    const poQty = state.currentRowContext.quantity || 0;
            //    if (totalQty !== poQty) {
            //        Swal.fire({
            //            icon: 'warning',
            //            title: 'Quantity mismatch',
            //            text: `Sum of attribute quantities (${totalQty}) must equal product quantity (${poQty}).`
            //        });
            //        return;
            //    }

            //    // Store combinations in the row data
            //    state.currentRowContext.attributeCombinations = JSON.parse(JSON.stringify(state.attributeRows));

            //    Swal.fire({
            //        icon: 'success',
            //        title: 'Saved!',
            //        timer: 1000,
            //        showConfirmButton: false
            //    });

            //    state.attributeModal.hide();
            //},

        };

        const vendorListLookup = {
            obj: null,
            create: () => {
                if (state.vendorListLookupData && Array.isArray(state.vendorListLookupData)) {
                    vendorListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.vendorListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Vendor',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.vendorListLookupData, query);
                        },
                        change: (e) => {
                            state.vendorId = e.value;
                        }
                    });
                    vendorListLookup.obj.appendTo(vendorIdRef.value);
                }
            },
            refresh: () => {
                if (vendorListLookup.obj) {
                    vendorListLookup.obj.value = state.vendorId;
                }
            }
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

        const purchaseOrderStatusListLookup = {
            obj: null,
            create: () => {
                if (state.purchaseOrderStatusListLookupData && Array.isArray(state.purchaseOrderStatusListLookupData)) {
                    purchaseOrderStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.purchaseOrderStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select an Order Status',
                        change: (e) => {
                            state.orderStatus = e.value;
                        }
                    });
                    purchaseOrderStatusListLookup.obj.appendTo(orderStatusRef.value);
                }
            },
            refresh: () => {
                if (purchaseOrderStatusListLookup.obj) {
                    purchaseOrderStatusListLookup.obj.value = state.orderStatus;
                }
            }
        };

        //const orderDatePicker = {
        //    obj: null,
        //    create: () => {
        //        orderDatePicker.obj = new ej.calendars.DatePicker({
        //            format: 'yyyy-MM-dd',
        //            value: state.orderDate ? new Date(state.orderDate) : null,
        //            change: (e) => {
        //                state.orderDate = e.value;
        //            }
        //        });
        //        orderDatePicker.obj.appendTo(orderDateRef.value);
        //    },
        //    refresh: () => {
        //        if (orderDatePicker.obj) {
        //            orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null;
        //        }
        //    }
        //};

        const orderDatePicker = {
            obj: null,

            create: () => {
                const defaultDate = state.orderDate
                    ? new Date(state.orderDate)
                    : new Date();

                orderDatePicker.obj = new ej.calendars.DatePicker({
                    format: 'yyyy-MM-dd',
                    value: defaultDate,
                    enabled: false   // 🔒 disabled
                });

                // ✅ IMPORTANT: manually sync state
                state.orderDate = defaultDate;

                orderDatePicker.obj.appendTo(orderDateRef.value);
            },

            refresh: () => {
                if (orderDatePicker.obj) {
                    const date = state.orderDate
                        ? new Date(state.orderDate)
                        : new Date();

                    orderDatePicker.obj.value = date;

                    // ✅ keep state in sync
                    state.orderDate = date;
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

        //Vue.watch(
        //    () => state.orderDate,
        //    (newVal, oldVal) => {
        //        orderDatePicker.refresh();
        //        state.errors.orderDate = '';
        //    }
        //);

        Vue.watch(
            () => state.vendorId,
            (newVal, oldVal) => {
                vendorListLookup.refresh();
                state.errors.vendorId = '';
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
                purchaseOrderStatusListLookup.refresh();
                state.errors.orderStatus = '';
            }
        );

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
                    //groupSettings: { columns: ['vendorName'] },
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
                        {
                            field: 'orderDate',
                            headerText: 'PO Date',
                            width: 150,
                            valueAccessor: (field, data) => {
                                if (!data.orderDate) return '';
                                const d = new Date(data.orderDate);
                                return d.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
                            }
                        },
                        { field: 'vendorName', headerText: 'Vendor', width: 200, minWidth: 200 },
                        { field: 'orderStatusName', headerText: 'Status', width: 150, minWidth: 150 },
                        { field: 'beforeTaxAmount', headerText: 'Before Tax Total Amount', width: 150, minWidth: 150, format: 'N2' },
                        { field: 'taxAmount', headerText: 'Tax Amount', width: 150, minWidth: 150, format: 'N2' },

                        { field: 'afterTaxAmount', headerText: 'Total Amount', width: 150, minWidth: 150, format: 'N2' },

                        {
                            field: 'createdAtUtc',
                            headerText: 'Created At UTC',
                            width: 180,
                            valueAccessor: (field, data) => {
                                if (!data.createdAtUtc) return '';
                                const d = new Date(data.createdAtUtc);
                                return d.toLocaleString('en-GB', {
                                    year: 'numeric', month: 'short', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit', hour12: false
                                });
                            }
                        }
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
                        mainGrid.obj.autoFitColumns(['number', 'orderDate', 'vendorName', 'orderStatusName', 'taxName', 'afterTaxAmount', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Purchase Order';
                            resetFormState();
                            state.isAddMode = true;
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
                            state.isAddMode = false;

                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Purchase Order';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.vendorId = selectedRecord.vendorId ?? '';
                                state.taxId = selectedRecord.taxId ?? '';
                                taxListLookup.trackingChange = true;
                                state.orderStatus = String(selectedRecord.orderStatusName ?? '');
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
                                state.mainTitle = 'Delete Purchase Order?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.vendorId = selectedRecord.vendorId ?? '';
                                state.taxId = selectedRecord.taxId ?? '';
                                state.orderStatus = String(selectedRecord.orderStatusName ?? '');
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
                                window.open('/PurchaseOrders/PurchaseOrderPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
                            field: 'productId',
                            headerText: 'Product',
                            width: 250,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            valueAccessor: (field, data, column) => {
                                debugger
                                const product = state.productListLookupData.find(item => item.id === data[field]);
                                return product ? `${product.name}` : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    let productElem = document.createElement('input');
                                    return productElem;
                                },
                                read: () => {
                                    return productObj.value;
                                },
                                destroy: () => {
                                    productObj.destroy();
                                },
                                write: (args) => {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.productId,
                                        change: async (e) => {
                                            const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
                                            state.productGroupId = selectedProduct?.productGroupId ?? '';

                                            if (selectedProduct) {
                                                args.rowData.productId = selectedProduct.id;

                                                if (numberObj) numberObj.value = selectedProduct.number;
                                                if (priceObj) priceObj.value = selectedProduct.unitPrice;
                                                if (summaryObj) summaryObj.value = selectedProduct.description;
                                                if (taxObj) taxObj.value = selectedProduct.taxId;

                                                if (quantityObj) {
                                                    quantityObj.value = 1;
                                                    const total = (selectedProduct.unitPrice || 0) * 1;
                                                    if (totalObj) totalObj.value = total;
                                                }

                                                // ---- Load and attach attribute lists to THIS ROW ----
                                                // Initialize to empty arrays first
                                                args.rowData.attribute1List = [];
                                                args.rowData.attribute2List = [];

                                                if (selectedProduct.attribute1Id) {
                                                    try {
                                                        const resp1 = await services.getAttributeDetails(selectedProduct.attribute1Id);
                                                        args.rowData.attribute1List = resp1.data?.content?.data ?? [];
                                                    } catch (err) {
                                                        args.rowData.attribute1List = [];
                                                    }
                                                }

                                                if (selectedProduct.attribute2Id) {
                                                    try {
                                                        const resp2 = await services.getAttributeDetails(selectedProduct.attribute2Id);
                                                        args.rowData.attribute2List = resp2.data?.content?.data ?? [];
                                                    } catch (err) {
                                                        args.rowData.attribute2List = [];
                                                    }
                                                }

                                                // If previously selected attribute ids are not present in the new lists, clear them
                                                const a1Exists = args.rowData.attribute1List.some(x => x.id === args.rowData.attribute1DetailId);
                                                if (!a1Exists) args.rowData.attribute1DetailId = null;

                                                const a2Exists = args.rowData.attribute2List.some(x => x.id === args.rowData.attribute2DetailId);
                                                if (!a2Exists) args.rowData.attribute2DetailId = null;

                                                // REFRESH attribute dropdowns if they're already open
                                                if (attribute1Obj) {
                                                    attribute1Obj.setProperties({ dataSource: args.rowData.attribute1List });
                                                }
                                                if (attribute2Obj) {
                                                    attribute2Obj.setProperties({ dataSource: args.rowData.attribute2List });
                                                }
                                            }
                                        },
                                        placeholder: 'Select a Product',
                                        floatLabelType: 'Never'
                                    });
                                    productObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'attribute1DetailId',
                            headerText: 'Attribute 1',
                            width: 180,
                            editType: 'dropdownedit',
                            valueAccessor: (field, data) => {
                                const list = data.attribute1List || [];
                                const item = list.find(x => x.id === data[field]);
                                return item ? item.value : '';
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => attribute1Obj?.value,
                                destroy: () => attribute1Obj?.destroy(),
                                write: async (args) => {
                                    // LOAD ATTRIBUTES ON EDIT IF NOT ALREADY LOADED
                                    let dataList = args.rowData.attribute1List || [];

                                    // If list is empty but row has a productId, load attributes now
                                    if (dataList.length === 0 && args.rowData.productId) {
                                        const product = state.productListLookupData.find(p => p.id === args.rowData.productId);
                                        if (product?.attribute1Id) {
                                            try {
                                                const resp = await services.getAttributeDetails(product.attribute1Id);
                                                dataList = resp.data?.content?.data ?? [];
                                                args.rowData.attribute1List = dataList;
                                            } catch (err) {
                                                dataList = [];
                                            }
                                        }
                                    }

                                    attribute1Obj = new ej.dropdowns.DropDownList({
                                        dataSource: dataList,
                                        fields: { value: 'id', text: 'value' },
                                        value: args.rowData.attribute1DetailId,
                                        placeholder: 'Select Attribute 1',
                                        change: (e) => {
                                            args.rowData.attribute1DetailId = e.value;
                                        }
                                    });

                                    attribute1Obj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'attribute2DetailId',
                            headerText: 'Attribute 2',
                            width: 180,
                            editType: 'dropdownedit',
                            valueAccessor: (field, data) => {
                                const list = data.attribute2List || [];
                                const item = list.find(x => x.id === data[field]);
                                return item ? item.value : '';
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => attribute2Obj?.value,
                                destroy: () => attribute2Obj?.destroy(),
                                write: async (args) => {
                                    // LOAD ATTRIBUTES ON EDIT IF NOT ALREADY LOADED
                                    let dataList = args.rowData.attribute2List || [];

                                    // If list is empty but row has a productId, load attributes now
                                    if (dataList.length === 0 && args.rowData.productId) {
                                        const product = state.productListLookupData.find(p => p.id === args.rowData.productId);
                                        if (product?.attribute2Id) {
                                            try {
                                                const resp = await services.getAttributeDetails(product.attribute2Id);
                                                dataList = resp.data?.content?.data ?? [];
                                                args.rowData.attribute2List = dataList;
                                            } catch (err) {
                                                dataList = [];
                                            }
                                        }
                                    }

                                    attribute2Obj = new ej.dropdowns.DropDownList({
                                        dataSource: dataList,
                                        fields: { value: 'id', text: 'value' },
                                        value: args.rowData.attribute2DetailId,
                                        placeholder: 'Select Attribute 2',
                                        change: (e) => {
                                            args.rowData.attribute2DetailId = e.value;
                                        }
                                    });

                                    attribute2Obj.appendTo(args.element);
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
                                            const taxPercent = taxObj?.value
                                                ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
                                                : 0;
                                            const unitPrice = e.value ?? 0;
                                            const quantity = quantityObj?.value ?? 1;

                                            let taxAmount;
                                            let totalAfterTax;
                                            if (taxPercent === 0) {
                                                taxAmount = 0;
                                                totalAfterTax = unitPrice;
                                            } else {
                                                taxAmount = (unitPrice * taxPercent) / 100;
                                                totalAfterTax = unitPrice + taxAmount;
                                            }
                                            const total = totalAfterTax * quantity;

                                            args.rowData.taxId = e.value;
                                            args.rowData.taxAmount = taxAmount;
                                            args.rowData.totalAfterTax = totalAfterTax;
                                            args.rowData.total = total;

                                            if (taxAmountObj) taxAmountObj.value = taxAmount;
                                            if (totalAfterTaxObj) totalAfterTaxObj.value = totalAfterTax;
                                            if (totalObj) totalObj.value = total;
                                        }
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'taxId',
                            headerText: 'Tax',
                            width: 160,
                            editType: 'dropdownedit',
                            valueAccessor: (field, data) => {
                                const tax = state.taxListLookupData.find(item => item.id === data[field]);
                                return tax ? `${tax.name} (${tax.percentage}%)` : '';
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => taxObj.value,
                                destroy: () => taxObj.destroy(),
                                write: (args) => {
                                    taxObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.taxListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.taxId,
                                        placeholder: 'Select Tax',
                                        change: (e) => {
                                            const selectedTax = state.taxListLookupData.find(t => t.id === e.value);
                                            const unitPrice = priceObj?.value ?? 0;
                                            const taxPercent = selectedTax?.percentage ?? 0;
                                            const quantity = quantityObj?.value ?? 1;

                                            let taxAmount;
                                            let totalAfterTax;
                                            if (taxPercent === 0) {
                                                taxAmount = 0;
                                                totalAfterTax = unitPrice;
                                            } else {
                                                taxAmount = (unitPrice * taxPercent) / 100;
                                                totalAfterTax = unitPrice + taxAmount;
                                            }
                                            const total = totalAfterTax * quantity;

                                            args.rowData.taxId = e.value;
                                            args.rowData.taxAmount = taxAmount;
                                            args.rowData.totalAfterTax = totalAfterTax;
                                            args.rowData.total = total;

                                            if (taxAmountObj) taxAmountObj.value = taxAmount;
                                            if (totalAfterTaxObj) totalAfterTaxObj.value = totalAfterTax;
                                            if (totalObj) totalObj.value = total;
                                        }
                                    });
                                    taxObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'taxAmount',
                            headerText: 'Tax Amount',
                            width: 150,
                            type: 'number', format: 'N2', textAlign: 'Right',
                            allowEditing: false,
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => taxAmountObj.value,
                                destroy: () => taxAmountObj.destroy(),
                                write: (args) => {
                                    taxAmountObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.taxAmount ?? 0,
                                        readonly: true
                                    });
                                    taxAmountObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'totalAfterTax',
                            headerText: 'Unit Price After Tax',
                            width: 180,
                            type: 'number', format: 'N2', textAlign: 'Right',
                            allowEditing: false,
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => totalAfterTaxObj.value,
                                destroy: () => totalAfterTaxObj.destroy(),
                                write: (args) => {
                                    totalAfterTaxObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.totalAfterTax ?? 0,
                                        readonly: true
                                    });
                                    totalAfterTaxObj.appendTo(args.element);
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
                                                const unitPrice = priceObj.value || 0;
                                                const quantity = e.value || 0;

                                                const taxPercent = taxObj?.value
                                                    ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
                                                    : 0;
                                                let taxAmount;
                                                let totalAfterTax;
                                                if (taxPercent === 0) {
                                                    taxAmount = 0;
                                                    totalAfterTax = unitPrice;
                                                } else {
                                                    taxAmount = (unitPrice * taxPercent) / 100;
                                                    totalAfterTax = unitPrice + taxAmount;
                                                }
                                                const total = totalAfterTax * quantity;
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
                    actionBegin: async (args) => {

                    },
                    actionComplete: async (args) => {
                        const purchaseOrderId = state.id;
                        const userId = StorageManager.getUserId();

                        if (args.requestType === 'save' && args.action === 'add') {
                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
                            console.log('Added Record:', args.data);
                        }

                        if (args.requestType === 'save' && args.action === 'edit') {
                            const index = secondaryGrid.manualBatchChanges.changedRecords.findIndex(
                                r => r.id === args.data?.id
                            );
                            if (index > -1) {
                                secondaryGrid.manualBatchChanges.changedRecords[index] = args.data;
                            } else {
                                secondaryGrid.manualBatchChanges.changedRecords.push(args.data);
                            }
                            console.log('Changed Record:', args.data);
                        }

                        if (args.requestType === 'delete') {
                            secondaryGrid.manualBatchChanges.deletedRecords.push(args.data);
                            console.log('Deleted Record:', args.data);
                        }

                        methods.calculateTotals();
                    }

                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },
            getBatchChanges: () => {
                return secondaryGrid.manualBatchChanges;
            },
            clearBatchChanges: () => {
                secondaryGrid.manualBatchChanges = {
                    addedRecords: [],
                    changedRecords: [],
                    deletedRecords: []
                };
            },

            refresh: () => {
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };

        //const secondaryGrid = {
        //    obj: null,
        //    manualBatchChanges: {
        //        addedRecords: [],
        //        changedRecords: [],
        //        deletedRecords: []
        //    },

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
        //                    field: 'productId',
        //                    headerText: 'Product',
        //                    width: 250,
        //                    validationRules: { required: true },
        //                    disableHtmlEncode: false,
        //                    valueAccessor: (field, data, column) => {
        //                        debugger
        //                        const product = state.productListLookupData.find(item => item.id === data[field]);
        //                        return product ? `${product.name}` : '';
        //                    },
        //                    editType: 'dropdownedit',
        //                    edit: {
        //                        create: () => {
        //                            let productElem = document.createElement('input');
        //                            return productElem;
        //                        },
        //                        read: () => {
        //                            return productObj.value;
        //                        },
        //                        destroy: () => {
        //                            productObj.destroy();
        //                        },
        //                        write: (args) => {
        //                            productObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.productListLookupData,
        //                                fields: { value: 'id', text: 'name' },
        //                                value: args.rowData.productId,
        //                                change: async (e) => {
        //                                    const selectedProduct = state.productListLookupData.find(item => item.id === e.value);
        //                                    state.productGroupId = selectedProduct?.productGroupId ?? '';

        //                                    if (selectedProduct) {
        //                                        args.rowData.productId = selectedProduct.id;

        //                                        if (numberObj) numberObj.value = selectedProduct.number;
        //                                        if (priceObj) priceObj.value = selectedProduct.unitPrice;
        //                                        if (summaryObj) summaryObj.value = selectedProduct.description;
        //                                        if (taxObj) taxObj.value = selectedProduct.taxId;

        //                                        if (quantityObj) {
        //                                            quantityObj.value = 1;
        //                                            const total = (selectedProduct.unitPrice || 0) * 1;
        //                                            if (totalObj) totalObj.value = total;
        //                                        }

        //                                        // ---- Load and attach attribute lists to THIS ROW ----
        //                                        // Initialize to empty arrays first
        //                                        args.rowData.attribute1List = [];
        //                                        args.rowData.attribute2List = [];

        //                                        if (selectedProduct.attribute1Id) {
        //                                            try {
        //                                                const resp1 = await services.getAttributeDetails(selectedProduct.attribute1Id);
        //                                                args.rowData.attribute1List = resp1.data?.content?.data ?? [];
        //                                            } catch (err) {
        //                                                args.rowData.attribute1List = [];
        //                                            }
        //                                        }

        //                                        if (selectedProduct.attribute2Id) {
        //                                            try {
        //                                                const resp2 = await services.getAttributeDetails(selectedProduct.attribute2Id);
        //                                                args.rowData.attribute2List = resp2.data?.content?.data ?? [];
        //                                            } catch (err) {
        //                                                args.rowData.attribute2List = [];
        //                                            }
        //                                        }

        //                                        // If previously selected attribute ids are not present in the new lists, clear them
        //                                        const a1Exists = args.rowData.attribute1List.some(x => x.id === args.rowData.attribute1DetailId);
        //                                        if (!a1Exists) args.rowData.attribute1DetailId = null;

        //                                        const a2Exists = args.rowData.attribute2List.some(x => x.id === args.rowData.attribute2DetailId);
        //                                        if (!a2Exists) args.rowData.attribute2DetailId = null;
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
        //                    field: 'attribute1DetailId',
        //                    headerText: 'Attribute 1',
        //                    width: 180,
        //                    editType: 'dropdownedit',
        //                    // Use the row's own list (fall back to empty)
        //                    valueAccessor: (field, data) => {
        //                        const list = data.attribute1List || [];
        //                        const item = list.find(x => x.id === data[field]);
        //                        return item ? item.value : '';
        //                    },
        //                    edit: {
        //                        create: () => document.createElement('input'),
        //                        read: () => attribute1Obj?.value,
        //                        destroy: () => attribute1Obj?.destroy(),
        //                        write: async (args) => {
        //                            // Ensure the row has attribute list loaded (product change should already have set this)
        //                            const dataList = args.rowData.attribute1List || [];

        //                            attribute1Obj = new ej.dropdowns.DropDownList({
        //                                dataSource: dataList,
        //                                fields: { value: 'id', text: 'value' },
        //                                value: args.rowData.attribute1DetailId,
        //                                placeholder: 'Select Attribute 1'
        //                            });

        //                            attribute1Obj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'attribute2DetailId',
        //                    headerText: 'Attribute 2',
        //                    width: 180,
        //                    editType: 'dropdownedit',
        //                    valueAccessor: (field, data) => {
        //                        const list = data.attribute2List || [];
        //                        const item = list.find(x => x.id === data[field]);
        //                        return item ? item.value : '';
        //                    },
        //                    edit: {
        //                        create: () => document.createElement('input'),
        //                        read: () => attribute2Obj?.value,
        //                        destroy: () => attribute2Obj?.destroy(),
        //                        write: async (args) => {
        //                            const dataList = args.rowData.attribute2List || [];

        //                            attribute2Obj = new ej.dropdowns.DropDownList({
        //                                dataSource: dataList,
        //                                fields: { value: 'id', text: 'value' },
        //                                value: args.rowData.attribute2DetailId,
        //                                placeholder: 'Select Attribute 2'
        //                            });

        //                            attribute2Obj.appendTo(args.element);
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
        //                                    const taxPercent = taxObj?.value
        //                                        ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
        //                                        : 0;
        //                                    const unitPrice = e.value ?? 0;  // Keep your existing reference
        //                                    const quantity = quantityObj?.value ?? 1;  // Fallback to 1 if unset, as in product change

        //                                    let taxAmount;
        //                                    let totalAfterTax;
        //                                    if (taxPercent === 0) {
        //                                        // Explicit zero-tax calculation: No tax applied
        //                                        taxAmount = 0;
        //                                        totalAfterTax = unitPrice;
        //                                    } else {
        //                                        // Original non-zero tax calculation
        //                                        taxAmount = (unitPrice * taxPercent) / 100;
        //                                        totalAfterTax = unitPrice + taxAmount;
        //                                    }
        //                                    const total = totalAfterTax * quantity;

        //                                    args.rowData.taxId = e.value;
        //                                    args.rowData.taxAmount = taxAmount;
        //                                    args.rowData.totalAfterTax = totalAfterTax;
        //                                    args.rowData.total = total;

        //                                    if (taxAmountObj) taxAmountObj.value = taxAmount;
        //                                    if (totalAfterTaxObj) totalAfterTaxObj.value = totalAfterTax;
        //                                    if (totalObj) totalObj.value = total;
        //                                }
        //                            });
        //                            priceObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'taxId',
        //                    headerText: 'Tax',
        //                    width: 160,
        //                    editType: 'dropdownedit',
        //                    valueAccessor: (field, data) => {
        //                        const tax = state.taxListLookupData.find(item => item.id === data[field]);
        //                        return tax ? `${tax.name} (${tax.percentage}%)` : '';
        //                    },
        //                    edit: {
        //                        create: () => document.createElement('input'),
        //                        read: () => taxObj.value,
        //                        destroy: () => taxObj.destroy(),
        //                        write: (args) => {
        //                            taxObj = new ej.dropdowns.DropDownList({
        //                                dataSource: state.taxListLookupData,
        //                                fields: { value: 'id', text: 'name' },
        //                                value: args.rowData.taxId,
        //                                placeholder: 'Select Tax',
        //                                change: (e) => {
        //                                    const selectedTax = state.taxListLookupData.find(t => t.id === e.value);
        //                                    const unitPrice = priceObj?.value ?? 0;  // Keep your existing reference
        //                                    const taxPercent = selectedTax?.percentage ?? 0;
        //                                    const quantity = quantityObj?.value ?? 1;  // Fallback to 1 if unset, as in product change

        //                                    let taxAmount;
        //                                    let totalAfterTax;
        //                                    if (taxPercent === 0) {
        //                                        // Explicit zero-tax calculation: No tax applied
        //                                        taxAmount = 0;
        //                                        totalAfterTax = unitPrice;
        //                                    } else {
        //                                        // Original non-zero tax calculation
        //                                        taxAmount = (unitPrice * taxPercent) / 100;
        //                                        totalAfterTax = unitPrice + taxAmount;
        //                                    }
        //                                    const total = totalAfterTax * quantity;

        //                                    args.rowData.taxId = e.value;
        //                                    args.rowData.taxAmount = taxAmount;
        //                                    args.rowData.totalAfterTax = totalAfterTax;
        //                                    args.rowData.total = total;

        //                                    if (taxAmountObj) taxAmountObj.value = taxAmount;
        //                                    if (totalAfterTaxObj) totalAfterTaxObj.value = totalAfterTax;
        //                                    if (totalObj) totalObj.value = total;
        //                                }
        //                            });
        //                            taxObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'taxAmount',
        //                    headerText: 'Tax Amount',
        //                    width: 150,
        //                    type: 'number', format: 'N2', textAlign: 'Right',
        //                    allowEditing: false,
        //                    edit: {
        //                        create: () => document.createElement('input'),
        //                        read: () => taxAmountObj.value,
        //                        destroy: () => taxAmountObj.destroy(),
        //                        write: (args) => {
        //                            taxAmountObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.taxAmount ?? 0,
        //                                readonly: true
        //                            });
        //                            taxAmountObj.appendTo(args.element);
        //                        }
        //                    }
        //                },
        //                {
        //                    field: 'totalAfterTax',
        //                    headerText: 'Unit Price After Tax',
        //                    width: 180,
        //                    type: 'number', format: 'N2', textAlign: 'Right',
        //                    allowEditing: false,
        //                    edit: {
        //                        create: () => document.createElement('input'),
        //                        read: () => totalAfterTaxObj.value,
        //                        destroy: () => totalAfterTaxObj.destroy(),
        //                        write: (args) => {
        //                            totalAfterTaxObj = new ej.inputs.NumericTextBox({
        //                                value: args.rowData.totalAfterTax ?? 0,
        //                                readonly: true
        //                            });
        //                            totalAfterTaxObj.appendTo(args.element);
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
        //                                        const unitPrice = priceObj.value || 0;
        //                                        const quantity = e.value || 0;

        //                                        const taxPercent = taxObj?.value
        //                                            ? (state.taxListLookupData.find(t => t.id === taxObj.value)?.percentage || 0)
        //                                            : 0;
        //                                        let taxAmount;
        //                                        let totalAfterTax;
        //                                        if (taxPercent === 0) {
        //                                            // Explicit zero-tax calculation: No tax applied
        //                                            taxAmount = 0;
        //                                            totalAfterTax = unitPrice;
        //                                        } else {
        //                                            // Original non-zero tax calculation
        //                                            taxAmount = (unitPrice * taxPercent) / 100;
        //                                            totalAfterTax = unitPrice + taxAmount;
        //                                        }
        //                                        const total = totalAfterTax * quantity;
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
        //            actionBegin: async (args) => {
                        
        //            },
        //            actionComplete: async (args) => {
        //                const purchaseOrderId = state.id;
        //                const userId = StorageManager.getUserId();
        //                //if (args.requestType === 'save' && args.data.quantity > 0) {
        //                //    const rowData = args.data;
        //                //    const product = state.productListLookupData.find(p => p.id === rowData.productId);

        //                //    if (product?.productGroupId && rowData.quantity > 0) {
        //                //        const attributes = await services.getAttributesAndValuesByProductGroupId(product.productGroupId);
        //                //        if (attributes && attributes.length) {
        //                //            methods.openAttributeModal(attributes, rowData);
        //                //        }
        //                //    }
        //                //}
        //                // Track changes manually
        //                if (args.requestType === 'save' && args.action === 'add') {
        //                    // Track added record
        //                    secondaryGrid.manualBatchChanges.addedRecords.push(args.data);
        //                    console.log('Added Record:', args.data);
        //                }

        //                if (args.requestType === 'save' && args.action === 'edit') {
        //                    // Track changed record
        //                    const index = secondaryGrid.manualBatchChanges.changedRecords.findIndex(
        //                        r => r.id === args.data?.id
        //                    );
        //                    if (index > -1) {
        //                        secondaryGrid.manualBatchChanges.changedRecords[index] = args.data;
        //                    } else {
        //                        secondaryGrid.manualBatchChanges.changedRecords.push(args.data);
        //                    }
        //                    console.log('Changed Record:', args.data);
        //                }

        //                if (args.requestType === 'delete') {
        //                    // Track deleted record
        //                    secondaryGrid.manualBatchChanges.deletedRecords.push(args.data);
        //                    console.log('Deleted Record:', args.data);
        //                }


        //                methods.calculateTotals()  // Add this line

        //                   }

        //        });
        //        secondaryGrid.obj.appendTo(secondaryGridRef.value);
        //    },
        //    getBatchChanges: () => {
        //        return secondaryGrid.manualBatchChanges;
        //    },
        //    // Add method to clear batch changes after submission
        //    clearBatchChanges: () => {
        //        secondaryGrid.manualBatchChanges = {
        //            addedRecords: [],
        //            changedRecords: [],
        //            deletedRecords: []
        //        };
        //    },

        //    refresh: () => {
        //        secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
        //    }
        //};

        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['PurchaseOrders']);
                await SecurityManager.validateToken();

                state.location = StorageManager.getLocation();
                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                mainModalRef.value?.addEventListener('shown.bs.modal', methods.onMainModalShown);

                await methods.populateVendorListLookupData();
                vendorListLookup.create();
                await methods.populateTaxListLookupData();
                taxListLookup.create();
                await methods.populatePurchaseOrderStatusListLookupData();
                purchaseOrderStatusListLookup.create();
                orderDatePicker.create();
                numberText.create();
                await methods.populateProductListLookupData();
                await secondaryGrid.create(state.secondaryData);
            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
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
            vendorIdRef,
            taxIdRef,
            orderStatusRef,
            secondaryGridRef,
            state,
            methods,
            handler: {
                handleSubmit: methods.handleFormSubmit
            }
        };
    }
};

Vue.createApp(App).mount('#app');