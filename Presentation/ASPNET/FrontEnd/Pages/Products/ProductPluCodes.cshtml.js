/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
/// <reference path="../../../wwwroot/content/scripts/jsbarcode.all.min.js" />
//const state = Vue.reactive({
//    pluCodes: [],
//    isLoadingPlu: false,
//    loadError: ''
//});
//const services = {
//    getProductPluCodes: async () => {
//        return await AxiosManager.get(
//            "/Product/product-plu-codes"
//        );
//    }
//};
//const handler = {
//    loadPluCodes: async () => {
//        state.loadError = '';
//        try {
//            state.isLoadingPlu = true;

//            const response = await services.getProductPluCodes();
//            state.pluCodes = response?.data?.content || [];

//        } catch (err) {
//            console.error(err);
//            state.loadError = 'Failed to load PLU codes';
//        } finally {
//            state.isLoadingPlu = false;
//        }
//    }
//};
//Vue.onMounted(() => {
//    handler.loadPluCodes();
//});
const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            AttributeListLookupData: [],
            warehouseListLookupData: [],
            productListLookupData: [],
            AttributeDetailListLookupData:[]
        });

        const mainGridRef = Vue.ref(null);
        //const import JsBarcode from 'jsbarcode';

        const services = {
            getMainData: async () => {
                try {
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get("/Product/product-plu-codes");
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    debugger;
                    const locationId = StorageManager.getLocation();
                    const response = await AxiosManager.get('/Product/GetProductList?WarehouseId =' + locationId, {});
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
            getAttributeListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Attribute/GetAttributeList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getAttributeDetailListLookupData: async () => {
                try {
                    const response = await AxiosManager.post('/Attribute/GetAttributeDetails', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = (response?.data?.content || []).map(item => ({
                    ...item,
                    createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc) : null

                }));
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
                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.type === "Store" || warehouse.type === "Store&Sales") || [];
            },
            populateAttributeListLookupData: async () => {
                const response = await services.getAttributeListLookupData();
                state.AttributeListLookupData = response?.data?.content?.data;
            },
            populateAttributeDetailListLookupData: async () => {
                const response = await services.getAttributeDetailListLookupData();
                state.AttributeDetailListLookupData = response?.data?.content?.data;
            },
            printBarcode: async (record, copies = 2) => {
                const pluCode = record.pluCode;

                // 1️⃣ Full screen dimensions
                const width = window.screen.availWidth;
                const height = window.screen.availHeight;

                // 2️⃣ Open full window
                const printWindow = window.open(
                    '',
                    '',
                    `width=${width},height=${height},top=0,left=0,toolbar=no,scrollbars=yes,resizable=yes`
                );


                if (!printWindow) {
                    alert('Popup blocked. Please allow popups.');
                    return;
                }

                let labels = '';
                for (let i = 0; i < copies; i++) {
                    labels += `
            <div class="barcode-container">
                <svg class="barcode"></svg>
                <div class="plu-text">${pluCode}</div>
            </div>
        `;
                }
                //<script src="~/wwwroot/content/scripts/jsbarcode.all.min.js"></script>
                


                printWindow.document.write(`
        <html>
        <head>
            <style>
                .barcode-container {
                    width: 50mm;
                    margin: 5mm auto;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            ${labels}

            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
                window.onload = function () {
                    document.querySelectorAll('.barcode').forEach(el => {
                        JsBarcode(el, "${pluCode}", {
                            format: "CODE128",
                            height: 60,
                            width: 2,
                            displayValue: false
                        });
                    });
                    window.print();
                    window.onafterprint = () => window.close();
                };
            </script>
        </body>
        </html>
    `);

                printWindow.document.close();
            },

            onMainModalHidden: () => {
            },

        };

        Vue.onMounted(async () => {
            try {
                //await SecurityManager.authorizePage(['ProductPluCodes']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await methods.populateWarehouseListLookupData();
                await methods.populateAttributeListLookupData();
                await methods.populateAttributeDetailListLookupData();
                await methods.populateProductListLookupData();
                await mainGrid.create(state.mainData);

            } catch (e) {
                console.error('page init error:', e);
            } finally {

            }
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
                    //groupSettings: {
                    //    columns: ['productName']
                    //},
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
                        {
                            field: 'productId', headerText: 'ProductId', width: 200,
                            valueAccessor: (field, data, column) => {
                                const product = state.productListLookupData.find(item => item.id === data[field]);
                                return product ? `${product.numberName}` : '';
                            },
                        },
                        { field: 'pluCode', headerText: 'PluCode', width: 200, allowSearching: true },
                        {
                            field: 'attribute1DetailId', headerText: 'Attribute1', width: 200, 
                        
                            valueAccessor: (field, data, column) => {
                                debugger;
                                const AttributeList = state.AttributeDetailListLookupData.find(item => item.id === data[field]);
                                return AttributeList ? `${AttributeList.value}` : '';
                            },
                        },
                        {
                            field: 'attribute2DetailId', headerText: 'Attribute2', width: 150,
                            valueAccessor: (field, data, column) => {
                                debugger;
                                const AttributeList = state.AttributeDetailListLookupData.find(item => item.id === data[field]);
                                return AttributeList ? `${AttributeList.value}` : '';
                            },                        },
                    //    { field: 'createdAtUtc', headerText: 'Created At UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        'ExcelExport', 'Search',
                        { type: 'Separator' }, { text: 'Print Barcode', id: 'print_barcode', prefixIcon: 'e-print' }
                    ],
                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.autoFitColumns([ 'createdAtUtc']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                        } else {
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                        } else {
                        }
                    },
                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length) {
                            mainGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: (args) => {
                        if (args.item.id === 'print_barcode') {
                            const selected = mainGrid.obj.getSelectedRecords();
                            if (selected.length !== 1) {
                                alert('Please select exactly one record');
                                return;
                            }
                             methods.printBarcode(selected[0]);
                        }

                        if (args.item.id === 'MainGrid_excelexport') {
                            mainGrid.obj.excelExport();
                        }
                    }

                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () => {
                mainGrid.obj.setProperties({ dataSource: state.mainData });
            }
        };

        return {
            mainGridRef,
            state,
        };
    }
};

Vue.createApp(App).mount('#app');
