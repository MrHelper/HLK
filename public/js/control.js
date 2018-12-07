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
    $('.loading').fadeOut();
}

function IMP_GetData(Year, Month, Class) {
    return $.ajax({
        type: "GET",
        url: "BienLai?" + $.param({
            Year: Year,
            Month: Month,
            Class: Class
        }),
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
function INV_LoadStudentInfo(Year, Month, Class) {
    if (Year != "" && Month != "" && Class != "") {
        $('.loading').fadeIn();
        $.when(INV_GetStudent(Year, Month, Class)).done(function (result) {
            let Lop = [];
            let student = [];
            if (result.data) {
                for (let item of result.data) {
                    if (Lop.indexOf(item.Lop) < 0)
                        Lop.push(item.Lop);
                    if (item.Lop == Lop[0])
                        student.push(item.Ten);
                }
                window['student'] = result.data;
                $('#inv-lop').select2("destroy");
                $('#inv-lop').html("");
                $('#inv-lop').select2({
                    data: Lop.sort(),
                    disabled: false
                });
                $('#inv-hocsinh').select2("destroy");
                $('#inv-hocsinh').html("");
                $('#inv-hocsinh').select2({
                    data: student.sort(),
                    disabled: false
                });
                $('#inv-lop').trigger("change");
                $('#inv-hocsinh').trigger("change");
            } else {
                window['student'] = [];
                $('#inv-lop').val(null).trigger("change");
                $('#inv-lop').html("");
                $('#inv-lop').select2({
                    "disabled": true
                });
                $('#inv-hocsinh').val(null).trigger("change");
                $('#inv-hocsinh').html("");
                $('#inv-hocsinh').select2({
                    "disabled": true
                });
            }
            $('.loading').fadeOut();
        });
    }
}

function INV_GetStudentName(StudentClass) {
    var st = [];
    for (let Student of window['student']) {
        if (Student.Lop == StudentClass)
            st.push(Student.Ten);
    }
    $('#inv-hocsinh').html("");
    $('#inv-hocsinh').select2({
        data: st.sort(),
        disabled: false
    });
}

function INV_GetStudent(Year, Month, Class) {
    return $.ajax({
        type: "GET",
        url: "BienLai/DanhSach?" + $.param({
            Year: Year,
            Month: Month,
            Class: Class
        }),
        success: function (resultData) {
            return resultData.data;
        },
        fail: function () {
            alert(resultData.mess);
        }
    });
}

function INV_GetInvoice(Year, Month, Class, StudentClass, StudentName) {
    return $.ajax({
        type: "GET",
        url: "HoaDon?" + $.param({
            Year: Year,
            Month: Month,
            Class: Class,
            StudentClass: StudentClass,
            StudentName: StudentName
        }),
        success: function (resultData) {
            return resultData.data;
        },
        fail: function () {
            alert(resultData.mess);
        }
    });
}

function INV_LoadInvoice(data) {
    let InvoiceData = data[0];
    let Title = Object.keys(InvoiceData).sort();

    $('.HoTen').text(InvoiceData['Họ Tên'].toUpperCase());
    $('.DiaChi').text(InvoiceData['Lớp']);
    let rowno = 0,
        total = 0;
    let Pay = InvoiceData['Pay'];
    if (Pay == false || typeof Pay === "undefined") {
        $('#inv-trangthai').addClass('hidden');
        $('#inv-trangthai').attr("disabled", true);
    } else {
        $('#inv-trangthai').removeClass('hidden');
        $('#inv-trangthai').attr('disabled', false);
    }
    for (let i = 0; i < Title.length; i++) {
        if (Title[i] != 'Lớp' && Title[i] != 'Họ Tên') {
            let price = InvoiceData[Title[i]];
            total += price;
            $('#hoadon-l1 .row-' + (rowno)).find('td:eq(0)').text(rowno + 1);
            $('#hoadon-l2 .row-' + (rowno)).find('td:eq(0)').text(rowno + 1);

            $('#hoadon-l1 .row-' + (rowno)).find('td:eq(1)').text(Title[i]);
            $('#hoadon-l2 .row-' + (rowno)).find('td:eq(1)').text(Title[i]);

            $('#hoadon-l1 .row-' + (rowno)).find('td:eq(3)').text(1);
            $('#hoadon-l2 .row-' + (rowno)).find('td:eq(3)').text(1);

            $('#hoadon-l1 .row-' + (rowno)).find('td:eq(4)').text(price.toLocaleString());
            $('#hoadon-l2 .row-' + (rowno)).find('td:eq(4)').text(price.toLocaleString());

            $('#hoadon-l1 .row-' + (rowno)).find('td:eq(5)').text(price.toLocaleString());
            $('#hoadon-l2 .row-' + (rowno)).find('td:eq(5)').text(price.toLocaleString());
            rowno++;
        }
    }
    $('#hoadon-l1 .total-num').text(total.toLocaleString());
    $('#hoadon-l2 .total-num').text(total.toLocaleString());
    $('#hoadon-l1 .total-text').text(ReadNumber(total));
    $('#hoadon-l2 .total-text').text(ReadNumber(total));
}

function INV_UpdateInvoice(Year, Month, Class, StudentClass, StudentName, Pay) {
    $.ajax({
        type: "POST",
        url: "HoaDon",
        data: {
            Year: Year,
            Month: Month,
            Class: Class,
            StudentClass: StudentClass,
            StudentName: StudentName,
            Pay: Pay
        },
        success: function (resultData) {
            if (Pay == true) {

            }
        },
        fail: function () {
            alert(resultData.mess);
        }
    });
}

// SUMARY

function SUM_GetData(Year, Month, Class) {
    if (Year && Month && Class) {
        $.when(IMP_GetData(Year, Month, Class).done(function (data) {
            console.log(data);
            SUM_LoadData(data.data);
        }));
    }

}

function SUM_LoadData(data) {
    if (data) {
        $('#sum-exceltable thead').html('');
        $('#sum-exceltable tbody').html('');
        let Row = "";
        let keys = Object.keys(data[0]);
        let thead = `<tr><td>Lớp</td><td>Họ Tên</td>`;

        for (let key of keys) {
            if (key != "Lớp" && key != "Họ Tên") {
                thead += `<td>${key}</td>`;
            }
        }
        thead += "<td>Tổng cộng</td><td>Tình trạng</td></tr>";
        for (let item of data) {
            Row += `<tr>`;
            Row += `<td>${item['Lớp']}</td>`
            Row += `<td>${item['Họ Tên']}</td>`
            var total = 0;
            for (let key of keys) {
                if (key != "Lớp" && key != "Họ Tên") {
                    Row += `<td>${item[key].toLocaleString()}</td>`;
                    total += item[key];
                }
            }
            Row += `<td>${total.toLocaleString()}</td>`;
            Row += `<td>${item['Pay']=="true"?'O':''}</td>`;
            Row += `</tr>`;
        }
        $('#sum-exceltable thead').append(thead);
        $('#sum-exceltable tbody').append(Row);
    }else{
        $('#sum-exceltable thead').html('');
        $('#sum-exceltable tbody').html('');
    }
}