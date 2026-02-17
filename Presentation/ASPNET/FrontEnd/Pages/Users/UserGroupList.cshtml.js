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

            errors: { name: '' },

            isSubmitting: false,
            isRoleSubmitting: false,

            // Role Management
            roleList: [],
            assignedRoles: [] // now stores role NAMES (string[])
        });

        const mainGridRef = Vue.ref(null);
        const nameRef = Vue.ref(null);

        // =========================
        // SERVICES
        // =========================
        const services = {

            // -------- UserGroup CRUD --------
            getMainData: async () =>
                await AxiosManager.get('/UserGroup/GetUserGroupList'),

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

            // -------- Role Management --------
            getAllRoles: async () =>
                await AxiosManager.get('/Security/GetRoleList'),

            getUserGroupRoles: async (userGroupId) =>
                await AxiosManager.post('/Security/GetUserGroupRoles', {
                    userGroupId
                }),

            updateUserGroupRole: async (userGroupId, roleName, accessGranted) =>
                await AxiosManager.post('/Security/UpdateUserGroupRole', {
                    userGroupId,
                    roleName,
                    accessGranted
                })
        };

        // =========================
        // METHODS
        // =========================
        const methods = {

            populateMainData: async () => {
                const res = await services.getMainData();
                state.mainData = res?.data?.content?.data ?? [];
            },

            loadRolesForGroup: async (groupId) => {

                if (state.roleList.length === 0) {
                    const res = await services.getAllRoles();
                    state.roleList = res?.data?.content?.data ?? [];
                }

                const assignedRes = await services.getUserGroupRoles(groupId);

                // backend now returns List<string> (role names)
                state.assignedRoles =
                    assignedRes?.data?.content?.data ?? [];
            }
        };

        // =========================
        // HANDLERS
        // =========================
        const handler = {

            handleSubmit: async () => {
                try {
                    state.isSubmitting = true;

                    if (!state.name) {
                        state.errors.name = 'Name is required.';
                        return;
                    }

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
                            title: state.deleteMode ? 'Delete Successful' : 'Save Successful',
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => {
                            mainModal.obj.hide();
                            resetFormState();
                        }, 1500);
                    }
                }
                catch (e) {
                    Swal.fire('Error',
                        e.response?.data?.message ?? 'Unexpected error',
                        'error');
                }
                finally {
                    state.isSubmitting = false;
                }
            },

            // 🔥 ROLE UPDATE PER CHECKBOX CHANGE
            updateRole: async (roleName, isChecked) => {

                try {
                    await services.updateUserGroupRole(
                        state.id,
                        roleName,
                        isChecked
                    );
                }
                catch {
                    Swal.fire('Error', 'Failed to update role', 'error');
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
            state.errors = { name: '' };
        };

        // =========================
        // MAIN GRID
        // =========================
        const mainGrid = {
            obj: null,
            create: async (dataSource) => {

                mainGrid.obj = new ej.grids.Grid({
                    height: '260px',
                    dataSource,
                    allowPaging: true,
                    allowSorting: true,
                    pageSettings: { pageSize: 50 },

                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'name', headerText: 'Name', width: 180 },
                        { field: 'description', headerText: 'Description', width: 300 },
                        { field: 'isActive', headerText: 'Active', type: 'boolean', displayAsCheckBox: true }
                    ],

                    toolbar: [
                        'Search',
                        { text: 'Add', id: 'AddCustom' },
                        { text: 'Edit', id: 'EditCustom' },
                        { text: 'Delete', id: 'DeleteCustom' },
                        { text: 'Roles', id: 'RolesCustom' }
                    ],

                    toolbarClick: async (args) => {

                        const row = mainGrid.obj.getSelectedRecords()[0];

                        if (!row) return;

                        if (args.item.id === 'RolesCustom') {

                            state.id = row.id;

                            await methods.loadRolesForGroup(row.id);

                            roleModal.obj.show();

                            setTimeout(() => {
                                if (!roleGrid.obj)
                                    roleGrid.create();
                                else
                                    roleGrid.refresh();
                            }, 200);
                        }
                    }
                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },

            refresh: () => {
                mainGrid.obj.setProperties({
                    dataSource: state.mainData
                });
            }
        };

        // =========================
        // ROLE GRID
        // =========================
        const roleGrid = {

            obj: null,

            create: () => {

                roleGrid.obj = new ej.grids.Grid({
                    dataSource: state.roleList,
                    height: '300px',

                    columns: [
                        { type: 'checkbox', width: 50 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'name', headerText: 'Role Name', width: 200 },
                        { field: 'description', headerText: 'Description', width: 300 }
                    ],

                    rowSelected: (args) => {
                        handler.updateRole(args.data.name, true);
                    },

                    rowDeselected: (args) => {
                        handler.updateRole(args.data.name, false);
                    },

                    dataBound: () => {

                        const selectedIndexes = [];

                        roleGrid.obj.getCurrentViewRecords()
                            .forEach((row, index) => {

                                if (state.assignedRoles
                                    .includes(row.name)) {
                                    selectedIndexes.push(index);
                                }
                            });

                        roleGrid.obj.selectRows(selectedIndexes);
                    }
                });

                roleGrid.obj.appendTo('#RoleGrid');
            },

            refresh: () => {
                roleGrid.obj.clearSelection();
                roleGrid.obj.dataSource = state.roleList;
            }
        };

        // =========================
        // MODALS
        // =========================
        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(
                    document.getElementById('MainModal'),
                    { backdrop: 'static' }
                );
            }
        };

        const roleModal = {
            obj: null,
            create: () => {
                roleModal.obj = new bootstrap.Modal(
                    document.getElementById('RoleModal'),
                    { backdrop: 'static' }
                );
            }
        };

        // =========================
        // MOUNT
        // =========================
        Vue.onMounted(async () => {

            await SecurityManager.authorizePage(['UserGroups']);
            await SecurityManager.validateToken();

            await methods.populateMainData();
            await mainGrid.create(state.mainData);

            mainModal.create();
            roleModal.create();
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
