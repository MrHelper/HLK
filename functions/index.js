const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp(functions.config().firebase);
functions.config = function () {
    return {
        firebase: {
            "apiKey": "AIzaSyDkDtpiUnkc1t7Glx1SplioQXa0FFYgulE",
            "databaseURL": "https://hlkschool-55376.firebaseio.com",
            "storageBucket": "hlkschool-55376.appspot.com",
            "authDomain": "hlkschool-55376.firebaseapp.com",
            "messagingSenderId": "821348018239",
            "projectId": "hlkschool-55376"
        }
    };
}

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const db = admin.firestore();
const app = express();

// INIT Var
const bienLairef = db.collection('BienLai');
const HocSinhref = db.collection('HocSinh');

app.post('/BienLai', (req, res) => {
    console.log(req);
    var status = 200;
    var mess = "";
    var reqBody = req.body;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class,
        Data = reqBody.Data;
    if (Month && Year && Class && Data) {
        var jData = JSON.parse(Data);

        // DELETE OLD STUDENT INFO START
        var Reref = db.collection(Year + "-" + Month).doc(Class).collection('DanhSach').get().then(snap => {
            if (snap.size > 0) {
                snap.forEach(doc => {
                    doc.ref.delete();
                });
            }
            return true;
        });
        // DELETE OLD STUDENT INFO END
        for (let item of jData) {
            let Lop = item['Lớp'];
            db.collection(Year + "-" + Month).doc(Class).collection('ThongTin').add(item);
            db.collection(Year + "-" + Month).doc(Class).collection('DanhSach').add({
                Lop: Lop,
                Ten: item['Họ Tên']
            });
        }
        return res.status(200).send({
            mess: "Thêm dữ liệu thành công"
        });
    } else {
        res.status(400).send({
            mess: "Thiếu thông tin."
        });
    }
})

app.delete('/BienLai', (req, res) => {
    var reqBody = req.query;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class;
    var Reref = db.collection(Year + "-" + Month).doc(Class).delete().then(docs => {
        return res.status(200).send({
            mess: 'Đã xóa xong.',
        });
    }).catch(err => {
        return res.status(400).send({
            mess: 'Không có danh mục nào để xóa',
            err: err
        });
    })
});

app.get('/BienLai', (req, res) => {
    var reqBody = req.query;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class;
    if (Month && Year && Class) {
        var Reref = db.collection(Year + "-" + Month).doc(Class).collection('ThongTin').get()
            .then(snap => {
                if (snap.size > 0) {
                    var data = [];
                    snap.forEach(doc => {
                        data.push(doc.data());
                    });
                    return res.status(200).send({
                        data: data.sort(function(a,b) {return (a['Lớp'] > b['Lớp']) ? 1 : ((b['Lớp'] > a['Lớp']) ? -1 : 0);} ),
                        mess: 'Hoàn tất'
                    });
                } else {
                    return res.status(200).send({
                        mess: 'Không có danh mục nào.',
                    });
                }
            });
    } else {
        res.status(400).send({
            mess: "Thiếu thông tin."
        });
    }
})

app.get('/BienLai/DanhSach', (req, res) => {
    var reqBody = req.query;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class;
    if (Month && Year && Class) {
        var Reref = db.collection(Year + "-" + Month).doc(Class).collection('DanhSach').get().then(snap => {
            if (snap.size > 0) {
                var data = [];
                snap.forEach(doc => {
                    data.push(doc.data());
                });
                return res.status(200).send({
                    data: data,
                    mess: 'Hoàn tất'
                });
            } else {
                return res.status(200).send({
                    mess: 'Không có danh mục nào.',
                });
            }
        }).catch(err => {
            return res.status(200).send({
                mess: 'Không thực thi được.',
                err: err
            });
        });
    } else {
        res.status(400).send({
            mess: "Thiếu thông tin."
        });
    }
})

app.get('/HoaDon', (req, res) => {
    var reqBody = req.query;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class,
        StudentClass = reqBody.StudentClass,
        StudentName = reqBody.StudentName;
    var ref = db.collection(Year + "-" + Month).doc(Class).collection('ThongTin')
        .where('Họ Tên', '==', StudentName)
        .where('Lớp', '==', StudentClass).get().then(snap => {
            var data = [];
            snap.forEach(doc => {
                data.push(doc.data());
            })
            return res.status(200).send({
                mess: "Hoàn tất",
                data: data
            });
        }).catch(err => {
            return res.status(400).send({
                mess: "Không thể lấy thông tin",
                err: err
            });
        });
})

app.post('/HoaDon', (req, res) => {
    var reqBody = req.body;
    var Month = reqBody.Month,
        Year = reqBody.Year,
        Class = reqBody.Class,
        StudentClass = reqBody.StudentClass,
        StudentName = reqBody.StudentName,
        Pay = reqBody.Pay;

    var ref = db.collection(Year + "-" + Month).doc(Class).collection('ThongTin')
        .where('Họ Tên', '==', StudentName)
        .where('Lớp', '==', StudentClass).get()
        .then(snap => {
            snap.forEach(doc => {
                doc.ref.update({
                    Pay: Pay
                })
            })
            return res.status(200).send({
                mess: "Hoàn tất"
            })
        }).catch(err => {
            return res.status(400).send({
                mess: "Không thực thi được.",
                err: err
            })
        })
})
exports.app = functions.https.onRequest(app);