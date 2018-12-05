let domain = "http://localhost:5001/hlkschool-55376/us-central1/app/"
$(document).ready(function () {
    $('.select2').select2();
});


// -----------------------------------UI CONTROL
// UI COMMON
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
    IMP_ExcelFileReader(ev);
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

// -----------------------------------FUNCTION
// IMPORT DATA
function IMP_ExcelFileReader(oEvent) {
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;

    var reader = new FileReader();
    var result = {};

    reader.onload = function (e) {
        var data = e.target.result;
        data = new Uint8Array(data);
        var workbook = XLSX.read(data, {
            type: 'array'
        });
        //console.log(workbook);
        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (roa.length) result[sheetName] = roa;
        });
        //return JSON.stringify(result, 2, 2);
        // see the result, caution: it works after reader event is done.
        console.log(result);
        IMP_ShowData(IMP_LoadData(result));
    };
    reader.readAsArrayBuffer(oFile);
}

function IMP_LoadData(data) {
    var sheets = data;
    var className = "";
    var result = [];
    for (let sheet in sheets) {
        for (let row of sheets[sheet]) {
            var keys = Object.keys(row);
            if (keys.indexOf('Lớp/Họ và tên' >= 0)) {
                if (row['Lớp/Họ và tên'].indexOf('Lớp:') >= 0) {
                    className = row['Lớp/Họ và tên'].split(':')[1].trim();
                    continue;
                }
                var student = {};
                for (let key of keys) {
                    if (key == 'Lớp/Họ và tên') {
                        student['Họ Tên'] = row[key];
                    } else {
                        student[key] = row[key];
                    }
                }
                student['Lớp'] = className;
                result.push(student);
            }
        }
    }
    return result;
}

function IMP_ShowData(data) {
    console.log(JSON.stringify(data));
    window['IMPData'] = JSON.stringify(data);
    $('#imp-table tbody').html("");
    $('#imp-table thead').html("");
    var title = "",
        no = 1;
    for (student of data) {
        var row = "";
        title = `<td>No.</td><td>Lớp</td><td>Họ Tên</td>`;
        row += `<tr>`;
        row += `<td>${no}</td>`;
        row += `<td>${student['Lớp']}</td>`;
        row += `<td>${student['Họ Tên']}</td>`;
        no++;
        var price = 0;
        for (key of Object.keys(student)) {
            if (key != 'Lớp' && key != 'Họ Tên') {
                row += `<td>${student[key].toLocaleString()}</td>`;
                price = price + parseInt(student[key]);
                title += `<td>${key}</td>`;
            }
        }
        row += `<td>${price.toLocaleString()}</td>`;
        row += `</tr>`;
        $('#imp-table tbody').append(row);
    }
    $('#imp-table thead').append(`<tr>${title}<td>Tổng</td></tr>`);
    $(".imp-student").freezeTable({
        scrollBar: false,
    });


}

function IMP_GetData(Year, Month, Class) {
    return $.ajax({
        type: "GET",
        url: `BienLai?Year=${Year}&Month=${Month}&Class=${Class}`,
        success: function (resultData) {
            return resultData.data;
        },
        fail: function () {
            alert(resultData.mess);
        }
    });
}

function IMP_UploadData(Year, Month, Class, Data) {
    $.ajax({
        type: "POST",
        url: "BienLai",
        data: {
            Year: Year,
            Month: Month,
            Class: Class,
            Data: Data
        },
        success: function (resultData) {
            alert(resultData.mess);
        },
        fail: function () {
            alert(resultData.mess);
        }
    });
}

function IMP_DeleteData(Year, Month, Class) {
    return $.ajax({
        type: "DELETE",
        url: "BienLai?" + $.param({
            Year: Year,
            Month: Month,
            Class: Class
        }),
        success: function (resultData) {
            console.log(resultData.mess);
        },
        fail: function () {
            console.log(resultData.mess);
        }
    });
}
// INVOICE
function INV_GetInvoice(Year, Month, Class, StudentClass, StudentName) {
    
}