const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            secondaryData: [],
            LocationData: [],
            deleteMode: false,
            mainTitle: null,
            changePasswordTitle: null,
            changeRoleTitle: null,
            locationTitle: null,
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            emailConfirmed: false,
            isBlocked: false,
            isDeleted: false,
            password: '',
            confirmPassword: '',
            newPassword: '',
            userId: '',
            wareHouse: '',   // Bound to the dropdown
            warehouses: [], 
            userlocations: [],
            isDefaultLocation: false,
            userGroupId: '', // To store the selected group ID
            userGroups: [],  // To store the list of available groups
            //AssignLocations:null,
            errors: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                newPassword: '',
                wareHouse: '',
                isDefaultLocation: '',
                userGroupId: ''

            },
            isSubmitting: false,
            isChangePasswordSubmitting: false,
            userAccessLocations: [],
            selectedLocation: null,
            editMode: false,
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const changePasswordModalRef = Vue.ref(null);
        const changeRoleModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const firstNameRef = Vue.ref(null);
        const lastNameRef = Vue.ref(null);
        const emailRef = Vue.ref(null);
        const LocationRef = Vue.ref(null);
        const userLocationGridRef = Vue.ref(null);
        const userGroupRef = Vue.ref(null);
        const firstNameText = {
            obj: null,
            create: () => {
                firstNameText.obj = new ej.inputs.TextBox({
                    placeholder: 'Enter First Name',
                });
                firstNameText.obj.appendTo(firstNameRef.value);
            },
            refresh: () => {
                if (firstNameText.obj) {
                    firstNameText.obj.value = state.firstName;
                }
            }
        };

        const lastNameText = {
            obj: null,
            create: () => {
                lastNameText.obj = new ej.inputs.TextBox({
                    placeholder: 'Enter Last Name',
                });
                lastNameText.obj.appendTo(lastNameRef.value);
            },
            refresh: () => {
                if (lastNameText.obj) {
                    lastNameText.obj.value = state.lastName;
                }
            }
        };

        const emailText = {
            obj: null,
            create: () => {
                emailText.obj = new ej.inputs.TextBox({
                    placeholder: 'Enter Email',
                });
                emailText.obj.appendTo(emailRef.value);
            },
            refresh: () => {
                if (emailText.obj) {
                    emailText.obj.value = state.email;
                }
            }
        };

        Vue.watch(
            () => state.firstName,
            (newVal, oldVal) => {
                state.errors.firstName = '';
                firstNameText.refresh();
            }
        );

        Vue.watch(
            () => state.lastName,
            (newVal, oldVal) => {
                state.errors.lastName = '';
                lastNameText.refresh();
            }
        );

        Vue.watch(
            () => state.email,
            (newVal, oldVal) => {
                state.errors.email = '';
                emailText.refresh();
            }
        );
        const userGroupLookup = {
            obj: null,
            create: () => {
                if (state.userGroupData && Array.isArray(state.userGroupData)) {
                    userGroupLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.userGroupData,
                        fields: { value: 'id', text: 'name' }, // Using 'id' and 'name' from UserGroup data
                        placeholder: 'Select User Group',
                        filterBarPlaceholder: 'Search Group',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'contains', e.text, true);
                            }
                            e.updateData(state.userGroupData, query);
                        },
                        change: (e) => {
                            state.userGroupId = e.value;
                        }
                    });
                    userGroupLookup.obj.appendTo(userGroupRef.value);
                }
            },
            refresh: () => {
                if (userGroupLookup.obj) {
                    userGroupLookup.obj.value = state.userGroupId;
                    // Optionally disable if needed (e.g., if (state.id !== ''))
                }
            }
        };

        // Watch for state changes to refresh the UI component
        Vue.watch(
            () => state.userGroupId,
            (newVal) => {
                userGroupLookup.refresh();
                state.errors.userGroupId = '';
            }
        );
        const validateForm = function () {
            state.errors.firstName = '';
            state.errors.lastName = '';
            state.errors.email = '';
            state.errors.password = '';
            state.errors.confirmPassword = '';
            state.errors.wareHouse = '';  //  new error key
            state.errors.userGroupId = '';
            let isValid = true;

            if (!state.firstName) {
                state.errors.firstName = 'First Name is required.';
                isValid = false;
            }
            if (!state.lastName) {
                state.errors.lastName = 'Last Name is required.';
                isValid = false;
            }
            if (!state.email) {
                state.errors.email = 'Email is required.';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(state.email)) {
                state.errors.email = 'Please enter a valid email address.';
                isValid = false;
            }

            //  Validate warehouse selection
            if (!state.wareHouse) {
                state.errors.wareHouse = 'Default Location is required.';
                isValid = false;
            }

            if (!state.id) {
                if (!state.password) {
                    state.errors.password = 'Password is required.';
                    isValid = false;
                }
                if (!state.confirmPassword) {
                    state.errors.confirmPassword = 'Confirm Password is required.';
                    isValid = false;
                }
                if (state.password && state.confirmPassword && state.password !== state.confirmPassword) {
                    state.errors.confirmPassword = 'Password and Confirm Password must match.';
                    isValid = false;
                }
            }

            return isValid;
        };

        const validateChangePasswordForm = function () {
            state.errors.newPassword = '';

            let isValid = true;

            if (!state.newPassword) {
                state.errors.newPassword = 'New Password is required.';
                isValid = false;
            } else if (state.newPassword.length < 6) {
                state.errors.newPassword = 'New Password must be at least 6 characters.';
                isValid = false;
            }

            return isValid;
        };

        const validateLocationForm = function() {
            if (!state.wareHouse && !state.deleteMode) {
                state.errors.wareHouse = "Please select a location";
                return false;
            }

            return true;
        }


        const resetFormState = () => {
            state.id = '';
            state.firstName = '';
            state.lastName = '';
            state.email = '';
            state.emailConfirmed = false;
            state.isBlocked = false;
            state.isDeleted = false;
            state.password = '';
            state.confirmPassword = '';
            state.wareHouse = '';
            state.userGroupId = '';
            isDefaultLocation: false,   // 🔥 add this

                state.errors = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    wareHouse: '',
                    userGroupId:'',
                    isDefaultLocation: ''
                };
            if (LocationGrid && LocationGrid.obj) {
                LocationGrid.obj.clearSelection();
                LocationGrid.obj.setProperties({ dataSource: [] }); // 🔥 empties grid
            }

        };

        const resetChangePasswordFormState = () => {
            state.newPassword = '';
            state.errors = {
                newPassword: '',
            };
        };

        const resetSecondaryFormState = () => {
            //state.userId = '';
            state.secondaryData = [];
            state.changeRoleTitle = 'Change Roles';

            if (secondaryGrid.obj) {
                secondaryGrid.obj.clearSelection();
                secondaryGrid.refresh();
            }
        };
        const resetLocationFormState = () => {
            state.userlocations = [];
            state.editMode = false;
            state.deleteMode = false;
            state.selectedLocation = null;
            state.wareHouse = '';
            state.locationTitle = 'Location Access';

            if (LocationGrid.obj) {
                LocationGrid.obj.clearSelection();
                LocationGrid.refresh();
            }

            //const mainModal = document.getElementById("MainModal");
            //if (mainModal.classList.contains("show")) {
            //    document.body.classList.add("modal-open");
            //}
        };
        const handleLocationModalHidden = () => {
            const mainModalEl = document.getElementById('MainModal'); // 🔁 your main modal id
            if (mainModalEl.classList.contains("show")) {
                document.body.classList.add("modal-open");
            }
        };

        const getLocations = async () => {
            try {
                const response = await AxiosManager.get('/Warehouse/GetWarehouseList');

                if (response.data.code === 200) {
                    state.warehouses = response.data.content.data || [];
                } else {
                    console.error('Failed to load warehouses:', response.data.message);
                    state.warehouses = [];
                }
            } catch (error) {
                console.error('Error fetching warehouses:', error);
                state.warehouses = [];
            }
        };
        //getUserAccessLocations
        //const getUserAccessLocations = async () => {
        //    try {
        //        const response = await AxiosManager.get('/Security/GetUserAccessLocations');

        //        if (response.data.code === 200) {
        //            state.userlocations = response.data.content.data || [];
        //        } else {
        //            console.error('Failed to load warehouses:', response.data.message);
        //            state.userlocations = [];
        //        }
        //    } catch (error) {
        //        console.error('Error fetching warehouses:', error);
        //        state.userlocations = [];
        //    }
        //};
        const services = {
            getUserGroupList: async () => {
                return await AxiosManager.get('/UserGroup/GetUserGroupList');
            },
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/Security/GetUserList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            // Inside the services object
            createMainData: async (firstName, lastName, email, emailConfirmed, isBlocked, isDeleted, password, confirmPassword, createdById, wareHouse, userGroupId) => {
                try {
                    const response = await AxiosManager.post('/Security/CreateUser', {
                        firstName,
                        lastName,
                        email,
                        emailConfirmed,
                        isBlocked,
                        isDeleted,
                        password,
                        confirmPassword,
                        createdById,
                        wareHouse,
                        userGroupId // <--- Add this line
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            }, 

            updateMainData: async (userId, firstName, lastName, emailConfirmed, isBlocked, isDeleted, updatedById, wareHouse, userGroupId) => {
                try {
                    const response = await AxiosManager.post('/Security/UpdateUser', {
                        userId,
                        firstName,
                        lastName,
                        emailConfirmed,
                        isBlocked,
                        isDeleted,
                        updatedById,
                        wareHouse,
                        userGroupId // <--- Add this
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (userId, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Security/DeleteUser', {
                        userId, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updatePasswordData: async (userId, newPassword) => {
                try {
                    const response = await AxiosManager.post('/Security/UpdatePasswordUser', {
                        userId, newPassword
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getRolesData: async () => {
                try {
                    const response = await AxiosManager.get('/Security/GetRoleList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getUserRolesData: async (userId) => {
                try {
                    if (!userId || userId.trim() === "") {
                        return null;
                    }
                    const response = await AxiosManager.post('/Security/GetUserRoles', { userId });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateUserRoleData: async (userId, roleName, accessGranted) => {
                try {
                    const response = await AxiosManager.post('/Security/UpdateUserRole', { userId, roleName, accessGranted });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getUserWarehouseList: async (userId) => {
                try {
                    const response = await AxiosManager.get('/Security/GetUserWarehouse?UserId=' + userId+'');
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            createUserWarehouse: async (userId, warehouseId, isDefaultLocation, createdById) => {
                try {
                    const response = await AxiosManager.post('/Security/CreateUserWarehouse', {
                        userId,
                        warehouseId,
                        isDefaultLocation,
                        createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateUserWarehouse: async (id, warehouseId, isDefaultLocation, updatedById) => {
                try {
                    const response = await AxiosManager.post('/Security/UpdateUserWarehouse', {
                        id,
                        warehouseId,
                        isDefaultLocation,
                        updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteUserWarehouse: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Security/DeleteUserWarehouse', {
                        id,
                        deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },


        };

        const methods = {
            populateMainData: async () => {
                try {
                    debugger;
                    const response = await services.getMainData();
                    const groupResponse = await services.getUserGroupList();
                    state.userGroupData = groupResponse?.data?.content?.data ?? []; // Assign to the state
                    state.mainData = response?.data?.content?.data.map(user => {
                        const warehouse = state.warehouses.find(w => w.id === user.wareHouse);
                        const group = state.userGroupData.find(g => g.id === user.userGroupId);
                        return {
                            ...user,
                            createdAt: new Date(user.createdAt),
                            wareHouse: warehouse ? warehouse.name : '',
                            // Injects the group name into the grid row
                            userGroupName: group ? group.name : 'No Group'
                        };
                    });
                } catch (error) {
                    console.error("Error populating main data:", error);
                    state.mainData = [];
                }
            },
            populateSecondaryData: async (userId) => {
                try {
                    const rolesResponse = await services.getRolesData();
                    const roles = rolesResponse?.data?.content?.data ?? [];
                    const userRolesResponse = await services.getUserRolesData(userId);
                    const userRoles = userRolesResponse?.data?.content?.data ?? [];
                    const result = roles.length === 0
                        ? []
                        : roles.map(role => ({
                            roleName: role.name,
                            accessGranted: userRoles.includes(role.name)
                        }));

                    state.secondaryData = result;
                } catch (error) {
                    console.error("Error populating secondary data:", error);
                    state.secondaryData = [];
                }
            },
            populateLocationData: async (userId) => {
                try {
                    debugger;
                    //const locations = await services.getLocations();
                    const locations = await getLocations();

                    const allLocations = locations?.data?.content?.data ?? [];
                    //const userAccessLocations = await services.getUserAccessLocations(userId);
                    const userAccessLocations = await getLocations(userId);
                    const userlocations = userAccessLocations?.data?.content?.data ?? [];
                    const result = allLocations.length === 0
                        ? []
                        : allLocations.map(loc => ({
                            locationName: loc.name,
                            isDefault: userlocations.includes(loc.isDefault)
                        }));

                    state.LocationData = result;
                } catch (error) {
                    console.error("Error populating secondary data:", error);
                    state.LocationData = [];
                }
            },
            populateUserLocationData: async (userId) => {
                try {
                    const response = await services.getUserWarehouseList(userId);

                    if (response.data.code === 200) {
                        state.userlocations = response.data.content.data || [];
                    } else {
                        state.userlocations = [];
                    }

                } catch (error) {
                    console.error("Error loading user locations", error);
                    state.userlocations = [];
                }
            }

        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    debugger;
                    if (!validateForm()) {
                        return;
                    }
                    debugger;
                    const response = state.id === ''
                        ? await services.createMainData(
                            state.firstName,
                            state.lastName,
                            state.email,
                            state.emailConfirmed,
                            state.isBlocked,
                            state.isDeleted,
                            state.password,
                            state.confirmPassword,
                            StorageManager.getUserId(),
                            state.wareHouse,
                            state.userGroupId // <--- Pass the state value here
                        )

                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(
                                state.id,
                                state.firstName,
                                state.lastName,
                                state.emailConfirmed,
                                state.isBlocked,
                                state.isDeleted,
                                StorageManager.getUserId(),
                                state.wareHouse,
                                state.userGroupId // <--- Add this
                            );

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = state.id === '' ? 'Add User' : 'Edit User';
                            state.id = response?.data?.content?.data.userId ?? '';
                            state.firstName = response?.data?.content?.data.firstName ?? '';
                            state.lastName = response?.data?.content?.data.lastName ?? '';
                            state.email = response?.data?.content?.data.email ?? '';
                            state.emailConfirmed = response?.data?.content?.data.emailConfirmed ?? false;
                            state.isBlocked = response?.data?.content?.data.isBlocked ?? false;
                            state.isDeleted = response?.data?.content?.data.isDeleted ?? false;
                            state.wareHouse = response?.data?.content?.data.wareHouse ?? ''; //  Add this


                            Swal.fire({
                                icon: 'success',
                                title: state.deleteMode ? 'Delete Successful' : 'Save Successful',
                                text: 'Form will be closed...',
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

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'Delete Failed' : 'Save Failed',
                            text: response.data.message ?? 'Please check your data.',
                            confirmButtonText: 'Try Again'
                        });
                    }

                } catch (error) {
                    debugger
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
            handleChangePassword: async function () {
                try {
                    state.isChangePasswordSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateChangePasswordForm()) {
                        return;
                    }

                    const response = await services.updatePasswordData(state.userId, state.newPassword);

                    if (response.data.code === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Save Successful',
                            text: 'Password has been updated.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        setTimeout(() => {
                            changePasswordModal.obj.hide();
                            resetChangePasswordFormState();
                        }, 2000);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Save Failed',
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
                    state.isChangePasswordSubmitting = false;
                }
            },
            LocationSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateLocationForm()) {
                        return;
                    }

                    let response;
                    let isLocalCreate = false;
                    // ================= CREATE =================
                    if (!state.editMode && !state.deleteMode) {
                        if (state.id) {
                            response = await services.createUserWarehouse(
                                state.id,                    // comes from main modal
                                state.wareHouse,
                                state.isDefaultLocation,
                                StorageManager.getUserId()
                            );
                        }
                        else {
                            // NEW User (No ID yet): Store locally in state
                            // Assuming state.wareHouseList is where you keep the grid data
                            const newLocation = {
                                wareHouse: state.wareHouse,
                                isDefaultLocation: state.isDefaultLocation
                            };
                            isLocalCreate = true; // Flag to skip the API response check
                            setTimeout(() => {
                                LocationModal.obj.hide();
                            }, 1500);
                            return;
                        }
                    }
                    // ================= DELETE =================
                    else if (state.deleteMode) {
                        response = await services.deleteUserWarehouse(
                            state.selectedLocation.id,
                            StorageManager.getUserId()
                        );
                    }
                    // ================= UPDATE =================
                    else {
                        response = await services.updateUserWarehouse(
                            state.selectedLocation.id,
                            state.wareHouse,
                            state.isDefaultLocation,
                            StorageManager.getUserId()
                        );
                    }
                    // Handle Success (Either API success OR Local Storage success)
                    const isSuccess = isLocalCreate || (response && (response.data.code === 200 || response.data.success === true));

                    if (isSuccess) {
                        // Only refresh from server if we actually have a User ID
                        if (state.id) {
                            await methods.populateUserLocationData(state.id);
                        }
                        LocationGrid.refresh();

                        Swal.fire({
                            icon: 'success',
                            title: state.deleteMode ? 'Delete Successful' : 'Save Successful',
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => {
                            LocationModal.obj.hide();
                        }, 1500);

                    } 
                    //if (response.data.code === 200 || response.data.success === true) {

                    //    await methods.populateUserLocationData(state.id);
                    //    LocationGrid.refresh();

                    //    Swal.fire({
                    //        icon: 'success',
                    //        title: state.deleteMode ? 'Delete Successful' : 'Save Successful',
                    //        timer: 1500,
                    //        showConfirmButton: false
                    //    });

                    //    setTimeout(() => {
                    //        LocationModal.obj.hide();
                    //    }, 1500);

                    //}
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
            }

        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Users']);
                await SecurityManager.validateToken();

                await getLocations();
                await methods.populateMainData();
                await mainGrid.create(state.mainData);
                await secondaryGrid.create(state.secondaryData);
                firstNameText.create();
                lastNameText.create();
                emailText.create();
                // Initialize the lookup component
                userGroupLookup.create();
                mainModal.create();
                changePasswordModal.create();
                changeRoleModal.create();
                LocationModal.create();
                //try { 
                //    await LocationGrid.create(state.LocationData);
                //} catch (ex) {
                //    console.log(ex);
                //}

                mainModalRef.value?.addEventListener('hidden.bs.modal', () => {
                    resetFormState();
                });
                changePasswordModalRef.value?.addEventListener('hidden.bs.modal', () => {
                    resetChangePasswordFormState();
                });
                changeRoleModalRef.value?.addEventListener('hidden.bs.modal', () => {
                    resetSecondaryFormState();
                });
                LocationRef.value?.addEventListener('hidden.bs.modal', () => {
                    handleLocationModalHidden();
                });
            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
            changePasswordModalRef.value?.removeEventListener('hidden.bs.modal', resetChangePasswordFormState);
            changeRoleModalRef.value?.removeEventListener('hidden.bs.modal', resetSecondaryFormState);
            LocationRef.value?.removeEventListener('hidden.bs.modal', resetLocationFormState);
            
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
                    sortSettings: { columns: [{ field: 'createdAt', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: true,
                    showColumnMenu: true,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false },
                        { field: 'firstName', headerText: 'First Name', width: 150, minWidth: 150 },
                        { field: 'lastName', headerText: 'Last Name', width: 150, minWidth: 150 },
                        { field: 'userGroupName', headerText: 'Group', width: 150 },
                        { field: 'email', headerText: 'Email', width: 150, minWidth: 150 },
                        { field: 'emailConfirmed', headerText: 'Email Confirmed', textAlign: 'Center', width: 150, minWidth: 150, type: 'boolean', displayAsCheckBox: true },
                        //  New column for Warehouse
                        { field: 'wareHouse', headerText: 'Location', width: 150, minWidth: 150 },
                        { field: 'isBlocked', headerText: 'Is Blocked', textAlign: 'Center', width: 150, minWidth: 150, type: 'boolean', displayAsCheckBox: true },
                        { field: 'isDeleted', headerText: 'Is Deleted', textAlign: 'Center', width: 150, minWidth: 150, type: 'boolean', displayAsCheckBox: true },
                        { field: 'createdAt', headerText: 'Created At', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                        { text: 'Change Password', tooltipText: 'Change Password', id: 'ChangePasswordCustom' },
                        { text: 'Change Role', tooltipText: 'Change Role', id: 'ChangeRoleCustom' },
                        { tooltipText: 'Locations', text: 'Locations', id: 'ChangeLocations', visible: false },
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangePasswordCustom', 'ChangeRoleCustom','ChangeLocations'], false);
                        mainGrid.obj.autoFitColumns(['firstName', 'lastName', 'email', 'emailConfirmed', 'isBlocked', 'isDeleted', 'createdAt']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangePasswordCustom', 'ChangeRoleCustom','ChangeLocations'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangePasswordCustom', 'ChangeRoleCustom','ChangeLocations'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangePasswordCustom', 'ChangeRoleCustom','ChangeLocations'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangePasswordCustom', 'ChangeRoleCustom','ChangeLocations'], false);
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
                            state.mainTitle = 'Add User';
                            resetFormState();
                            state.userlocations = [];
                            //await methods.populateUserLocationData(state.userId);
                            if (LocationGrid.obj) {
                                LocationGrid.refresh();
                            }
                            else {
                                LocationGrid.create(state.userlocations);
                            }
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit User';
                                state.id = selectedRecord.id ?? '';
                                state.firstName = selectedRecord.firstName ?? '';
                                state.lastName = selectedRecord.lastName ?? '';
                                state.email = selectedRecord.email ?? '';
                                state.emailConfirmed = selectedRecord.emailConfirmed ?? false;
                                state.isBlocked = selectedRecord.isBlocked ?? false;
                                state.isDeleted = selectedRecord.isDeleted ?? false;
                                const selectedWarehouse = state.warehouses.find(w => w.name === selectedRecord.wareHouse);
                                state.wareHouse = selectedWarehouse?.id ?? '';

                                await methods.populateUserLocationData(state.id);
                                if (LocationGrid.obj) {
                                    LocationGrid.refresh();
                                }
                                else
                                    LocationGrid.create(state.userlocations);
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete User?';
                                state.id = selectedRecord.id ?? '';
                                state.firstName = selectedRecord.firstName ?? '';
                                state.lastName = selectedRecord.lastName ?? '';
                                state.email = selectedRecord.email ?? '';
                                state.emailConfirmed = selectedRecord.emailConfirmed ?? false;
                                state.isBlocked = selectedRecord.isBlocked ?? false;
                                state.isDeleted = selectedRecord.isDeleted ?? false;
                                const selectedWarehouse = state.warehouses.find(w => w.name === selectedRecord.wareHouse);
                                state.wareHouse = selectedWarehouse?.id ?? '';
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'ChangePasswordCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.changePasswordTitle = 'Change Password';
                                state.userId = selectedRecord.id ?? '';
                                changePasswordModal.obj.show();
                            }
                        }

                        if (args.item.id === 'ChangeRoleCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.changeRoleTitle = 'Change Roles';
                                state.userId = selectedRecord.id ?? '';
                                await methods.populateSecondaryData(state.userId);
                                secondaryGrid.refresh();
                                changeRoleModal.obj.show();
                            }
                        }
                        if (args.item.id === 'ChangeLocations') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.locationTitle = 'Location Access';
                                state.userId = selectedRecord.id ?? '';
                                await methods.populateLocationData(state.userId);
                                //LocationGrid.refresh();
                                LocationModal.obj.show();
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
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource,
                    editSettings: { allowEditing: true, allowAdding: false, allowDeleting: false, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'roleName', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: true,
                    showColumnMenu: false,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
                        },
                        { field: 'roleName', headerText: 'Role', allowEditing: false, width: 200, minWidth: 200 },
                        { field: 'accessGranted', headerText: 'Access Granted', textAlign: 'Center', width: 150, minWidth: 150, editType: 'booleanedit', displayAsCheckBox: true, type: 'boolean', allowEditing: true },
                    ],
                    //toolbar: [
                    //    'ExcelExport',
                    //    { type: 'Separator' },
                    //    'Edit', 'Update', 'Cancel',
                    //],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditRoleCustom' },
                        { text: 'Update', tooltipText: 'Update', id: 'UpdateRoleCustom' },
                        { text: 'Cancel', tooltipText: 'Cancel', id: 'CancelRoleCustom' },
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        secondaryGrid.obj.autoFitColumns(['roleName', 'accessGranted']);
                        // Disable Edit button initially
                        secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom', 'UpdateRoleCustom','CancelRoleCustom'], false);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom', 'CancelRoleCustom'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom', 'CancelRoleCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom', 'CancelRoleCustom'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom', 'CancelRoleCustom'], false);
                        }
                    },                  
                    rowSelecting: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length) {
                            secondaryGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: async (args) => {
                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj.excelExport();
                        }
                        else if (args.item.id === 'EditRoleCustom') {
                            if (secondaryGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = secondaryGrid.obj.getSelectedRecords()[0];
                                secondaryGrid.obj.toolbarModule.enableItems(['UpdateRoleCustom', 'CancelRoleCustom'], true);
                                secondaryGrid.obj.toolbarModule.enableItems(['EditRoleCustom'], false);
                            }
                        }
                        //else if (args.item.id === 'UpdateRoleCustom') {
                        //        try {
                        //            const roleName = args?.data?.roleName;
                        //            const accessGranted = args?.data?.accessGranted;
                        //            const response = await services.updateUserRoleData(state.userId, roleName, accessGranted);

                        //            if (response.data.code === 200) {
                        //                await methods.populateSecondaryData(state.userId);
                        //                secondaryGrid.refresh();
                        //                secondaryGrid.obj.clearSelection();
                        //                Swal.fire({
                        //                    icon: 'success',
                        //                    title: 'Save Successful',
                        //                    timer: 1000,
                        //                    showConfirmButton: false
                        //                });
                        //            } else {
                        //                Swal.fire({
                        //                    icon: 'error',
                        //                    title: 'Save Failed',
                        //                    text: response.data.message ?? 'Please check your data.',
                        //                    confirmButtonText: 'Try Again'
                        //                });
                        //            }
                        //        }
                        //        catch (error) {
                        //            Swal.fire({
                        //                icon: 'error',
                        //                title: 'An Error Occurred',
                        //                text: error.response?.data?.message ?? 'Please try again.',
                        //                confirmButtonText: 'OK'
                        //            });
                        //        }     
                        //}
                        else if (args.item.id === 'CancelRoleCustom') {
                            resetSecondaryFormState();
                        }


                    },
                    actionComplete: async (args) => {
                        if (args.requestType === 'save' && args.action === 'edit') {
                            try {
                                const roleName = args?.data?.roleName;
                                const accessGranted = args?.data?.accessGranted;
                                const response = await services.updateUserRoleData(state.userId, roleName, accessGranted);

                                if (response.data.code === 200) {
                                    await methods.populateSecondaryData(state.userId);
                                    secondaryGrid.refresh();
                                    secondaryGrid.obj.clearSelection();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Save Successful',
                                        timer: 1000,
                                        showConfirmButton: false
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Save Failed',
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
                            }
                        }                       
                    }
                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);
            },
            refresh: () => {
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };

        const LocationGrid = {
            obj: null,

            create: async (dataSource) => {
                LocationGrid.obj = new ej.grids.Grid({
                    height: 400,
                    dataSource: dataSource || [],
                    editSettings: {
                        allowEditing: false,
                        allowAdding: false,
                        allowDeleting: false,
                        mode: 'Normal'
                    },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'createdAtUtc', direction: 'Descending' }] },
                    selectionSettings: {
                        persistSelection: true,
                        type: 'Single',
                        checkboxOnly: true   // 🔥 REQUIRED
                    },
                    autoFit: true,
                    showColumnMenu: false,
                    gridLines: 'Horizontal',
                    beforeDataBound: () => { },
                    dataBound: function () {
                        LocationGrid.obj.toolbarModule.enableItems(['EditLocation', 'DeleteLocation'], false);

                        const data = LocationGrid.obj?.currentViewData;

                        if (data && data.length > 0) {
                            LocationGrid.obj.autoFitColumns(['locationId', 'isDeleted', 'createdAtUtc']);
                        }
                    },
                    rowSelected: (args) => {
                        if (LocationGrid.obj.getSelectedRecords().length == 1) {
                            LocationGrid.obj.toolbarModule.enableItems(['EditLocation', 'DeleteLocation'], true);
                        } else
                            LocationGrid.obj.toolbarModule.enableItems(['EditLocation', 'DeleteLocation'], false);

                    },

                    rowDeselected: () => {
                        if (LocationGrid.obj.getSelectedRecords().length == 1) {
                            LocationGrid.obj.toolbarModule.enableItems(['EditLocation', 'DeleteLocation'], true);
                        }
                        else
                            LocationGrid.obj.toolbarModule.enableItems(['EditLocation', 'DeleteLocation'], false);

                    },

                    rowSelecting: () => {
                        if (LocationGrid.obj.getSelectedRecords().length) {
                            LocationGrid.obj.clearSelection();
                        }
                    },

                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, visible: false },
                        { field: 'locationId', visible: false },
                        { field: 'locationName', headerText: 'Location', width: 180 },
                        { field: 'isDefaultLocation', headerText: 'IsDefault', type: 'boolean', displayAsCheckBox: true },
                        { field: 'createdAtUtc', headerText: 'Created At', format: 'yyyy-MM-dd HH:mm' },
                        { field: 'isDeleted', headerText: 'Is Deleted', type: 'boolean', displayAsCheckBox: true },

                    ],

                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddLocation' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditLocation' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteLocation' },
                        { tooltipText: 'Locations', text: 'Locations', id: 'ChangeLocations', visible:false },
                    ],

                    


                    toolbarClick: async (args) => {

                        // ================= ADD =================
                        if (args.item.id === 'AddLocation') {
                            state.editMode = false;
                            state.selectedLocation = null;

                            // Reset form
                            state.wareHouse = '';
                            state.isDefaultLocation = false;

                            LocationModal.obj.show();
                            return;
                        }

                        // ================= EDIT =================
                        if (args.item.id === 'EditLocation') {

                            const selected = LocationGrid.obj.getSelectedRecords();

                            if (selected.length !== 1) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Select One Record',
                                    text: 'Please select one location to edit.'
                                });
                                return;
                            }

                            const row = selected[0];

                            state.editMode = true;
                            state.selectedLocation = row;

                            // 🔥 IMPORTANT: Bind values to form model
                            /*state.wareHouse = row.locationId;*/              // dropdown select
                            const selectedWarehouse = state.warehouses.find(w => w.id === row.locationId);
                            state.wareHouse = selectedWarehouse?.id ?? '';
                            state.isDefaultLocation = row.isDefaultLocation; // checkbox

                            LocationModal.obj.show();
                            return;
                        }

                        // ================= DELETE =================
                        if (args.item.id === 'DeleteLocation') {

                            const selected = LocationGrid.obj.getSelectedRecords();

                            if (!selected.length) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'No Selection',
                                    text: 'Please select location(s) to delete.'
                                });
                                return;
                            }

                            const confirm = await Swal.fire({
                                icon: 'warning',
                                title: 'Are you sure?',
                                text: 'Selected locations will be removed from this user.',
                                showCancelButton: true,
                                confirmButtonText: 'Yes, Delete',
                                cancelButtonText: 'Cancel'
                            });

                            if (!confirm.isConfirmed) return;

                            try {
                                for (const row of selected) {
                                    await services.deleteUserWarehouse(row.id, state.id);
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Deleted',
                                    timer: 1200,
                                    showConfirmButton: false
                                });

                                await methods.populateLocationData(state.id);
                                LocationGrid.refresh();

                            } catch (error) {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Delete Failed',
                                    text: error.response?.data?.message ?? 'Please try again.'
                                });
                            }

                            return;
                        }

                        // ================= CHANGE LOCATIONS =================
                        if (args.item.id === 'ChangeLocations') {

                            const selectedUsers = mainGrid.obj.getSelectedRecords();

                            if (!selectedUsers.length) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'No User Selected',
                                    text: 'Please select a user first.'
                                });
                                return;
                            }

                            const selectedUser = selectedUsers[0];
                            state.locationTitle = 'Location Access';
                            state.userId = selectedUser.id ?? '';

                            try {
                                await methods.populateLocationData(state.userId);
                                LocationGrid.refresh();
                                LocationModal.obj.show();

                            } catch (error) {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Failed to Load Locations',
                                    text: 'Please try again.'
                                });
                            }

                            return;
                        }
                    }
                });

                LocationGrid.obj.appendTo(userLocationGridRef.value);
            },

            refresh: () => {
                if (LocationGrid.obj) {
                    LocationGrid.obj.setProperties({ dataSource: state.userlocations || [] });
                }
            },
            destroy: () => {
                if (LocationGrid.obj) {
                    LocationGrid.obj.destroy();   // removes DOM, events, instances
                    LocationGrid.obj = null;
                }
            },
            clear: () => {
                if (LocationGrid.obj) {
                    LocationGrid.obj.setProperties({ dataSource: [] });
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

        const changePasswordModal = {
            obj: null,
            create: () => {
                changePasswordModal.obj = new bootstrap.Modal(changePasswordModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        const changeRoleModal = {
            obj: null,
            create: () => {
                changeRoleModal.obj = new bootstrap.Modal(changeRoleModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };
        const LocationModal = {
            obj: null,
            create: () => {
                LocationModal.obj = new bootstrap.Modal(LocationRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };
        return {
            mainGridRef,
            mainModalRef,
            changePasswordModalRef,
            changeRoleModalRef,
            secondaryGridRef,
            firstNameRef,
            lastNameRef,
            emailRef,
            state,
            handler,
            LocationRef,
            LocationGrid,
            userGroupRef,   // 🔥 REQUIRED
            userLocationGridRef

        };
    }
};

Vue.createApp(App).mount('#app');