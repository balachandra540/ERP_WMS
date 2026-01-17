debugger;
const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            mainTitle: null,
            id: '',
            name: '',
            description: '',
            isSystemWarehouse: false,
            currency: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phoneNumber: '',
            faxNumber: '',
            emailAddress: '',
            type: '',
            gstNumber: '',
            changeAvatarTitle: 'Change Logo',
            previewImage: '', //  Add this

            //logo: null, // Stores the File object temporarily
            //logoPreview: null, // Stores the Data URL for preview
            //logoPath: '', // Stores the server-side file path
            errors: {
                name: '',
                description: '',
                isSystemWarehouse: '',
                currency: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phoneNumber: '',
                faxNumber: '',
                emailAddress: '',
                type: '',
                gstNumber: '',
                //logo: ''
            },
            isSubmitting: false
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const changeLogoModalRef = Vue.ref(null);
        const imageUploadRef = Vue.ref(null);
        const validateForm = function () {
            // Initialize errors
            Object.keys(state.errors).forEach((key) => {
                state.errors[key] = '';
            });

            let isValid = true;

            // Validate mandatory fields
            const mandatoryFields = [
                { key: 'name', message: 'Name is required.' },
                { key: 'description', message: 'Description is required.' },
                { key: 'currency', message: 'Currency is required.' },
                { key: 'street', message: 'Street is required.' },
                { key: 'city', message: 'City is required.' },
                { key: 'state', message: 'State is required.' },
                { key: 'zipCode', message: 'Zip Code is required.' },
                { key: 'country', message: 'Country is required.' },
                { key: 'phoneNumber', message: 'Phone Number is required.' },
                { key: 'faxNumber', message: 'Fax Number is required.' },
                { key: 'emailAddress', message: 'Email Address is required.' },
                { key: 'type', message: 'Type is required.' },
                { key: 'gstNumber', message: 'GST Number is required.' },
            ];

            mandatoryFields.forEach((field) => {
                if (!state[field.key]) {
                    state.errors[field.key] = field.message;
                    isValid = false;
                }
            });

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.name = '';
            state.description = '';
            state.isSystemWarehouse = false;
            state.currency = 'INR';
            state.street = '';
            state.city = '';
            state.state = '';
            state.zipCode = '';
            state.country = '';
            state.phoneNumber = '';
            state.faxNumber = '';
            state.emailAddress = '';
            state.type = '';
            state.gstNumber = '';
            //state.logo = null;
            //state.logoPreview = null;
            state.createdById = '';
            state.updatedById = '';
            Object.keys(state.errors).forEach(key => {
                state.errors[key] = '';
            });

          
        };
        const getLogoData = async(Logo) => {

            try {
                const response = await AxiosManager.get('/FileImage/GetImage?imageName=' + Logo, {
                    responseType: 'blob'
                });

                //if (response.status === 200) {
                //    const reader = new FileReader();
                //    reader.onloadend = function () {
                //        const base64Image = reader.result;
                //        state.previewImage = base64Image;

                //    //    document.getElementById('ImageUpload').src = base64Image;
                //    };
                //    reader.readAsDataURL(response.data);
                //}
                if (response.status === 200 && response.data) {
                    const reader = new FileReader();

                    // Set onloadend FIRST
                    reader.onloadend = () => {
                        const base64Image = reader.result;
                        console.log('Base64 Image:', base64Image);

                        state.previewImage = base64Image;
                        console.log('state.previewImage set to:', state.previewImage);
                    };

                    //  Then read the data
                    reader.readAsDataURL(response.data);
                } else {
                    console.error('Error:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }

        };
        
        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (data) => {
                try {
                    const response = await AxiosManager.post('/Warehouse/CreateWarehouse', data);
                    return response;
                } catch (error) {
                    console.error('Error in createMainData:', error);
                    throw error;
                }
            },
            updateMainData: async (data) => {
                try {
                    const response = await AxiosManager.post('/Warehouse/UpdateWarehouse', data);
                    return response;
                } catch (error) {
                    console.error('Error in updateMainData:', error);
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Warehouse/DeleteWarehouse', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            uploadLogo: async (file) => {
                debugger;
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const response = await AxiosManager.post('/FileImage/UploadImage ', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateLogoData: async (WarehouseId, Logo) => {
                debugger;
                try {
                    const response = await AxiosManager.post('/Warehouse/UpdateLogo', {
                        WarehouseId, Logo
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            
        };

        const methods = { 
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response.data.content.data.map((item, index) => {
                    if (!item || typeof item !== 'object') {
                        console.warn(`Invalid item at index ${index}:`, item);
                        return null;
                    }
                    const createdAt = item.createdAtUtc ? new Date(item.createdAtUtc) : null;
                    //const logoValue = typeof item.logo === 'string' ? item.logo : null;
                    //if (item.logo && typeof item.logo !== 'string') {
                    //    console.warn(`Invalid logo type at index ${index}:`, item.logo);
                    //}
                    return {
                        id: item.id || 0, // Ensure id exists
                        name: item.name || '',
                        systemWarehouse: item.systemWarehouse || false,
                        description: item.description || '',
                        currency: item.currency || '',
                        street: item.street || '',
                        city: item.city || '',
                        state: item.state || '',
                        zipCode: item.zipCode || '',
                        country: item.country || '',
                        phoneNumber: item.phoneNumber || '',
                        faxNumber: item.faxNumber || '',
                        emailAddress: item.emailAddress || '',
                        type: item.type || '',
                        gstNumber: item.gstNumber || '',
                        logo: item.logo || '',
                        createdAtUtc: createdAt && !isNaN(createdAt) ? createdAt : null
                    };
                }).filter(item => item !== null);
            },

          
        }

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

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }
                    const data = {
                        id: state.id, // For update
                        name: state.name,
                        description: state.description,
                        currency: state.currency,
                        street: state.street,
                        city: state.city,
                        state: state.state,
                        zipCode: state.zipCode,
                        country: state.country,
                        phoneNumber: state.phoneNumber,
                        faxNumber: state.faxNumber,
                        emailAddress: state.emailAddress,
                        type: state.type,
                        gstNumber: state.gstNumber,
                        //logo: state.logo
                    };
                    state.id === '' ? data.createdById = StorageManager.getUserId() : data.createdById = '';
                    state.id != '' ? data.updatedById = StorageManager.getUserId() : data.updatedById = '';

                    const response = state.id === ''
                        ? await services.createMainData(data)
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(data);

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Warehouse';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.name = response?.data?.content?.data.name ?? '';
                            state.description = response?.data?.content?.data.description ?? '';
                            state.isSystemWarehouse = response?.data?.content?.data.systemWarehouse ?? false;
                            state.currency = response?.data?.content?.data.currency ?? '';
                            state.street = response?.data?.content?.data.street ?? '';
                            state.city = response?.data?.content?.data.city ?? '';
                            state.state = response?.data?.content?.data.state ?? '';
                            state.zipCode = response?.data?.content?.data.zipCode ?? '';
                            state.country = response?.data?.content?.data.country ?? '';
                            state.phoneNumber = response?.data?.content?.data.phoneNumber ?? '';
                            state.faxNumber = response?.data?.content?.data.faxNumber ?? '';
                            state.emailAddress = response?.data?.content?.data.emailAddress ?? '';
                            state.type = response?.data?.content?.data.type ?? '';
                            state.gstNumber = response?.data?.content?.data.gstNumber ?? '';
                            //state.logoPreview = response?.data?.content?.data.logo ?? ''; // For display
                            //state.logoPath = response?.data?.content?.data.logo ?? '';

                            //state.logo = null; // Clear file input
                            //// Update logoPath with the returned path
                            //state.logoPath = response?.data?.content?.data.logoPath ?? '';
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
            handleFileUpload: async (file) => {
                debugger;
                try {
                    const response = await services.uploadLogo(file);
                    if (response.status === 200) {
                        const imageName = response?.data?.content?.imageName;
                        await services.updateLogoData(state.id, imageName);
                        //StorageManager.saveAvatar(imageName);

                        Swal.fire({
                            icon: "success",
                            title: "Upload Successful",
                            text: "Your image has been uploaded successfully!",
                            text: 'Page will be refreshed...',
                            timer: 1000,
                            showConfirmButton: false
                        });

                        setTimeout(() => {
                            changeLogoModal.obj.hide();
                            location.reload();
                        }, 1000);
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Upload Failed",
                            text: response.message ?? "An error occurred during upload."
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Upload Failed",
                        text: "An unexpected error occurred."
                    });
                }
            },
        };

        Vue.onMounted(async () => {
            Dropzone.autoDiscover = false;

            try {
                await SecurityManager.authorizePage(['Warehouses']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                nameText.create();
                mainModal.create();
                changeLogoModal.create();
                initLogoDropzone();
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
        let dropzoneInitialized = false;
        let initLogoDropzone = () => {
            if (!dropzoneInitialized && imageUploadRef.value) {
                dropzoneInitialized = true;
                const dropzoneInstance = new Dropzone(imageUploadRef.value, {
                    url: "api/FileImage/UploadLogo",
                    paramName: "file",
                    maxFilesize: 5,
                    acceptedFiles: "image/*",
                    addRemoveLinks: true,
                    dictDefaultMessage: "Drag and drop an image here to upload",
                    autoProcessQueue: false,
                    init: function () {
                        this.on("addedfile", async function (file) {
                            await handler.handleFileUpload(file);
                        });
                    }
                });
            }
        };

        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                debugger;
                // Convert Proxy to plain array if needed
                const gridDataSource = dataSource ? [...dataSource] : warehouseList.state.mainData;
                mainGrid.obj = new ej.grids.Grid({
                    height: '240px',
                    dataSource: gridDataSource,
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
                        { field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false },
                        { field: 'name', headerText: 'Name', width: 100, minWidth: 200 },
                        //{ field: 'systemWarehouse', headerText: 'System Warehouse', width: 100, minWidth: 150, textAlign: 'Center', type: 'boolean', displayAsCheckBox: true },
                        { field: 'description', headerText: 'Description', width: 100, maxWidth: 400 },
                        { field: 'currency', headerText: 'Currency', width: 100, minWidth: 50 },
                        { field: 'street', headerText: 'Street', width: 200, minWidth: 200 },
                        { field: 'city', headerText: 'City', width: 150, minWidth: 150 },
                        { field: 'state', headerText: 'State', width: 100, minWidth: 100 },
                        { field: 'zipCode', headerText: 'Zip Code', width: 100, minWidth: 100 },
                        { field: 'country', headerText: 'Country', width: 150, minWidth: 150 },
                        { field: 'phoneNumber', headerText: 'Phone Number', width: 150, minWidth: 150 },
                        { field: 'faxNumber', headerText: 'Fax Number', width: 150, minWidth: 150 },
                        { field: 'emailAddress', headerText: 'Email Address', width: 200, minWidth: 200 },
                        { field: 'type', headerText: 'Type', width: 100, minWidth: 100 },
                        { field: 'gstNumber', headerText: 'GST Number', width: 150, minWidth: 150 },
                        //{
                        //    field: 'logo',
                        //    headerText: 'Logo',
                        //    width: 100,
                        //    minWidth: 100,
                        //    //template: (rowData) => {
                        //    //    console.log('Logo Template rowData:', rowData); // Log rowData to inspect
                        //    //    // Ensure rowData is an object and logo is a non-empty string
                        //    //    if (rowData && typeof rowData === 'object' && typeof rowData.logo === 'string' && rowData.logo.trim() !== '') {
                        //    //        return `<img src="${rowData.logo}" alt="Logo" style="max-width: 50px; max-height: 50px;" />`;
                        //    //    }
                        //    //    console.log('Invalid logo, returning empty string. rowData.logo:', rowData?.logo);
                        //    //    return ''; // Return empty string for invalid cases
                        //    //}
                        //},
                        { field: 'createdAtUtc', headerText: 'Created At UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' },
                        //{ text: 'Change Logo', tooltipText: 'Change Logo', id: 'ChangeLogoCustom' },
                        { text: 'Add', tooltipText: 'Add', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'Edit', tooltipText: 'Edit', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'Delete', tooltipText: 'Delete', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangeLogoCustom'], false);
                        mainGrid.obj.autoFitColumns(['name', 'systemWarehouse', 'description', 'currency', 'street', 'city', 'state', 'zipCode', 'country', 'phoneNumber', 'faxNumber', 'emailAddress', 'type', 'gstNumber', 'logo', 'createdAtUtc']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length === 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangeLogoCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangeLogoCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length === 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangeLogoCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'ChangeLogoCustom'], false);
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
                        if (args.item.id === 'ChangeLogoCustom') {
                            debugger;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Change Logo';
                                state.id = selectedRecord.id ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.isSystemWarehouse = selectedRecord.systemWarehouse ?? false;
                                state.currency = selectedRecord.currency ?? '';
                                state.street = selectedRecord.street ?? '';
                                state.city = selectedRecord.city ?? '';
                                state.state = selectedRecord.state ?? '';
                                state.zipCode = selectedRecord.zipCode ?? '';
                                state.country = selectedRecord.country ?? '';
                                state.phoneNumber = selectedRecord.phoneNumber ?? '';
                                state.faxNumber = selectedRecord.faxNumber ?? '';
                                state.emailAddress = selectedRecord.emailAddress ?? '';
                                state.type = selectedRecord.type ?? '';
                                state.gstNumber = selectedRecord.gstNumber ?? '';
                                state.logo = selectedRecord.logo ?? '';
                                if (state.logo) {
                                    const logoData = state.logo;
                                    getLogoData(logoData);
                                }
                                changeLogoModal.obj.show();

                            }
                        }
                        if (args.item.id === 'AddCustom') {
                            debugger;
                            state.deleteMode = false;
                            state.mainTitle = 'Add Warehouse';
                            resetFormState();
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            debugger;
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Edit Warehouse';
                                state.id = selectedRecord.id ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.isSystemWarehouse = selectedRecord.systemWarehouse ?? false;
                                state.currency = selectedRecord.currency ?? '';
                                state.street = selectedRecord.street ?? '';
                                state.city = selectedRecord.city ?? '';
                                state.state = selectedRecord.state ?? '';
                                state.zipCode = selectedRecord.zipCode ?? '';
                                state.country = selectedRecord.country ?? '';
                                state.phoneNumber = selectedRecord.phoneNumber ?? '';
                                state.faxNumber = selectedRecord.faxNumber ?? '';
                                state.emailAddress = selectedRecord.emailAddress ?? '';
                                state.type = selectedRecord.type ?? '';
                                state.gstNumber = selectedRecord.gstNumber ?? '';
                                //state.logoPreview = typeof selectedRecord.logo === 'string' ? selectedRecord.logo : null;
                                //state.logo = null;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            debugger;
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'Delete Warehouse?';
                                state.id = selectedRecord.id ?? '';
                                state.name = selectedRecord.name ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.isSystemWarehouse = selectedRecord.systemWarehouse ?? false;
                                state.currency = selectedRecord.currency ?? '';
                                state.street = selectedRecord.street ?? '';
                                state.city = selectedRecord.city ?? '';
                                state.state = selectedRecord.state ?? '';
                                state.zipCode = selectedRecord.zipCode ?? '';
                                state.country = selectedRecord.country ?? '';
                                state.phoneNumber = selectedRecord.phoneNumber ?? '';
                                state.faxNumber = selectedRecord.faxNumber ?? '';
                                state.emailAddress = selectedRecord.emailAddress ?? '';
                                state.type = selectedRecord.type ?? '';
                                state.gstNumber = selectedRecord.gstNumber ?? '';
                                //state.logoPreview = typeof selectedRecord.logo === 'string' ? selectedRecord.logo : null;
                                //state.logo = null;
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
        const changeLogoModal = {
            obj: null,
            create: () => {
                changeLogoModal.obj = new bootstrap.Modal(changeLogoModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };
        return {
            mainGridRef,
            mainModalRef,
            changeLogoModalRef,
            imageUploadRef,
            nameRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');