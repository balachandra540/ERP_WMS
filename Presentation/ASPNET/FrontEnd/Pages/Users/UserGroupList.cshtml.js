const App = {
    setup() {

        // =========================
        // STATE
        // =========================
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            mainTitle: null,

            id: '',
            name: '',
            description: '',

            isActive: true,
            isSpecialDiscount: false,
            maxSpecialDiscount: null,   // ⭐ NEW

            errors: {
                name: ''
            },

            isSubmitting: false
        });

        const mainGridRef = Vue.ref(null);
        const nameRef = Vue.ref(null);

        // =========================
        // SERVICES
        // =========================
        const services = {
            getMainData: async () =>
                await AxiosManager.get('/UserGroup/GetUserGroupList', {}),

            createMainData: async () =>
                await AxiosManager.post('/UserGroup/CreateUserGroup', {
                    name: state.name,
                    description: state.description,
                    isActive: state.isActive,
                    isSpecialDiscount: state.isSpecialDiscount,
                    maxSpecialDiscount: state.isSpecialDiscount
                        ? state.maxSpecialDiscount
                        : null,
                    createdById: StorageManager.getUserId()
                }),

            updateMainData: async () =>
                await AxiosManager.post('/UserGroup/UpdateUserGroup', {
                    id: state.id,
                    name: state.name,
                    description: state.description,
                    isActive: state.isActive,
                    isSpecialDiscount: state.isSpecialDiscount,
                    maxSpecialDiscount: state.isSpecialDiscount
                        ? state.maxSpecialDiscount
                        : null,
                    updatedById: StorageManager.getUserId()
                }),

            deleteMainData: async () =>
                await AxiosManager.post('/UserGroup/DeleteUserGroup', {
                    id: state.id,
                    deletedById: StorageManager.getUserId()
                })
        };

        // =========================
        // METHODS
        // =========================
        const methods = {
            populateMainData: async () => {
                const res = await services.getMainData();
                state.mainData = res?.data?.content?.data ?? [];
            }
        };

        // =========================
        // TEXTBOX
        // =========================
        const nameText = {
            obj: null,
            create: () => {
                nameText.obj = new ej.inputs.TextBox({
                    placeholder: 'Enter Name'
                });
                nameText.obj.appendTo(nameRef.value);
            },
            refresh: () => {
                if (nameText.obj) {
                    nameText.obj.value = state.name;
                }
            }
        };

        Vue.watch(() => state.name, () => {
            state.errors.name = '';
            nameText.refresh();
        });

        // =========================
        // SUBMIT
        // =========================
        const handler = {
            handleSubmit: async () => {
                try {
                    state.isSubmitting = true;

                    let isValid = true;

                    if (!state.name) {
                        state.errors.name = 'Name is required.';
                        isValid = false;
                    }

                    if (state.isSpecialDiscount) {
                        if (
                            state.maxSpecialDiscount == null ||
                            state.maxSpecialDiscount <= 0 ||
                            state.maxSpecialDiscount > 100
                        ) {
                            Swal.fire(
                                'Validation Error',
                                'Max Special Discount must be between 1 and 100.',
                                'warning'
                            );
                            isValid = false;
                        }
                    }

                    if (!isValid) return;

                    const response = state.id === ''
                        ? await services.createMainData()
                        : state.deleteMode
                            ? await services.deleteMainData()
                            : await services.updateMainData();

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        Swal.fire({
                            icon: 'success',
                            title: state.deleteMode
                                ? 'Delete Successful'
                                : 'Save Successful',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        setTimeout(() => {
                            mainModal.obj.hide();
                            resetFormState();
                        }, 2000);
                    } else {
                        Swal.fire('Failed', response.data.message, 'error');
                    }
                } catch (e) {
                    Swal.fire(
                        'Error',
                        e.response?.data?.message ?? 'Unexpected error',
                        'error'
                    );
                } finally {
                    state.isSubmitting = false;
                }
            }
        };

        // =========================
        // RESET
        // =========================
        const resetFormState = () => {
            state.id = '';
            state.name = '';
            state.description = '';

            state.isActive = true;
            state.isSpecialDiscount = false;
            state.maxSpecialDiscount = null;

            state.errors = { name: '' };
        };

        // =========================
        // GRID
        // =========================
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: '260px',
                    dataSource,
                    allowPaging: true,
                    allowSorting: true,
                    filterSettings: { type: 'CheckBox' },
                    pageSettings: { pageSize: 50 },
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'name', headerText: 'Name', width: 180 },
                        { field: 'description', headerText: 'Description', width: 300 },
                        {
                            field: 'isActive',
                            headerText: 'Active',
                            type: 'boolean',
                            displayAsCheckBox: true,
                            width: 100
                        },
                        {
                            field: 'isSpecialDiscount',
                            headerText: 'Special Discount',
                            type: 'boolean',
                            displayAsCheckBox: true,
                            width: 160
                        },
                        {
                            field: 'maxSpecialDiscount',
                            headerText: 'Max Special Discount (%)',
                            width: 200,
                            textAlign: 'Right'
                        }
                    ],
                    toolbar: [
                        'Search',
                        { text: 'Add', id: 'AddCustom', prefixIcon: 'e-add' },
                        { text: 'Edit', id: 'EditCustom', prefixIcon: 'e-edit' },
                        { text: 'Delete', id: 'DeleteCustom', prefixIcon: 'e-delete' }
                    ],
                    toolbarClick: (args) => {
                        const row = mainGrid.obj.getSelectedRecords()[0];

                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'Add User Group';
                            resetFormState();
                            mainModal.obj.show();
                        }

                        if (!row) return;

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'Edit User Group';
                            Object.assign(state, row);
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            state.mainTitle = 'Delete User Group?';
                            Object.assign(state, row);
                            mainModal.obj.show();
                        }
                    }
                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () => {
                mainGrid.obj.setProperties({ dataSource: state.mainData });
            }
        };

        // =========================
        // MODAL
        // =========================
        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(
                    document.getElementById('MainModal'),
                    { backdrop: 'static', keyboard: false }
                );
            }
        };

        // =========================
        // ON MOUNT
        // =========================
        Vue.onMounted(async () => {
            await SecurityManager.authorizePage(['UserGroups']);
            await SecurityManager.validateToken();

            await methods.populateMainData();
            await mainGrid.create(state.mainData);
            nameText.create();
            mainModal.create();
        });

        return {
            mainGridRef,
            nameRef,
            state,
            handler
        };
    }
};

Vue.createApp(App).mount('#app');
