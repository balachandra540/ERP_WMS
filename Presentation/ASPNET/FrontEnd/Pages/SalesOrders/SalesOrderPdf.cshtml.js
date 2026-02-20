//const App = {
//    setup() {
//        const state = Vue.reactive({
//            company: {
//                name: '',
//                emailAddress: '',
//                phoneNumber: '',
//                street: '',
//                city: '',
//                state: '',
//                zipCode: '',
//                country: ''
//            },
//            companyAddress: '',
//            customer: {
//                name: '',
//                street: '',
//                city: '',
//                state: '',
//                zipCode: '',
//                country: '',
//                emailAddress: '',
//                phoneNumber: ''
//            },
//            customerAddress: '',
//            orderNumber: '',
//            orderDate: '',
//            orderCurrency: '',
//            subTotal: '',
//            tax: '',
//            totalAmount: '',
//            items: [],
//            isDownloading: false
//        });

//        const services = {
//            getPDFData: async (id) => {
//                try {
//                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderSingle?id=' + id, {});
//                    return response;
//                } catch (error) {
//                    throw error;
//                }
//            },
//        };

//        const methods = {
//            populatePDFData: async (id) => {
//                debugger;
//                const response = await services.getPDFData(id);
//                const pdfData = response?.data?.content?.data || {};
//                state.items = pdfData.salesOrderItemList || [];
//                state.customer = pdfData.customer || {};
//                state.orderNumber = pdfData.number || '';
//                state.orderDate = DateFormatManager.formatToLocale(pdfData.orderDate) || '';
//                state.orderCurrency = StorageManager.getCompany()?.currency || '';
//                state.subTotal = NumberFormatManager.formatToLocale(pdfData.beforeTaxAmount) || '';
//                state.tax = NumberFormatManager.formatToLocale(pdfData.taxAmount) || '';
//                state.totalAmount = NumberFormatManager.formatToLocale(pdfData.afterTaxAmount) || '';
//                methods.bindPDFControls();
//            },

//            bindPDFControls: () => {
//                debugger;
//                const company = StorageManager.getCompany() || state.company;
//                state.company = {
//                    name: company.name,
//                    emailAddress: company.emailAddress,
//                    phoneNumber: company.phoneNumber,
//                    street: company.street,
//                    city: company.city,
//                    state: company.state,
//                    zipCode: company.zipCode,
//                    country: company.country
//                };
//                state.companyAddress = [
//                    company.street,
//                    company.city,
//                    company.state,
//                    company.zipCode,
//                    company.country
//                ].filter(Boolean).join(', ');

//                state.customerAddress = [
//                    state.customer.street,
//                    state.customer.city,
//                    state.customer.state,
//                    state.customer.zipCode,
//                    state.customer.country
//                ].filter(Boolean).join(', ');
//            }
//        };

//        const handler = {
//            downloadPDF: async () => {
//                debugger;
//                state.isDownloading = true;
//                await new Promise(resolve => setTimeout(resolve, 500));

//                try {
//                    const { jsPDF } = window.jspdf;
//                    const doc = new jsPDF('p', 'mm', 'a4');
//                    const content = document.getElementById('content');

//                    await html2canvas(content, {
//                        scale: 2,
//                        useCORS: true
//                    }).then(canvas => {
//                        const imgData = canvas.toDataURL('image/png');
//                        const imgWidth = 210;
//                        const pageHeight = 297;
//                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
//                        let position = 0;

//                        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//                        doc.save(`sales-order-${state.orderNumber || 'unknown'}.pdf`);
//                    });
//                } catch (error) {
//                    console.error('Error generating PDF:', error);
//                } finally {
//                    state.isDownloading = false;
//                }
//            },
//        };

//        Vue.onMounted(async () => {
//            try {
//                await SecurityManager.authorizePage(['SalesOrders']);
//                var urlParams = new URLSearchParams(window.location.search);
//                var id = urlParams.get('id');
//                await methods.populatePDFData(id ?? '');
//            } catch (e) {
//                console.error('page init error:', e);
//            } finally {

//            }
//        });

//        return {
//            state,
//            handler,
//        };
//    }
//};

//Vue.createApp(App).mount('#app');

const App = {
    setup() {

        const state = Vue.reactive({
            company: {
                name: '',
                emailAddress: '',
                phoneNumber: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                gstin: ''
            },
            companyAddress: '',
            customer: {
                name: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                emailAddress: '',
                phoneNumber: '',
                gstin: ''
            },
            customerAddress: '',
            orderNumber: '',
            orderDate: '',
            orderCurrency: '',
            placeOfSupply: '',
            paymentMode: '',

            // Raw numeric values (important for calculation)
            subTotalRaw: 0,
            cgstRaw: 0,
            sgstRaw: 0,
            roundOffRaw: 0,
            totalAmountRaw: 0,

            // Formatted values (for UI)
            subTotal: '',
            cgst: '',
            sgst: '',
            roundOff: '',
            totalAmount: '',
            amountInWords: '',

            items: [],
            isDownloading: false
        });

        /* ================= SERVICES ================= */

        const services = {
            getPDFData: async (id) => {
                try {
                    const response = await AxiosManager.get('/SalesOrder/GetSalesOrderSingle?id=' + id, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            }
        };

        /* ================= METHODS ================= */

        const methods = {
            populatePDFData: async (id) => {
                debugger;
                const response = await services.getPDFData(id);
                const pdfData = response?.data?.content?.data || {};
                state.items = pdfData.salesOrderItemList || [];
                // Inside populatePDFData loop
                //state.items = pdfData.salesOrderItemList.map(item => ({
                //    ...item,
                //    formattedGross: NumberFormatManager.formatToLocale(item.unitPrice * item.quantity),
                //    formattedUnitPrice: NumberFormatManager.formatToLocale(item.unitPrice)
                //}));
                state.customer = pdfData.customer || {};
                state.orderNumber = pdfData.number || '';
                state.orderDate = DateFormatManager.formatToLocale(pdfData.orderDate) || '';
                state.orderCurrency = StorageManager.getCompany()?.currency || '';

                state.placeOfSupply = pdfData.placeOfSupply || state.customer.state || '';
                state.paymentMode = pdfData.paymentMode || '';

                // ---------------- RAW VALUES ----------------
                state.subTotalRaw = Number(pdfData.beforeTaxAmount || 0);
                const totalTax = Number(pdfData.taxAmount || 0);

                // Split tax equally (CGST + SGST)
                state.cgstRaw = totalTax / 2;
                state.sgstRaw = totalTax / 2;

                state.totalAmountRaw = Number(pdfData.afterTaxAmount || 0);

                // Round off calculation
                const calculatedTotal = state.subTotalRaw + totalTax;
                state.roundOffRaw = state.totalAmountRaw - calculatedTotal;

                methods.formatValues();
                methods.bindPDFControls();
            },

            formatValues: () => {

                state.subTotal = NumberFormatManager.formatToLocale(state.subTotalRaw);
                state.cgst = NumberFormatManager.formatToLocale(state.cgstRaw);
                state.sgst = NumberFormatManager.formatToLocale(state.sgstRaw);
                state.roundOff = NumberFormatManager.formatToLocale(state.roundOffRaw);
                state.totalAmount = NumberFormatManager.formatToLocale(state.totalAmountRaw);

                state.amountInWords = methods.convertNumberToWords(state.totalAmountRaw);
            },

            bindPDFControls: () => {

                const company = StorageManager.getCompany() || {};

                state.company = {
                    name: company.name,
                    emailAddress: company.emailAddress,
                    phoneNumber: company.phoneNumber,
                    street: company.street,
                    city: company.city,
                    state: company.state,
                    zipCode: company.zipCode,
                    country: company.country,
                    gstin: company.gstin
                };
                state.companyAddress = [
                    company.street,
                    company.city,
                    company.state,
                    company.zipCode,
                    company.country
                ].filter(Boolean).join(', ');

                state.customerAddress = [
                    state.customer.street,
                    state.customer.city,
                    state.customer.state,
                    state.customer.zipCode,
                    state.customer.country
                ].filter(Boolean).join(', ');
            },

            /* ================= AMOUNT IN WORDS ================= */

            convertNumberToWords: (amount) => {

                if (!amount) return '';

                const formatter = new Intl.NumberFormat('en-IN');
                const rupees = Math.floor(amount);
                const paise = Math.round((amount - rupees) * 100);

                return `INR ${formatter.format(rupees)} Rupees${paise > 0 ? ' and ' + paise + ' Paise' : ''} Only`;
            }
        };

        /* ================= HANDLER ================= */

        const handler = {
            downloadPDF: async () => {
                state.isDownloading = true;
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF('p', 'mm', 'a4');
                    const content = document.getElementById('content');

                    await html2canvas(content, {
                        scale: 2,
                        useCORS: true
                    }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 210;
                        const pageHeight = 297;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                        doc.save(`invoice-${state.orderNumber || 'unknown'}.pdf`);
                    });
                } catch (error) {
                    console.error('PDF generation error:', error);
                }
                finally {
                    state.isDownloading = false;
                }
            }
        };

        /* ================= LIFECYCLE ================= */

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['SalesOrders']);

                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');

                await methods.populatePDFData(id ?? '');

            } catch (e) {
                console.error('Page init error:', e);
            }
        });

        return {
            state,
            handler,
            // Add these so the HTML template can "see" them
            NumberFormatManager,
            DateFormatManager
        };
    }
};

Vue.createApp(App).mount('#app');