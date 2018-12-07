let domain = "http://localhost:5001/hlkschool-55376/us-central1/app/"
$(document).ready(function () {
    Navigation('Home');
    $('.select2').select2();
    $('.loading').fadeOut();

});
// -----------------------------------UI CONTROL
// UI COMMON
$('.page-content').slideUp('fast');

let d = new Date();
$('.ngay-ht').text(d.getDay());
$('.thang-ht').text(d.getMonth());
$('.nam-ht').text(d.getFullYear());

$('.sidebar-menu li').on('click', function () {
    $('.sidebar-menu li').removeClass('active');
    if ($(this).attr('page'))
        Navigation($(this).attr('page'));
});

function Navigation(page) {
    $('.page-content').slideUp('fast');
    $('#' + page).slideDown('slow');
}

// UI INPUT DATA PAGE
$('#imp-file').change(function (ev) {
    $('.loading').fadeIn(function () {
        IMP_ExcelFileReader(ev);
    });

});

$('#imp-add').on('click', function () {
    let Year = $('#imp-namhoc').val();
    let Month = $('#imp-hocky').val();
    let Class = $('#imp-loai').val();
    if (Year != "" && Month != "" && Class != "") {
        $.when(IMP_GetData(Year, Month, Class)).done(function (result) {
            if (result.data) {
                if (confirm("Đã có dữ liệu của tháng này. Bạn có muốn ghi đè không ?")) {
                    $.when(IMP_DeleteData(Year, Month, Class).done(function () {
                        IMP_UploadData(Year, Month, Class, window['IMPData']);
                    }))
                } else {
                    return;
                }
            } else {
                IMP_UploadData(Year, Month, Class, window['IMPData']);
            }
        });
    }
});

// UI INVOICE DATA PAGE
$('#inv-namhoc').on('change', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    INV_LoadStudentInfo(Year, Month, Class);
})

$('#inv-hocky').on('change', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    INV_LoadStudentInfo(Year, Month, Class);
})

$('#inv-loai').on('change', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    INV_LoadStudentInfo(Year, Month, Class);
})

$('#inv-lop').on('change', function () {
    INV_GetStudentName($(this).val());
})

$('#inv-hocsinh').on('change', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    let StudentClass = $('#inv-lop').val();
    let StudentName = $('#inv-hocsinh').val();
    $('.loading').fadeIn();
    if (Year != "" && Month != "" && Class != "" && StudentClass != "" && StudentName != "") {
        $.when(INV_GetInvoice(Year, Month, Class, StudentClass, StudentName)).done(function (data) {
            if (data.data)
                INV_LoadInvoice(data.data);
            $('.loading').fadeOut();
        })
    }
})

$('#inv-inbienlai').on('click', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    let StudentClass = $('#inv-lop').val();
    let StudentName = $('#inv-hocsinh').val();
    if (Year != "" && Month != "" && Class != "" && StudentClass != "" && StudentName != "") {
        $.when(INV_UpdateInvoice(Year, Month, Class, StudentClass, StudentName, true)).done(function () {
            $('.invoice-print').printThis();
        });
    }
})

$('#inv-trangthai').on('click', function () {
    let Year = $('#inv-namhoc').val();
    let Month = $('#inv-hocky').val();
    let Class = $('#inv-loai').val();
    let StudentClass = $('#inv-lop').val();
    let StudentName = $('#inv-hocsinh').val();
    if (Year != "" && Month != "" && Class != "" && StudentClass != "" && StudentName != "") {
        $.when(INV_UpdateInvoice(Year, Month, Class, StudentClass, StudentName, false)).done(function () {
            alert("Đã hủy bỏ hóa đơn.");
        });
    }
})

// UI SUM DATA PAGE

$('#sum-loai').on('change', function () {
    let Class = $('#sum-loai').val();
    let Year = $('#sum-namhoc').val();
    let Month = $('#sum-hocky').val();
    SUM_GetData(Year, Month, Class);
})

$('#sum-namhoc').on('change', function () {
    let Class = $('#sum-loai').val();
    let Year = $('#sum-namhoc').val();
    let Month = $('#sum-hocky').val();
    SUM_GetData(Year, Month, Class);
})

$('#sum-hocky').on('change', function () {
    let Class = $('#sum-loai').val();
    let Year = $('#sum-namhoc').val();
    let Month = $('#sum-hocky').val();
    SUM_GetData(Year, Month, Class);
})

$('#sum-xuatexcel').on('click', function () {
    $('#sum-exceltable').excelexportjs({
        containerid: "sum-exceltable",
        datatype: 'table'
    });
})