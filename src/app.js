// A simple express js program

const express = require('express');
// TO watch http request
const morgan = require('morgan');
const app = express();
const handlebars = require('express-handlebars');

const path = require('path');
const { parse } = require('path');

const port = 3000

//use static middleware to for static file 
app.use(express.static(path.join(__dirname,'public')))

app.use(express.static(path.join(__dirname,'abc')))

app.use(express.json());
app.use(express.urlencoded({ extended: true}));


//use morgan
// app.use(morgan('combined'))

//configure template engine
app.engine('hbs', handlebars({
    defaultLayout: 'main',
    //set extension name
    extname: '.hbs',
    helpers:{
        mytours: function(tours, options) {
            console.log("OPTION TOURS",options.fn(this))
            var len = tours.length
            var returnData = ''
            for (var i=0; i<len; i++) {
                // 
                returnData += options.fn({name:'<b>' + tours[i].name + '</b>',
                price: '$' + tours[i].price })
            }
            console.log("Return DATA", returnData)
            return returnData
        }
    }
}))

//set dir path since default handlebars only detect view folder from root directory
app.set('views', path.join(__dirname,'views'))

//set tempalte engine
app.set('view engine','hbs');

//custom handlebars helper
var  hbs = handlebars.create({});
//helpers name tableCreate -> return table 
hbs.handlebars.registerHelper('tableCreate', function(iterator1,iterator2){
    var tb = "<table border='1' style='margin:auto'>"
    for(var i = 0; i < iterator1; i++){
        tb += "<tr>";
        for(var j =0; j < iterator2; j++){
            tb += `<td>${i+j}</td>`
        }
        tb += "</tr>"
    }
    tb += "</table>"

    return tb;
})

//configure GET method route 
//Home page route
app.get('/',(req,res)=>{
    //get m,n variable
    const m = req.query.m ? req.query.m : 0 ;
    const n = req.query.n ? req.query.n : 0 ;
    //request - response
    res.render('home',{inputM:parseInt(m), inputN:parseInt(n)});
})

const tours = [
    {id:0, name: "Nha Trang", price: 99.99, img:'https://vcdn1-vnexpress.vnecdn.net/2021/03/22/NhaTrang-KhoaTran-27-1616120145.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=9BMNnjV_o665_kwWTgfOSQ'},
    {id:1, name: "Khanh Hoa", price: 99.99, img:'https://luhanhvietnam.com.vn/du-lich/vnt_upload/news/04_2019/khanh-hoa.jpg'},
    {id:2, name: "Hoi An", price: 99.99, img:'https://lh3.googleusercontent.com/proxy/FAhTcAcGn1MRlxw28dOuS3ARgikC3QBTvpGD_4D3TltSy98F_aAI8iTdkLRtpYoQQabmROUjwlSQG4XXEghD7KrwB2wpu1-OvtDjoYuPwXaTMX9gpU-fK7xhjcqODCFL5GSy9Q'},
    {id:3, name: "Phan Thiet", price: 99.99, img:'https://cdnimg.vietnamplus.vn/t1200/Uploaded/hmnsy/2019_09_10/phan_thiet.jpg'},
    {id:4, name: "Phan Thiet", price: 99.99, img:'https://cdnimg.vietnamplus.vn/t1200/Uploaded/hmnsy/2019_09_10/phan_thiet.jpg'},
    {id:5, name: "Phan Thiet", price: 99.99, img:'https://cdnimg.vietnamplus.vn/t1200/Uploaded/hmnsy/2019_09_10/phan_thiet.jpg'},
    {id:6, name: "Phan Thiet", price: 99.99, img:'https://cdnimg.vietnamplus.vn/t1200/Uploaded/hmnsy/2019_09_10/phan_thiet.jpg'},
]

//Available page route
app.get('/tours',(req,res)=>{
    res.render('tours', {tours});
})

app.get('/test', (req,res)=>{
    res.render('test',{
        currency: {
            name: 'United States dollars',
            abbrev: 'VND',
        },
        tours: [
            { name: 'Hood River', price: '99.95' },
            { name: 'Oregon Coast', price: '159.95' },
        ],
        specialsUrl: '/january-specials',
        currencies: [ 'USD', 'GBP', 'BTC' ],
    })
})
// app.get('/tours',(req,res)=>{

// const toursXml = '<?xml version="1.0"?><tours>' + 
//                 tours.map(p=> `<tour price="${p.price}" id="${p.id}">${p.name}</tour> `).join('') + '</tours>'
// res.format({
//     'application/json': ()=> res.json(tours),
//     'application/xml': ()=> res.type('application/xml').send(toursXml),
//     'text/xml': () => res.type('text/xml').send(toursXml)
// })
// })

//put
app.put('/tours/:id', (req,res)=>{
    const p = tours.find(p=>p.id === parseInt(req.params.id));
    console.log(p)
    if (!p) return res.status(404);
    if(req.body.name) p.name = req.body.name
    if(req.body.price) p.price = req.body.price
    res.json({success:true})
})

app.delete('/tours/:id', (req, res) => {

    const idx = tours.findIndex(tour => tour.id === parseInt(req.params.id))
    
    if(idx < 0) return res.json({ error: 'No such tour exists.' })
    
    tours.splice(idx, 1)
    
    res.json({ success: true })
})

//About page route
app.get('/about',(req,res)=>{
    res.render('about');
})
//Search page route
app.get('/search',(req,res)=>{
    //print request query
    const p = tours.filter(p => p.name === req.query.q);
    console.log(p)
    Object.keys(p).length === 0? res.render('404'): p
    console.log("search query: ",req.query);
    res.render('tours', {tours: p});
})

app.get('/add-tour', (req,res)=>{
    res.render('add-tour');
})

app.post('/add-tour', (req,res)=>{
    console.log(typeof req.body.tourPrice)
    tours.push({id:tours.length,name: req.body.tourName,price: parseInt(req.body.tourPrice),img: req.body.tourLink })
    console.log(tours);
    //redirect to /tours
    res.redirect('/tours');
})

app.use((req,res)=>{
    res.status('404').render('404');
})


app.listen(port, ()=> console.log(`Server online! Listening at https://localhost:${port}`))
