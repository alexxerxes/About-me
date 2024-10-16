    // تحميل مكتبة Google Charts
        google.charts.load('current', { packages: ['table'] });
        google.charts.setOnLoadCallback(drawProductTable);

        // استدعاء بيانات المنتجات
        function drawProductTable() {
            var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1M7WLnM9Dgbz-fzpoJmbW3DSC9Z-apul8qMD0mJjmB1U/gviz/tq?sheet=Sheet1');
            query.send(handleProductQueryResponse);
        }

        // معالجة استجابة الاستعلام
        function handleProductQueryResponse(response) {
            if (response.isError()) {
                console.error('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                return;
            }
            var data = response.getDataTable();
            var productTable = document.getElementById('productTable');

            // إضافة الصفوف إلى الجدول
            for (var i = 0; i < data.getNumberOfRows(); i++) {
                var row = productTable.insertRow();
                
                for (var j = 0; j < 4; j++) {
                    var cell = row.insertCell(j);
                    cell.innerHTML = data.getValue(i, j);
                }
                // إضافة زر الطلب في عمود جديد
                var actionCell = row.insertCell(4);
                actionCell.innerHTML = "<button class='order-button' onclick='openOrderModal(this)'>Order</button>";

            }
        }

        // فتح نافذة الطلب
        function openOrderModal(button) {
            const productName = button.parentNode.parentNode.cells[1].innerHTML;
            const productPrice = button.parentNode.parentNode.cells[3].innerHTML; // الحصول على السعر
            const productDate = button.parentNode.parentNode.cells[0].innerHTML; // الحصول على التاريخ (تأكد من موقعه الصحيح)
            
 document.getElementById("modalProductDate").innerText = `Date: ${productDate}`; 
 // تعيين التاريخ في النافذة
             document.getElementById("modalProductName").innerText = productName;
            document.getElementById("orderModal").style.display = "block";
            document.getElementById('overlay').classList.add('show');
            document.getElementById("orderModal").dataset.price = productPrice; // تخزين السعر في بيانات النافذة
        }

        // إغلاق النافذة
        function closeModal() {
            document.getElementById("orderModal").style.display = "none";
            document.getElementById('overlay').classList.remove('show');
        }

        // إضافة الطلب
        function addToOrder() {
            
            const productDate = document.getElementById("modalProductDate").innerText.replace('Date: ', '');
             // افترض أن تاريخ المنتج موجود هنا
            
   const selectedProduct = document.getElementById("modalProductName").innerText;
            const quantity = parseInt(document.getElementById('quantity').value);
            const price = parseFloat(document.getElementById("orderModal").dataset.price);
            const totalPrice = quantity * price;

           

            // إضافة الطلب إلى localStorage
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
           
            
            let productExists = false;

    // تحقق مما إذا كان المنتج وتاريخه موجودين مسبقًا
    orders = orders.map(order => {
        if (order.name === selectedProduct && order.date === productDate) {
            // إذا كان المنتج وتاريخه متطابقين، يتم تحديث الكمية والإجمالي
            order.quantity += quantity;
            order.totalPrice = order.quantity * order.price;
            productExists = true;
        }
        return order;
    });
    
             // إذا لم يكن المنتج بنفس التاريخ موجودًا، أضف طلبًا جديدًا
    if (!productExists) {
        const newOrder = {                    
            date: productDate, // إضافة تاريخ المنتج للطلب الجديد
            name: selectedProduct,
            quantity: quantity,
            price: price,
            totalPrice: totalPrice
        };
        orders.push(newOrder);
        addOrderToTable(newOrder);
    } else {
        // تحديث الجدول إذا تم تعديل الكمية
        updateOrderTable(orders);
    }
    
            
            localStorage.setItem('orders', JSON.stringify(orders));

            

            closeModal();
            document.getElementById('orderListTitle').style.display = '';
            
        }

        // إضافة الطلب إلى الجدول
        function addOrderToTable(order) {
            const orderTable = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
            const newRow = orderTable.insertRow(0);

const dateCell = newRow.insertCell(0); 
const nameCell = newRow.insertCell(1);
            const quantityCell = newRow.insertCell(2);
            const priceCell = newRow.insertCell(3);
            const totalCell = newRow.insertCell(4);
            const actionCell = newRow.insertCell(5);

dateCell.innerText = order.date;
nameCell.innerText = order.name;
quantityCell.innerText = order.quantity;
priceCell.innerText = order.price.toFixed(2);
            totalCell.innerText = order.totalPrice.toFixed(2);
            actionCell.innerHTML = "<button class='order-button-red' onclick='cancelOrder(this)'>×</button>";
            
            updateTotal();
        }

// تحديث الجدول إذا تم تعديل الكمية
function updateOrderTable(orders) {
    const orderTable = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    orderTable.innerHTML = ''; // مسح الجدول

    // إعادة إضافة الطلبات المحدثة إلى الجدول
    orders.forEach(order => {
        addOrderToTable(order);
    });
}

        // تحميل الطلبات المحفوظة عند تحميل الصفحة
        window.onload = function() {
            loadOrders();
        };

        // تحميل الطلبات من localStorage
        function loadOrders() {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            if (orders.length > 0) {
                document.getElementById('orderListTitle').style.display = '';
                
                orders.forEach(order => addOrderToTable(order));
            }
        }

        // إلغاء الطلب
        function cancelOrder(button) {
            const row = button.parentNode.parentNode;
            const productName = row.cells[1].innerText;

            // حذف الطلب من الجدول
            row.parentNode.removeChild(row);

            // حذف الطلب من localStorage
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders = orders.filter(order => order.name !== productName);
            localStorage.setItem('orders', JSON.stringify(orders));


            // إخفاء الجدول إذا لم يكن هناك طلبات
            if (orders.length === 0) {
                document.getElementById('orderListTitle').style.display = 'none';
               
            }else {
                updateTotal();
            }
        }
        
        // البحث في المنتجات
        
 function searchProducts() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('productTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) { // ابدأ من 1 لتخطي رأس الجدول
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        // تحقق في كل خلية في الصف
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell) {
                const txtValue = cell.textContent || cell.innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }

        // إظهار أو إخفاء الصف بناءً على النتيجة
        rows[i].style.display = found ? "" : "none";
    }
}           


function cancelAllOrders() {
    const orderTable = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    
    // حذف جميع الصفوف
    while (orderTable.rows.length > 0) {
        orderTable.deleteRow(0);
    }
    
    // حذف البيانات من localStorage
    localStorage.removeItem('orders');
    
    // اخفاء جدول الطلبات 
    document.getElementById('orderListTitle').style.display = 'none';
    
}


// دالة لحساب الإجمالي
function updateTotal() {
    const orderTable = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    const rows = orderTable.getElementsByTagName('tr');
    let totalSum = 0;

    // جمع جميع القيم في عمود الإجمالي
    for (let row of rows) {
        const totalCell = row.cells[4]; // إجمالي السعر في العمود الخامس
        if (totalCell) {
            totalSum += parseFloat(totalCell.innerText); // إضافة قيمة كل صف إلى المجموع
        }
    }

    // تحديث أو إضافة صف الإجمالي
    let totalRow = document.getElementById('totalRow');
    if (!totalRow) {
        // إذا لم يكن هناك صف إجمالي، أنشئ صفاً جديداً
        totalRow = document.createElement('tr');
        totalRow.id = 'totalRow';
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.colSpan = 4; // دمج 4 خلايا لتكون صف الإجمالي
        totalLabelCell.innerText = 'Total';
        totalRow.appendChild(totalLabelCell);

        const totalAmountCell = document.createElement('td');
        totalAmountCell.id = 'totalAmount';
        totalAmountCell.innerText = totalSum.toFixed(2);
        totalRow.appendChild(totalAmountCell);

        orderTable.appendChild(totalRow);
    } else {
        // إذا كان الصف الإجمالي موجودًا، حدّث قيمته
        const totalAmountCell = document.getElementById('totalAmount');
        if (totalAmountCell) {
            totalAmountCell.innerText = totalSum.toFixed(2);
        }
    }
}

// ارسال الطلبات عبر الواتس
function sendOrderViaWhatsApp() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        alert("لا يوجد طلبات لإرسالها.");
        return;
    }

    let message = 'تفاصيل الطلب:\n';
    orders.forEach(order => {
        message += `المنتج: ${order.name}, الكمية: ${order.quantity}, السعر: ${order.price.toFixed(2)}, الإجمالي: ${order.totalPrice.toFixed(2)}\n`;
    });

    // حساب الإجمالي النهائي
    let totalSum = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    message += `\nالإجمالي الكلي: ${totalSum.toFixed(2)} ريال`;

    // تحويل النص إلى URI
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "770963942"; // قم بإضافة رقمك بدون علامة +
    
    // بناء رابط الواتساب
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // فتح رابط الواتساب
    window.open(whatsappLink, '_blank');
   }
  