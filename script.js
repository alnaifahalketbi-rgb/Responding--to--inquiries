
// ==========================================
// نظام استفسارات المتعاملين
// ==========================================

const STORAGE_KEY = "customerRecords";

let currentInquiryFilter = "لم يتم الرد";
let selectedInquiryId = null;


// ==========================================
// 1. قراءة الاستفسارات
// ==========================================

function getRecords() {
    try {
        const records = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(records) ? records : [];

    } catch (error) {
        console.error("خطأ في قراءة الاستفسارات:", error);
        return [];
    }
}


// ==========================================
// 2. حفظ الاستفسارات
// ==========================================

function saveRecords(records) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}


// ==========================================
// 3. الانتقال إلى المرحلة الثانية
// ==========================================

function nextStep() {

    const name = document
        .getElementById("customerName")
        .value.trim();

    const phone = document
        .getElementById("customerPhone")
        .value.trim();

    if (!name || !phone) {
        alert("يرجى إدخال اسم المتعامل ورقم الهاتف");
        return;
    }

    const now = new Date();

    document.getElementById("showName").textContent =
        name;

    document.getElementById("showPhone").textContent =
        "+971 " + phone;

    document.getElementById("showDay").textContent =
        now.toLocaleDateString("ar-AE", {
            weekday: "long"
        });

    document.getElementById("showDate").textContent =
        now.toLocaleDateString("ar-AE");

    document.getElementById("showTime").textContent =
        now.toLocaleTimeString("ar-AE", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("step1").style.display =
        "none";

    document.getElementById("step2").style.display =
        "block";
}


// ==========================================
// 4. إرسال استفسار المتعامل
// ==========================================

function sendInquiry() {

    const employeeInput =
        document.getElementById("employeeName");

    const inquiryInput =
        document.getElementById("inquiry");

    const employee = employeeInput.value.trim();
    const inquiry = inquiryInput.value.trim();

    if (!employee || !inquiry) {
        alert("يرجى إدخال اسم الموظف والاستفسار");
        return;
    }

    const record = {

        id: Date.now().toString() + "-" +
            Math.random().toString(36).slice(2),

        name: document.getElementById("showName")
            .textContent,

        phone: document.getElementById("showPhone")
            .textContent,

        day: document.getElementById("showDay")
            .textContent,

        date: document.getElementById("showDate")
            .textContent,

        time: document.getElementById("showTime")
            .textContent,

        employee: employee,

        inquiry: inquiry,

        status: "لم يتم الرد",

        // ملاحظات الرد تكون فارغة عند التسجيل
        replyNotes: ""
    };

    try {

        const records = getRecords();

        records.push(record);

        saveRecords(records);

        document.getElementById("message").textContent =
            "تم تسجيل الاستفسار بنجاح";

        employeeInput.disabled = true;
        inquiryInput.disabled = true;

        const sendButton =
            document.querySelector("#step2 button");

        if (sendButton) {
            sendButton.disabled = true;
        }

        const newButton =
            document.getElementById("newInquiryButton");

        if (newButton) {
            newButton.style.display = "block";
        }

    } catch (error) {

        console.error("خطأ في حفظ الاستفسار:", error);

        alert("حدث خطأ أثناء حفظ الاستفسار");
    }
}


// ==========================================
// 5. تسجيل استفسار جديد
// ==========================================

function showCustomerPage() {

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("employeeName").value = "";
    document.getElementById("inquiry").value = "";

    document.getElementById("employeeName").disabled =
        false;

    document.getElementById("inquiry").disabled =
        false;

    const sendButton =
        document.querySelector("#step2 button");

    if (sendButton) {
        sendButton.disabled = false;
    }

    document.getElementById("message").textContent = "";

    const newButton =
        document.getElementById("newInquiryButton");

    if (newButton) {
        newButton.style.display = "none";
    }

    document.getElementById("step1").style.display =
        "block";

    document.getElementById("step2").style.display =
        "none";
}


// ==========================================
// 6. تحديث أعداد الاستفسارات
// ==========================================

function updateInquiryCounts(records) {

    const total = records.length;

    const pending = records.filter(
        record => record.status !== "تم الرد"
    ).length;

    const replied = records.filter(
        record => record.status === "تم الرد"
    ).length;

    document.getElementById("totalCount").textContent =
        total;

    document.getElementById("pendingCount").textContent =
        pending;

    document.getElementById("repliedCount").textContent =
        replied;
}


// ==========================================
// 7. التنقل بين خانات الاستفسارات
// ==========================================

function filterInquiries(status) {

    currentInquiryFilter = status;

    selectedInquiryId = null;

    document.getElementById("inquiryDetails").style.display =
        "none";

    displayInquiries();
}


// ==========================================
// 8. عرض الاستفسارات
// ==========================================

function displayInquiries() {

    const tbody =
        document.getElementById("inquiriesTableBody");

    if (!tbody) {
        return;
    }

    const records = getRecords();

    tbody.innerHTML = "";

    updateInquiryCounts(records);

    document.getElementById("pendingTab")
        .classList.toggle(
            "active",
            currentInquiryFilter === "لم يتم الرد"
        );

    document.getElementById("repliedTab")
        .classList.toggle(
            "active",
            currentInquiryFilter === "تم الرد"
        );

    const filteredRecords = records.filter(record => {

        if (currentInquiryFilter === "تم الرد") {
            return record.status === "تم الرد";
        }

        return record.status !== "تم الرد";
    });

    const emptyMessage =
        document.getElementById("emptyMessage");

    if (emptyMessage) {

        emptyMessage.style.display =
            filteredRecords.length === 0
                ? "block"
                : "none";

        emptyMessage.textContent =
            currentInquiryFilter === "تم الرد"
                ? "لا توجد استفسارات تم الرد عليها حالياً"
                : "لا توجد استفسارات بانتظار الرد حالياً";
    }

    filteredRecords.forEach((record, index) => {

        const row = document.createElement("tr");

        function addCell(value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "";

            row.appendChild(cell);
        }

        addCell(index + 1);
        addCell(record.name);
        addCell(record.date);
        addCell(record.employee);

        const statusCell =
            document.createElement("td");

        const statusLabel =
            document.createElement("span");

        if (record.status === "تم الرد") {

            statusLabel.className =
                "status-replied";

            statusLabel.textContent =
                "تم الرد";

        } else {

            statusLabel.className =
                "status-not-replied";

            statusLabel.textContent =
                "لم يتم الرد";
        }

        statusCell.appendChild(statusLabel);

        row.appendChild(statusCell);

        const detailsCell =
            document.createElement("td");

        const detailsButton =
            document.createElement("button");

        detailsButton.type = "button";

        detailsButton.textContent =
            "عرض التفاصيل";

        detailsButton.className =
            "details-button";

        detailsButton.onclick = function () {
            openInquiry(record.id);
        };

        detailsCell.appendChild(detailsButton);

        row.appendChild(detailsCell);

        tbody.appendChild(row);
    });
}


// ==========================================
// 9. فتح تفاصيل الاستفسار
// ==========================================

function openInquiry(id) {

    const records = getRecords();

    const record = records.find(
        item => item.id === id
    );

    if (!record) {
        alert("لم يتم العثور على الاستفسار");
        return;
    }

    selectedInquiryId = id;

    document.getElementById("detailName").textContent =
        record.name || "";

    document.getElementById("detailPhone").textContent =
        record.phone || "";

    document.getElementById("detailDay").textContent =
        record.day || "";

    document.getElementById("detailDate").textContent =
        record.date || "";

    document.getElementById("detailTime").textContent =
        record.time || "";

    document.getElementById("detailEmployee").textContent =
        record.employee || "";

    document.getElementById("detailInquiry").textContent =
        record.inquiry || "";

    // استرجاع ملاحظات الرد المحفوظة
    document.getElementById("replyNotes").value =
        record.replyNotes || "";

    document.getElementById("inquiryStatus").value =
        record.status === "تم الرد"
            ? "تم الرد"
            : "لم يتم الرد";

    const details =
        document.getElementById("inquiryDetails");

    details.style.display = "block";

    details.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// 10. حفظ حالة الاستفسار وملاحظات الرد
// ==========================================

function updateInquiryStatus() {

    if (!selectedInquiryId) {

        alert("يرجى اختيار استفسار أولاً");
        return;
    }

    const records = getRecords();

    const record = records.find(
        item => item.id === selectedInquiryId
    );

    if (!record) {

        alert("لم يتم العثور على الاستفسار");
        return;
    }

    const newStatus =
        document.getElementById("inquiryStatus").value;

    if (
        newStatus !== "تم الرد" &&
        newStatus !== "لم يتم الرد"
    ) {
        alert("حالة الاستفسار غير صحيحة");
        return;
    }

    // حفظ الملاحظة مع نفس الاستفسار
    const notes =
        document.getElementById("replyNotes").value.trim();

    record.status = newStatus;
    record.replyNotes = notes;

    try {

        saveRecords(records);

        document.getElementById("inquiryDetails")
            .style.display = "none";

        selectedInquiryId = null;

        displayInquiries();

        alert("تم حفظ حالة الاستفسار وملاحظات الرد بنجاح");

    } catch (error) {

        console.error("خطأ في الحفظ:", error);

        alert("تعذر حفظ حالة الاستفسار والملاحظات");
    }
}


// ==========================================
// 11. تشغيل صفحة المتابعة تلقائياً
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById(
                "inquiriesTableBody"
            )
        ) {
            displayInquiries();
        }

    }
);
// حذف استفسار محدد
function deleteInquiry() {

    if (!selectedInquiryId) {
        alert("يرجى اختيار استفسار أولاً");
        return;
    }

    const confirmed = confirm(
        "هل أنتِ متأكدة من حذف هذا الاستفسار نهائياً؟"
    );

    if (!confirmed) {
        return;
    }

    try {
        const records = getRecords();

        const updatedRecords = records.filter(
            record => record.id !== selectedInquiryId
        );

        saveRecords(updatedRecords);

        selectedInquiryId = null;

        document.getElementById("inquiryDetails")
            .style.display = "none";

        displayInquiries();

        alert("تم حذف الاستفسار بنجاح");

    } catch (error) {
        console.error(error);
        alert("تعذر حذف الاستفسار");
    }
}