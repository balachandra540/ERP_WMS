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
            
            errors: {
                name: ''
            },

            isSubmitting: false,
            isRoleSubmitting: false,

            // Role Management Data
            roleList: [],       // Master list of all roles
            assignedRoles: []   // Roles assigned to the current group
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
                    createdById: StorageManager.getUserId()
                }),

            updateMainData: async () =>
                await AxiosManager.post('/UserGroup/UpdateUserGroup', {
                    id: state.id,
                    name: state.name,
                    description: state.description,
                    isActive: state.isActive,
                    updatedById: StorageManager.getUserId()
                }),

            deleteMainData: async () =>
                await AxiosManager.post('/UserGroup/DeleteUserGroup', {
                    id: state.id,
                    deletedById: StorageManager.getUserId()
                }),
            // --- Role Management Services ---
            getAllRoles: async () =>
                await AxiosManager.get('/Security/GetRoleList', {}),

            getUserGroupRoles: async (userGroupId) =>
                await AxiosManager.get(`/UserGroup/GetUserGroupRoles?userGroupId=${userGroupId}`),

            saveUserGroupRoles: async (userGroupId, roleIds) =>
                await AxiosManager.post('/UserGroup/UpdateUserGroupRoles', {
                    userGroupId: userGroupId,
                    roleIds: roleIds,
                    updatedById: StorageManager.getUserId()
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
            },
            // Role Submit
            saveRoles: async () => {
                try {
                    state.isRoleSubmitting = true;

                    // Get selected IDs from Syncfusion Role Grid
                    const selectedRecords = roleGrid.obj.getSelectedRecords();
                    const roleIds = selectedRecords.map(r => r.id);

                    const response = await services.saveUserGroupRoles(state.id, roleIds);

                    if (response.data.code === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Roles Updated Successfully',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        roleModal.obj.hide();
                    } else {
                        Swal.fire('Error', response.data.message, 'error');
                    }
                } catch (e) {
                    Swal.fire('Error', 'Unexpected error occurred.', 'error');
                } finally {
                    state.isRoleSubmitting = false;
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
                    ],
                    toolbar: [
                        'Search',
                        { text: 'Add', id: 'AddCustom', prefixIcon: 'e-add' },
                        { text: 'Edit', id: 'EditCustom', prefixIcon: 'e-edit' },
                        { text: 'Delete', id: 'DeleteCustom', prefixIcon: 'e-delete' },
                        { text: 'Roles', id: 'RolesCustom', prefixIcon: 'e-people' }
                    ],
                    // FIX: Add 'async' keyword here
                    toolbarClick: async (args) => {
                        const row = mainGrid.obj.getSelectedRecords()[0];

                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'Add User Group';
                            resetFormState();
                            mainModal.obj.show();
                        }

                        if (!row) {
                            // Optional: Handle case where user clicks Edit/Delete/Roles without selection
                            return;
                        }

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

                        // Roles
                        if (args.item.id === 'RolesCustom') {
                            state.id = row.id;
                            state.name = row.name;

                            // Now 'await' will work because the parent function is async
                            if (state.roleList.length === 0) {
                                const res = await services.getAllRoles();
                                state.roleList = res?.data?.content?.data ?? [];
                            }

                            const assignedRes = await services.getUserGroupRoles(state.id);
                            state.assignedRoles = assignedRes?.data?.content?.data ?? [];

                            roleModal.obj.show();

                            setTimeout(() => {
                                if (!roleGrid.obj) {
                                    roleGrid.create();
                                } else {
                                    roleGrid.refresh();
                                }
                            }, 200);
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
        // ROLE GRID (New)
        // =========================
        const roleGrid = {
            obj: null,
            create: () => {
                roleGrid.obj = new ej.grids.Grid({
                    dataSource: state.roleList, // Bind to all available roles
                    height: '300px',
                    selectionSettings: { type: 'Multiple', persistSelection: true },
                    columns: [
                        { type: 'checkbox', width: 50 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'name', headerText: 'Role Name', width: 200 },
                        { field: 'description', headerText: 'Description', width: 300 }
                    ],
                    // This event triggers when data is loaded into the grid rows
                    dataBound: () => {
                        if (state.assignedRoles.length > 0 && roleGrid.obj) {
                            const selectedIndexes = [];
                            const currentViewData = roleGrid.obj.getCurrentViewRecords();

                            // Loop through grid rows to find matches in assignedRoles
                            currentViewData.forEach((row, index) => {
                                if (state.assignedRoles.some(ar => ar.id === row.id)) {
                                    selectedIndexes.push(index);
                                }
                            });

                            // Select the matching rows
                            if (selectedIndexes.length > 0) {
                                roleGrid.obj.selectRows(selectedIndexes);
                            }
                        }
                    }
                });
                roleGrid.obj.appendTo('#RoleGrid');
            },
            refresh: () => {
                if (roleGrid.obj) {
                    // Reset selection before re-binding to avoid ghosts
                    roleGrid.obj.clearSelection();
                    roleGrid.obj.dataSource = state.roleList;
                }
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
                    {
                        backdrop: 'static',
                        keyboard: false,
                        focus: false // <--- ADD THIS to fix the "getFocusInfo" error
                    }
                );
            }
        };
        const roleModal = {
            obj: null,
            create: () => {
                roleModal.obj = new bootstrap.Modal(
                    document.getElementById('RoleModal'),
                    {
                        backdrop: 'static',
                        keyboard: false,
                        focus: false // <--- ADD THIS here as well
                    }
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
            roleModal.create(); // <--- ADD THIS LINE (It was missing in your code)
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
