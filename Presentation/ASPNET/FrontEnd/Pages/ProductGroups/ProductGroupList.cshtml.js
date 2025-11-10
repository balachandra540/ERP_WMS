const App = {   
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            mainTitle: null,
            id: '',
            name: '',
            description: '',
            hasAttributes: false, //  Add this line
            attributes: [], //  add this array to hold attribute rows
            errors: {
                name: ''
            },
            isSubmitting: false,
            hasExistingAttributes: false,
            productGroupId: null,
            //  add these
            showAddButton: false,
            showViewButton: false,
            disableAddButton :false,
            disableViewButton: false,
            isViewMode: false,
            isLoadingAttributes: false,

        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const attributesModalRef = Vue.ref(null);


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

        Vue.watch(
            () => state.name,
            (newVal, oldVal) => {
                state.errors.name = '';
                nameText.refresh();
            }
        );      
        // Watch checkbox change
        Vue.watch(
            () => state.hasAttributes,
            async (newVal) => {
                debugger;
                if (newVal) {
                    await checkExistingAttributes(state.productGroupId);

                    //  If no attributes exist, allow adding new
                    if (!state.hasExistingAttributes) {
                        if (state.attributes.length === 0) {
                           /// state.attributes.push({ name: '' });
                            state.attributes.push({ name: '', values: [] });

                        }
                    }
                } else {
                    // Unchecked → clear attributes
                    state.attributes = [];
                }
            }
        );


        const validateForm = function () {
            state.errors.name = '';

            let isValid = true;

            if (!state.name) {
                state.errors.name = 'Name is required.';
                isValid = false;
            }

            return isValid;
        };
        const nextTick = async () => {
            const checkbox = document.getElementById('HasAttributes');
            if (checkbox) checkbox.disabled = true;
        };
        const resetFormState = () => {
            state.id = '';
            state.name = '';
            state.description = '';
            state.hasAttributes = false;
            state.attributes = [];
            state.hasExistingAttributes = false;
            state.showAddButton = false;
            state.showViewButton = false;
            state.disableAddButton = false;
            state.disableViewButton = false;


            state.errors = {
                name: ''
            };
        };
        
        // Fetch attributes for a ProductGroupId to know if already exist
        const checkExistingAttributes = async (productGroupId) => {
            try {
                //  Skip DB call if product group is not yet created
                if (!productGroupId || productGroupId === '') {
                    state.hasExistingAttributes = false;
                    state.attributes = [];
                    state.showAddButton = true;
                    state.showViewButton = true;
                    state.disableAddButton = false;
                    state.disableViewButton = true;
                    return;
                }
                debugger;

                // ✅ 1️⃣ Load all attributes
                //const response = await AxiosManager.get(`/ProductGroup/GetAttributes?productGroupId=${productGroupId}`, {});
                const attrResponse = await services.getAttributesData(productGroupId);
                const attributes = attrResponse?.data?.content?.data || [];

                

                // ✅ 2️⃣ Load all values (for the product group, not per attribute)
                const valueResponse = await services.getAttributeValuesData(productGroupId);
                const allValues = valueResponse?.data?.content?.data || [];

                // ✅ 3️⃣ Combine each attribute with its values
                state.attributes = attributes.map(a => ({
                    id: a.id,
                    name: a.attributeName,
                    values: allValues
                        .filter(v => v.attributeId === a.id)
                        .map(v => ({
                            id: v.id,
                            valueName: v.valueName
                        }))
                }));
                state.hasExistingAttributes = state.attributes.length > 0;

            } catch (error) {
                console.error('Error fetching attributes:', error);
                state.hasExistingAttributes = false;
                state.attributes = [];
            }
        };
        // 🔹 For Add Mode
        const openAddAttributes = async () => {
            state.isViewMode = false;
            
            await checkExistingAttributes(state.id);
            if (state.attributes.length === 0) {
                state.attributes.push({ name: '' });
            }
            //await nextTick();
            attributesModal.show();
        };

        // 🔹 For View Mode
        const openViewAttributes = async () => {
            state.isViewMode = true;
            state.isLoadingAttributes = true;

            await checkExistingAttributes(state.id);

            state.isLoadingAttributes = false;
            //await nextTick();
            attributesModal.show();
        };

        const services = {
            getMainData: async () => {
                debugger;
                try {
                    const response = await AxiosManager.get('/ProductGroup/GetProductGroupList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (name, description, hasAttributes, createdById) => {
                try {
                    const response = await AxiosManager.post('/ProductGroup/CreateProductGroup', {
                        name, description, hasAttributes, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, name, description, hasAttributes, updatedById) => {
                try {
                    const response = await AxiosManager.post('/ProductGroup/UpdateProductGroup', {
                        id, name, description, hasAttributes, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/ProductGroup/DeleteProductGroup', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            //  Create / Save
            createAttributesData: async (ProductGroupId, attributes, createdById) => {
                try {
                    const payload = attributes.map(attr => ({
                        ProductGroupId,
                        AttributeName: attr.name,
                        CreatedBy: createdById
                    }));
                    const response = await AxiosManager.post('/ProductGroup/CreateAttributes', payload, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            // ✅ Update
            updateAttributesData: async (ProductGroupId, attributes, updatedById) => {
                try {
                    const payload = attributes.map(attr => ({
                        Id: attr.id,
                        ProductGroupId,
                        AttributeName: attr.name,
                        UpdatedBy: updatedById
                    }));
                    const response = await AxiosManager.post('/ProductGroup/UpdateAttributes', payload, {});
                    return response;

                } catch (error) {
                    throw error;
                }
            },

                // ✅ Get attributes by ProductGroupId
                getAttributesData: async (productGroupId) => {
                    try {
                        const response = await AxiosManager.get(`/ProductGroup/GetAttributes?productGroupId=${productGroupId}`, {});
                        return response;
                    } catch (error) {
                        throw error;
                    }
                },

            // ✅ Delete specific attribute or all by ProductGroup
            deleteAttributeData: async (idOrProductGroupId, deletedById, deleteAll = false) => {
                try {
                    const payload = {
                        Id:idOrProductGroupId,
                        DeletedById: deletedById,
                        DeleteValues:deleteAll
                    };
                    return await AxiosManager.post('/ProductGroup/DeleteAttributes', payload);
                } catch (error) {
                    throw error;
                }
            },
             // ✅ Delete attribute
            //deleteAttributeData: async  (attributeId)=> {
            //    try {
            //        const result = await Swal.fire({
            //            title: 'Are you sure?',
            //            text: 'Do you want to delete this attribute?',
            //            icon: 'warning',
            //            showCancelButton: true,
            //            confirmButtonText: 'Yes, delete it!'
            //        });

            //        if (result.isConfirmed) {
            //            const response = await services.deleteAttributeData(attributeId, StorageManager.getUserId(), false);
            //            if (response.data.code === 200) {
            //                Swal.fire({
            //                    icon: 'success',
            //                    title: 'Deleted!',
            //                    text: 'Attribute deleted successfully.',
            //                    timer: 1500,
            //                    showConfirmButton: false
            //                });
            //                state.attributes = state.attributes.filter(a => a.id !== attributeId);
            //            }
            //        }
            //    } catch (error) {
            //        Swal.fire({
            //            icon: 'error',
            //            title: 'Delete failed',
            //            text: error.response?.data?.message ?? 'Unable to delete attribute.'
            //        });
            //    }
            //}
            // ==========================
            // 🔹 Attribute Values APIs
            // ==========================

            // ✅ Create / Save Values
            createAttributeValuesData: async (values) => {
                try {
                    const payload = values.map(val => ({
                        AttributeId: val.attributeId,
                        ValueName: val.valueName,
                       CreatedById: val.createdById

                    }));
                    const response = await AxiosManager.post('/ProductGroup/CreateAttributeValues', payload, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            // ✅ Update Values
            updateAttributeValuesData: async (values) => {
                try {
                    const payload = values.map(val => ({
                        Id: val.id,
                        AttributeId: val.attributeId,
                        ValueName: val.valueName,
                        UpdatedById: val.updatedById
                    }));
                    const response = await AxiosManager.post('/ProductGroup/UpdateAttributeValues', payload, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            // ✅ Get Values (by ProductGroup or Attribute)
            getAttributeValuesData: async (productGroupId, attributeId = null) => {
                try {
                    // Either get all for a product group, or specific attribute’s values
                    const url = attributeId
                        ? `/ProductGroup/GetAttributeValues?attributeId=${attributeId}`
                        : `/ProductGroup/GetAttributeValues?productGroupId=${productGroupId}`;

                    const response = await AxiosManager.get(url);
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            // ✅ Delete Attribute Values
            deleteAttributeValuesData: async (idOrAttributeId, deletedById, deleteAll = false) => {
                try {
                    const payload = {
                        IdOrAttributeId: idOrAttributeId,
                        DeletedById: deletedById,
                        DeleteAll:deleteAll
                    };
                    const response = await AxiosManager.post('/ProductGroup/DeleteAttributeValues', payload);
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
                    hasAttributes: item.hasAttributes ?? false, // ✅ ensure boolean
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        state.isSubmitting = false;
                        return;
                    }

                    const userId = StorageManager.getUserId();
                    let response;

                    // ✅ 1️⃣ Determine operation type
                    if (state.id === '') {
                        // CREATE ProductGroup
                        response = await services.createMainData(
                            state.name,
                            state.description,
                            state.hasAttributes,
                            userId
                        );
                    } else if (state.deleteMode) {
                        // DELETE ProductGroup
                        response = await services.deleteMainData(
                            state.id,
                            userId
                        );
                    } else {
                        // UPDATE ProductGroup
                        response = await services.updateMainData(
                            state.id,
                            state.name,
                            state.description,
                            state.hasAttributes,
                            userId
                        );
                    }

                    // ✅ 2️⃣ Validate main ProductGroup response
                    if (response?.data?.code !== 200) {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
                            text: response.data.message ?? 'Please check your data.',
                            confirmButtonText: 'Try Again'
                        });
                        return;
                    }

                    // ✅ 3️⃣ Extract productGroupId (for new or updated)
                    const productGroupId = state.id = response?.data?.content?.data?.id;

                    // ✅ 4️⃣ Save Attributes and Values if applicable
                    if (!state.deleteMode && state.hasAttributes) {
                        // ✅ 5️⃣ Success UI handling
                        await methods.populateMainData();
                        mainGrid.refresh();
                        setTimeout(() => {
                            mainModal.obj.hide();
                            resetFormState();
                        }, 10000);
                        await handler.saveAttributesData(productGroupId, userId);
                    }

                    // ✅ 5️⃣ Success UI handling
                    await methods.populateMainData();
                    mainGrid.refresh();

                    if (!state.deleteMode) {
                        state.mainTitle = 'Edit Product Group';
                        state.id = productGroupId;
                        state.name = response?.data?.content?.data?.name ?? state.name;
                        state.description = response?.data?.content?.data?.description ?? state.description;

                        Swal.fire({
                            icon: 'success',
                            title: 'Save Successful',
                            text: 'Product Group and its attributes saved successfully.',
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

                } catch (error) {
                    console.error("handleSubmit error:", error);
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
            addAttribute: async () => {
                // Check if any attribute is empty before adding a new one
                const hasEmpty = state.attributes.some(attr => !attr.name || attr.name.trim() === '');

                if (hasEmpty) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Incomplete Attribute',
                        text: 'Please fill the existing attribute name before adding a new one.'
                    });
                    return; // Stop here
                }
                const trimmedNames = state.attributes.map(a => a.name?.trim().toLowerCase()).filter(n => n);

                // Check for duplicates
                const hasDuplicate = new Set(trimmedNames).size !== trimmedNames.length;
                if (hasDuplicate) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Attribute',
                        text: 'Duplicate attribute names are not allowed.'
                    });
                    return;
                }


                // Otherwise, add a new blank row
                state.attributes.push({ name: '' });

                // Optional: focus the new input row after it renders
                //await nextTick();
                const inputs = document.querySelectorAll('#AttributesModal input.form-control');
                if (inputs.length > 0) {
                    inputs[inputs.length - 1].focus();
                }
            },

            removeAttribute: async (index) => {
                try {
                    const attribute = state.attributes[index];
                    if (!attribute) return;

                    // Confirm deletion
                    const confirm = await Swal.fire({
                        icon: 'warning',
                        title: 'Delete Attribute?',
                        text: `Are you sure you want to delete "${attribute.name}"?`,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Delete',
                        cancelButtonText: 'Cancel'
                    });

                    if (!confirm.isConfirmed) return;

                    // Remove locally from UI
                    state.attributes.splice(index, 1);

                    // If the attribute exists in DB, delete from backend
                    if (attribute.id && attribute.id !== 0) {
                        await handler.deleteAttributeData(attribute.id, StorageManager.getUserId(),true);
                    }

                } catch (error) {
                    console.error("Error deleting attribute:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete Failed',
                        text: error.response?.data?.message ?? 'Please try again.'
                    });
                }
            },


            addAttributeValue: (attrIndex) => {
                try {
                    const attr = state.attributes[attrIndex];

                    // ✅ Ensure attr exists
                    if (!attr) {
                        console.warn("Invalid attribute index:", attrIndex);
                        return;
                    }

                    // ✅ Ensure attr.values is an array
                    if (!Array.isArray(attr.values)) {
                        attr.values = [];
                    }

                    // ✅ Check for empty existing value before adding new one
                    const hasEmptyValue = attr.values.some(v => !v.valueName || !v.valueName.trim());
                    if (hasEmptyValue) {
                        Swal.fire({ icon: 'warning', text: 'Fill the existing value first.' });
                        return;
                    }

                    // ✅ Add new empty value row
                    attr.values.push({ valueName: '' });
                }
                catch (error) {
                    console.error("Error in addAttributeValue:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Unexpected Error',
                        text: 'Something went wrong while adding a value.'
                    });
                }
            },

            //removeAttributeValue: (attrIndex, valIndex) => {
            //    try {
            //        // ✅ Ensure valid attribute & array
            //        const attr = state.attributes[attrIndex];
            //        if (!attr || !Array.isArray(attr.values)) {
            //            console.warn("No values array found for attribute index:", attrIndex);
            //            return;
            //        }

            //        // ✅ Safe delete (ignore invalid indexes)
            //        if (valIndex >= 0 && valIndex < attr.values.length) {
            //            attr.values.splice(valIndex, 1);
            //        }
            //    }
            //    catch (error) {
            //        console.error("Error in addAttributeValue:", error);
            //        Swal.fire({
            //            icon: 'error',
            //            title: 'Unexpected Error',
            //            text: 'Something went wrong while adding a value.'
            //        });
            //    }
            //},

            removeAttributeValue: async (attrIndex, valIndex) => {
                try {
                    const attr = state.attributes[attrIndex];
                    if (!attr || !Array.isArray(attr.values)) {
                        console.warn("No values array found for attribute index:", attrIndex);
                        return;
                    }

                    const value = attr.values[valIndex];
                    if (!value) return;

                    // ✅ Ask confirmation before delete
                    const confirm = await Swal.fire({
                        icon: 'warning',
                        title: 'Delete Value?',
                        text: `Are you sure you want to delete "${value.valueName}"?`,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Delete',
                        cancelButtonText: 'Cancel'
                    });

                    if (!confirm.isConfirmed) return;

                    // ✅ Remove locally first
                    attr.values.splice(valIndex, 1);

                    // ✅ Delete from backend if it exists in DB
                    if (value.id && value.id !== 0) {
                        await services.deleteAttributeValuesData(value.id, StorageManager.getUserId(),false);
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Value removed successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });

                } catch (error) {
                    console.error("Error deleting attribute value:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete Failed',
                        text: error.response?.data?.message ?? 'Please try again.'
                    });
                }
            },

            saveAttributesData: async function (productGroupId, userId) {
                try {
                    if (!state.attributes || state.attributes.length === 0) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'No Attributes',
                            text: 'Please add at least one attribute before saving.'
                        });
                        return;
                    }

                    if (state.hasAttributes) {
                        const invalidAttributes = state.attributes.filter(attr =>
                            !attr.name || attr.name.trim() === '' ||
                            (attr.values && attr.values.some(v => !v.valueName || v.valueName.trim() === ''))
                        );

                        if (invalidAttributes.length > 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Missing Attribute Data',
                                text: 'Please ensure all attribute names and values are filled before saving.'
                            });
                            return;
                        }
                    }

                    let productgroupresponse = [];
                    if (!userId) userId = StorageManager.getUserId();

                    // Fallbacks only when missing
                    if (!state.id) {
                        // handleSubmit should return the created/updated product group id
                         await handler.handleSubmit();
                    } else {
                        productGroupId = state.id;
                        productgroupresponse = await services.updateMainData(state.id, state.name, state.description,state.hasAttributes,userId );
                    }



                    // Split attributes into new and existing
                    const newAttributes = state.attributes.filter(a => !a.id || a.id === 0);
                    const updateAttributes = state.attributes.filter(a => a.id && a.id !== 0);

                    let createdAttributes = [];
                    let updatedAttributes = [];

                    // ✅ 1️⃣ CREATE NEW ATTRIBUTES
                    if (newAttributes.length > 0) {
                        const createResponse = await services.createAttributesData(productGroupId, newAttributes, userId);
                        if (createResponse?.data?.code === 200 && createResponse?.data?.content?.length > 0) {
                            createdAttributes = createResponse.data.content;
                        }
                    }

                    // ✅ 2️⃣ UPDATE EXISTING ATTRIBUTES
                    if (updateAttributes.length > 0) {
                        const updateResponse = await services.updateAttributesData(productGroupId, updateAttributes, userId);
                        if (updateResponse?.data?.code === 200 && updateResponse?.data?.content?.length > 0) {
                            updatedAttributes = updateResponse.data.content;
                        }
                    }

                    // ✅ 3️⃣ COMBINE ALL ATTRIBUTES (for saving values)
                    const allAttributes = [
                        ...createdAttributes.map(a => ({
                            id: a.data.id,
                            name: a.data.attributeName,
                            values: newAttributes.find(x => x.name === a.data.attributeName)?.values || []
                        })),
                        ...updateAttributes
                    ];

                    // ✅ 4️⃣ PREPARE VALUES FOR CREATE & UPDATE
                    const newValues = [];
                    const updatedValues = [];

                    allAttributes.forEach(attr => {
                        if (attr.values && attr.values.length > 0) {
                            attr.values.forEach(v => {
                                if (!v.valueName || v.valueName.trim() === '') return;

                                // If ID exists → update, else create
                                if (v.id && v.id !== 0) {
                                    updatedValues.push({
                                        id: v.id,
                                        attributeId: attr.id,
                                        valueName: v.valueName,
                                        updatedById: userId
                                    });
                                } else {
                                    newValues.push({
                                        attributeId: attr.id,
                                        valueName: v.valueName,
                                        createdById: userId
                                    });
                                }
                            });
                        }
                    });

                    // ✅ 5️⃣ CREATE ATTRIBUTE VALUES
                    if (newValues.length > 0) {
                        const valueCreateResponse = await services.createAttributeValuesData(newValues);
                        if (valueCreateResponse?.data?.code !== 200)
                            throw new Error("Error creating attribute values.");
                    }

                    // ✅ 6️⃣ UPDATE ATTRIBUTE VALUES
                    if (updatedValues.length > 0) {
                        const valueUpdateResponse = await services.updateAttributeValuesData(updatedValues);
                        if (valueUpdateResponse?.data?.code !== 200)
                            throw new Error("Error updating attribute values.");
                    }

                    // ✅ 7️⃣ FINAL SUCCESS MESSAGE
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved!',
                        text: 'Attributes and values saved successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    attributesModal.obj.hide();

                } catch (error) {
                    console.error("Save attributes error:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error saving attributes',
                        text: error.response?.data?.message ?? 'Please try again.'
                    });
                }
            },

            // ✅ Delete attribute
            deleteAttributeData: async  (attributeId,userId,DeleteValues = false)=> {
                try {
                   
                    const response = await services.deleteAttributeData(attributeId, userId, DeleteValues);
                        if (response.data.code === 200) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: 'Attribute deleted successfully.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            state.attributes = state.attributes.filter(a => a.id !== attributeId);
                        }
                    
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete failed',
                        text: error.response?.data?.message ?? 'Unable to delete attribute.'
                    });
                }
            }

        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['ProductGroups']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);
                nameText.create();
                mainModal.create();
                attributesModal.create();
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
                        { field: 'name', headerText: 'Name', width: 200, minWidth: 200 },
                        { field: 'description', headerText: 'Description', width: 400, minWidth: 400 },
                        
                        { field: 'hasAttributes', headerText: 'Has Attributes', textAlign: 'Center', width: 120, minWidth: 120, type: 'boolean', displayAsCheckBox: true },

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
                        mainGrid.obj.autoFitColumns(['name', 'description', 'createdAtUtc']);
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
                            state.mainTitle = 'Add Product Group';
                            resetFormState();
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Product Group';
                                state.id = selectedRecord.id ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.hasAttributes = selectedRecord.hasAttributes ?? false; // ✅ added
                                //  If hasAttributes true, check existing attributes in DB
                                if (state.hasAttributes) {
                                    await checkExistingAttributes(state.id);

                                    // Always show both buttons
                                    state.showAddButton = true;
                                    state.showViewButton = true;

                                    if (state.hasExistingAttributes) {
                                        //  Attributes already exist → disable Add, enable View
                                        state.disableAddButton = false;
                                        state.disableViewButton = false;
                                    } else {
                                        //  No attributes → enable Add, disable View
                                        state.disableAddButton = false;
                                        state.disableViewButton = true;
                                    }

                                    //// Optional: disable the HasAttributes checkbox
                                    //nextTick(() => {
                                    //    const checkbox = document.getElementById('HasAttributes');
                                    //    if (checkbox) checkbox.disabled = true;
                                    //});
                                }
                                else {
                                    // Not attribute-based group → hide both
                                    state.showAddButton = false;
                                    state.showViewButton = false;
                                }

                                mainModal.obj.show();

                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Product Group?';
                                state.id = selectedRecord.id ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.hasAttributes = selectedRecord.hasAttributes ?? false; // ✅ added
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
        const attributesModal = {
            obj: null,
            create: () => {
                attributesModal.obj = new bootstrap.Modal(attributesModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            },
            show: () => {
                attributesModal.obj.show();
            },
            hide: () => {
                attributesModal.obj.hide();
            }
        };

        return {
            mainGridRef,
            mainModalRef,
            nameRef,
            state,
            handler,
            attributesModalRef, // added
            openAddAttributes,
            openViewAttributes,
        };
    }
};

Vue.createApp(App).mount('#app');