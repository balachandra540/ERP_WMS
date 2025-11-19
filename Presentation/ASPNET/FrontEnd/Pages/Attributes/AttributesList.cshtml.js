const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            secondaryData: [],
            deleteMode: false,
            mainTitle: null,

            // Fields
            id: '',
            number: '',
            name: '',
            description: '',
            createdAt: '',

            errors: {
                name: '',
                gridItems: []
            },

            showComplexDiv: false,
            isSubmitting: false
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);


        // ✅ Form Validation
        const validateForm = () => {
            state.errors.name = '';
            state.errors.gridItems = [];
            let isValid = true;

            if (!state.name) {
                state.errors.name = 'Name is required.';
                isValid = false;
            }

            const batch = secondaryGrid.getBatchChanges();
            const totalItems =
                (batch.addedRecords?.length ?? 0) +
                (state.secondaryData?.length ?? 0) -
                (batch.deletedRecords?.length ?? 0);

            if (totalItems <= 0) {
                state.errors.gridItems.push('At least one attribute detail must be added.');
                isValid = false;
            }

            return isValid;
        };


        // ✅ Reset Form
        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.name = '';
            state.description = '';
            state.createdAt = '';
            state.secondaryData = [];
            state.errors = { name: '', gridItems: [] };
            state.showComplexDiv = false;
        };



        // ✅ API
        const services = {
            getMainData: async () => AxiosManager.get('/Attribute/GetAttributeList'),
            getSecondaryData: async (id) => {
                const requestBody = {
                    attributeId: id,
                    isDeleted: false
                };
                return AxiosManager.post('/Attribute/GetAttributeDetails', requestBody);
            },
            createMainData: async (payload) => AxiosManager.post('/Attribute/CreateAttribute', payload),
            updateMainData: async (payload) => AxiosManager.post('/Attribute/UpdateAttribute', payload),
            deleteMainData: async (id) => AxiosManager.post('/Attribute/DeleteAttribute', { id })
        };


        const methods = {
            populateMainData: async () => {
                const res = await services.getMainData();
                state.mainData = res?.data?.content?.data ?? [];
            },

            populateSecondaryData: async (attributeId) => {
                const res = await services.getSecondaryData(attributeId);
                state.secondaryData = res?.data?.content?.data ?? [];
                secondaryGrid.refresh(state.secondaryData);  // Pass dataSource explicitly
                state.showComplexDiv = true;

            },


            // 🔥 Submit Form
            handleFormSubmit: async () => {
                try {
                    state.isSubmitting = true;
                    if (!validateForm()) return;

                    const batch = secondaryGrid.getBatchChanges();

                    // Merge existing + added, remove deleted
                    const details = [
                        ...state.secondaryData,
                        ...(batch.addedRecords || [])
                    ].filter(d => !batch.deletedRecords?.some(r => r.id === d.id))
                        .map(d => ({
                            id: d.id,
                            value: d.value
                        }));

                    const payload = {
                        id: state.id,
                        name: state.name,
                        description: state.description,
                        details
                    };

                    let response;
                    if (state.deleteMode) response = await services.deleteMainData(state.id);
                    else if (!state.id) response = await services.createMainData(payload);
                    else response = await services.updateMainData(payload);

                    if (response.data.code === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: state.deleteMode ? 'Deleted' : 'Saved successfully',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        await methods.populateMainData();
                        mainGrid.refresh();
                        mainModal.obj.hide();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Unexpected error.' });
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.' });
                } finally {
                    state.isSubmitting = false;
                    secondaryGrid.clearBatchChanges();
                }
            }
        };


        // Number TextBox
        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                    readonly: true,
                });
                numberText.obj.appendTo(numberRef.value);
            },
            refresh: () => {
                if (numberText.obj) {
                    if (state.id === '') {
                        numberText.obj.value = '';
                        numberText.obj.placeholder = '[auto]';
                    } else {
                        numberText.obj.value = state.number;
                        numberText.obj.placeholder = '';
                    }
                }
            }
        };

        Vue.watch(
            () => state.number,
            (newVal, oldVal) => {
                numberText.refresh();
            }
        );


        // Main Grid
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: '240px',
                    dataSource,
                    allowPaging: true,
                    allowSelection: true,  // Added: Enables row selection and checkbox functionality
                    selectionSettings: {
                        persistSelection: true,
                        type: 'Single'  // Added: Enforces single selection to match first grid
                    },
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'number', headerText: 'Number', width: 120 },
                        { field: 'name', headerText: 'Name', width: 200 },
                        { field: 'description', headerText: 'Description', width: 250 },
                        {
                            field: 'createdAtUtc',
                            headerText: 'Created At',
                            width: 180,
                            valueAccessor: (f, d) =>
                                d.createdAtUtc ? new Date(d.createdAtUtc).toLocaleString('en-GB') : ''
                        }
                    ],
                    toolbar: [
                        'Search',
                        { text: 'Add', id: 'AddCustom', prefixIcon: 'e-add' },
                        { text: 'Edit', id: 'EditCustom', prefixIcon: 'e-edit' },
                        { text: 'Delete', id: 'DeleteCustom', prefixIcon: 'e-delete' }
                    ],
                    // Optional: Add these events for better UX (mimics first grid's selection handling)
                    rowSelected: () => {
                        // Could enable/disable toolbar if needed; your warnings handle it
                    },
                    rowDeselected: () => {
                        // Could enable/disable toolbar if needed
                    },
                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length > 0) {
                            mainGrid.obj.clearSelection();  // Prevents multi-select
                        }
                    },
                    toolbarClick: async (args) => {
                        // =====================================================
                        // ADD
                        // =====================================================
                        if (args.item.id === 'AddCustom') {
                            resetFormState();
                            state.mainTitle = 'Add Attribute';
                            state.showComplexDiv = true;
                            numberText.refresh();
                            mainModal.obj.show();
                            return;
                        }
                        // =====================================================
                        // Common Selection Logic for Edit / Delete
                        // =====================================================
                        const selected = mainGrid.obj.getSelectedRecords();
                        if (args.item.id === 'EditCustom' || args.item.id === 'DeleteCustom') {
                            if (selected.length === 0) {
                                Swal.fire({ icon: 'warning', text: 'Please select a row.' });
                                return;
                            }
                            if (selected.length > 1) {
                                Swal.fire({ icon: 'warning', text: 'Please select only one row.' });
                                return;
                            }
                        }
                        // =====================================================
                        // EDIT
                        // =====================================================
                        if (args.item.id === 'EditCustom') {
                            const row = selected[0];
                            state.mainTitle = 'Edit Attribute';
                            Object.assign(state, {
                                id: row.id,
                                number: row.number,
                                name: row.name,
                                description: row.description,
                                createdAt: new Date(row.createdAtUtc).toLocaleString('en-GB'),
                                deleteMode: false
                            });
                            numberText.refresh();
                            // Reset batch changes before edit
                            // Note: If this is the secondary grid, adjust reference if needed (e.g., mainGrid.clearBatchChanges())
                           // mainGrid.clearBatchChanges();  // Self-reference if batch editing enabled
                            await methods.populateSecondaryData(row.id);
                            // Assuming secondaryGrid.refresh() is for another grid; adjust if this is self-refresh
                            mainGrid.refresh();
                            mainModal.obj.show();
                            return;
                        }
                        // =====================================================
                        // DELETE
                        // =====================================================
                        if (args.item.id === 'DeleteCustom') {
                            const row = selected[0];
                            Object.assign(state, row);
                            state.deleteMode = true;
                            state.mainTitle = 'Delete Attribute?';
                            mainModal.obj.show();
                            return;
                        }
                    }
                });
                mainGrid.obj.appendTo(mainGridRef.value);  // Updated ref
            },
            refresh: () => mainGrid.obj.setProperties({ dataSource: state.mainData })  // Updated data source
        };

        // Secondary Grid (Only "value")
        const secondaryGrid = {
            obj: null,
            manualBatchChanges: { addedRecords: [], changedRecords: [], deletedRecords: [] },

            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 300,
                    dataSource,
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' },
                    columns: [
                        { field: 'id', isPrimaryKey: true, visible: false },
                        {
                            field: 'value',
                            headerText: 'Value',
                            width: 250,
                            validationRules: { required: true }
                        }
                    ],
                    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],

                    actionComplete: (args) => {
                        if (args.requestType === 'save' && args.action === 'add')
                            secondaryGrid.manualBatchChanges.addedRecords.push(args.data);

                        if (args.requestType === 'save' && args.action === 'edit')
                            secondaryGrid.manualBatchChanges.changedRecords.push(args.data);

                        if (args.requestType === 'delete')
                            secondaryGrid.manualBatchChanges.deletedRecords.push(args.data);
                    }
                });

                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },

            getBatchChanges: () => secondaryGrid.manualBatchChanges,

            clearBatchChanges: () => {
                secondaryGrid.manualBatchChanges = { addedRecords: [], changedRecords: [], deletedRecords: [] };
            },

            refresh: () => {
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };


        // Modal
        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };


        // On Mounted
        Vue.onMounted(async () => {
            await methods.populateMainData();
            await mainGrid.create(state.mainData);
            await secondaryGrid.create(state.secondaryData);
            mainModal.create();
            numberText.create();
        });

        return {
            state,
            mainGridRef,
            mainModalRef,
            numberRef,
            secondaryGridRef,
            handler: { handleSubmit: methods.handleFormSubmit }
        };
    }
};

Vue.createApp(App).mount('#app');
