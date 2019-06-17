let express = require('express');
let common = require('../../lib/common');
let moment = require('moment');
let router = express.Router();

// The homepage of the site
router.post('/', (req, res, next) => {
    let db = req.app.db;

    var id = moment().format("YYMMDDHHmmss");

    // new order doc
    let orderDoc = {
        orderPaymentId: id,                            // 페이 아이디
        orderPaymentGateway: 'anbpay',                  // 페이방식
        orderPaymentMessage: 'payReady',                // 페이 메시지
        orderTotal: req.session.totalCartAmount,        // 총가격
        orderEmail: req.body.shipEmail,                 // 고객 이메일
        orderFirstname: req.body.shipFirstname,         // 고객 성
        orderLastname: req.body.shipLastname,           // 고객 이름
        orderAddr1: req.body.shipAddr1,                 // 고객 주소1
        orderAddr2: req.body.shipAddr2,                 // 고객 주소2
        orderCountry: req.body.shipCountry,             // 고객 국가
        orderState: req.body.shipState,                 // 고객 주
        orderPostcode: req.body.shipPostcode,           // 고객 우편번호
        orderPhoneNumber: req.body.shipPhoneNumber,     // 고객 전화번호
        orderStatus: "0",                               // 주문 상태 (0: 대기 1: ? 2: ? ...)
        orderDate: new Date(),                          // 주문번호
        orderProducts: req.session.cart                 // 주문 상품
    };

    // insert order into DB
    db.orders.insert(orderDoc, (err, newDoc) => {
        if(err){
            console.info(err.stack);
        }

        // get the new ID
        let newId = newDoc.ops[0]['orderPaymentId'];

        // redirect to outcome
        res.send(newId);
    });
});

// The homepage of the site
router.get('/approval/:orderId', (req, res, next) => {
  let db = req.app.db;

  db.orders.find({orderPaymentId: req.params.orderId}).toArray((err, result) => {
    if(err){
        console.info(err.stack);
    }

    if(result.length == 0) {
      console.log("deny");
      return res.status(400).send('9');
    } else {

      db.orders.update({orderPaymentId: req.params.orderId}, {$set: {orderStatus: "1"}});

      console.log("pass");
      return res.status(200).send('1');
    }
  });
});

// The homepage of the site
router.post('/approval/:orderId', (req, res, next) => {
  let db = req.app.db;

  db.orders.find({orderPaymentId: req.params.orderId}).toArray((err, result) => {
    if(err){
        console.info(err.stack);
    }

    if(result.length == 0) {
      console.log("deny");
      return res.status(400).send('9');
    } else {

      db.orders.update({orderPaymentId: req.params.orderId}, {$set: {orderStatus: "1"}});

      console.log("pass");
      return res.status(200).send('1');
    }
  });
});

// The homepage of the site
router.post('/complete', (req, res, next) => {

  let db = req.app.db;

  console.log(req.body.orderId);

  db.orders.find({orderPaymentId: req.body.orderId, orderStatus: "1"}).toArray((err, result) => {
    if(err){
        console.info(err.stack);
    }

    if(result.length == 0) {
      console.log("deny");
      res.send('deny');
    } else {

      console.log("pass");
      res.send('pass');
    }
  });
});

// The homepage of the site
router.get('/completed', (req, res, next) => {

  //clear the cart
  if(req.session.cart){
    req.session.cart = null;
    req.session.orderId = null;
    req.session.totalCartAmount = 0;
  }

  let config = req.app.config;

  res.render(`${config.themeViews}anbpay_complete`, {
      title: 'Payment complete',
      config: req.app.config,
      session: req.session,
      pageCloseBtn: common.showCartCloseBtn('payment'),
      //result: result,
      message: 'Your payment was successfully completed',
      messageType: 'success',
      helpers: req.handlebars.helpers,
      showFooter: 'showFooter',
      //menu: common.sortMenu(await common.getMenu(db))
  });
});

module.exports = router;
