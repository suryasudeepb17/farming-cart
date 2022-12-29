const express=require('express');
const app=express();
const mongoose=require('mongoose');
const session=require('express-session');


//twilio connection
const accountSid = "AC5c8885f839952f6fd361f9c68db00388";
const authToken = "f21e4916425d484784db0265ba4a3e9a";
const client = require("twilio")(accountSid, authToken);


app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: false, cookie:{ maxAge: 60000},}));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.use('/assets',express.static('assets'));

//mongoose
const connectDB=async()=>
{
    await mongoose.connect('mongodb+srv://surya:TyAwdHCySCmpejwO@cluster0.v7gvpwe.mongodb.net/twilio');
    console.log('Connected to MongoDB');
}
connectDB();
const userschema=new mongoose.Schema({
    users:Number,
});
const userschema2=new mongoose.Schema({
    mobile:String,
});
const item_schema=new mongoose.Schema({
    item_name:String,
    cost:Number,
    item_type:String,
    quantity:String,
    image_url:String
})
const cart_schema=new mongoose.Schema({
    item_code:String,
    number:String,
    item_name:String,
    cost:Number,
    quantity:String,
    image_url:String
});
const wish_schema=new mongoose.Schema({
    item_code:String,
    number:String,
    item_name:String,
    cost:Number,
    quantity:String,
    image_url:String
});


const OTP=mongoose.model("OTP",userschema);
const mobile_number=mongoose.model("USER",userschema2);
const seed=mongoose.model("items",item_schema);
const cart=mongoose.model("cart",cart_schema);
const wish=mongoose.model("wish",wish_schema);

var sess; // global session, NOT recommended

app.get('/',(req,res)=>{
    seed.find((err, docs) => {
        if (!err) {
            cart.find({number:req.session.number},(err,cart_data) => {
                if (!err) 
                {
                    wish.find({number:req.session.number},(err,wish_data)=>{
                        if(!err)
                        {
                            var cart_list=[];
                            for(var i=0;i<cart_data.length;i++)
                            {
                                cart_list.push(cart_data[i].item_code);
                            }
                            var wish_list=[];
                            for(var i=0;i<wish_data.length;i++)
                            {
                                wish_list.push(wish_data[i].item_code);
                            }
                            res.render("home", 
                            {
                                data: docs,
                                number:req.session.number,
                                move_id:"top",
                                cart_data:cart_list,
                                wish_data:wish_list
                            });
                        }
                    })
                } else {
                    console.log('Failed to retrieve the Course List: ' + err);
                }
            });
            
        } else {
            console.log('Failed to retrieve the Course List: ' + err);
        }
    });
})

//verify user otp
//post request to verify user input to 

app.post('/verify',function(req,res){
    console.log('verified')
    const code=req.body.code
    const number=req.body.number
    OTP.findOne({users:code},function(err,found){
        if(err)
        {
            res.render('error')
        }
        else if (found)
        {
            //session setting
            sess = req.session;
            sess.number = req.body.number;
            seed.find((err, docs) => {
                if (!err) {
                    cart.find({number:number},(err,cart_data) => {
                        if (!err) {
                            wish.find({number:number},(err,wish_data)=>{
                            if(!err)
                            {
                                var wish_list=[];
                                for(var i=0;i<wish_data.length;i++)
                                {
                                   wish_list.push(wish_data[i].item_code);
                                }
                                var cart_list=[];
                                for(var i=0;i<cart_data.length;i++)
                                {
                                   cart_list.push(cart_data[i].item_code);
                                }
                                console.log(cart_list);
                                res.render("home", 
                                {
                                    data: docs,
                                    number:req.session.number,
                                    move_id:"top",
                                    cart_data:cart_list,
                                    wish_data:wish_list,
                                });
                            }
                            })
                        } else {
                            console.log('Failed to retrieve the Course List: ' + err);
                        }
                    });
                } else {
                    console.log('Failed to retrieve the Course List: ' + err);
                }
            });
            //deleteing the otp-code
            OTP.findOneAndDelete(code,function(err){
                if(err)
                {
                    console.log('cant delete');
                }
                else
                {
                    console.log('deleted');
                }
            })
            mobile_number.findOne({mobile:number},function(err,found){
                if(err)
                {
                    console.log('error');                    
                }
                else if (found)
                {
                    console.log('mobile number already inserted')
                }
                else
                {
                    console.log('new mobile number');
                    const newuser2=new mobile_number({
                        mobile:number,
                    })
                    newuser2.save(function(err)
                    {
                        if(err)
                        {
                            console.log('error generated to insert mobile number');
                        }
                        else
                        {
                            console.log('Mobile Number inserted successfully');

                        }
                    })
                 }
            })
           
        }
        else
        {
            res.render('error');
        }
    })
})
app.get("/login",(req,res)=>{
    if(req.session.number)
    {
        res.send("You have encountered an wrong page , Go back to home page");
    }
    else
    {
        res.render("login");
    }
})
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});
app.get('/profile',(req,res)=>{
    if(req.session.number)
    {
        res.render('profile',{number:req.session.number});
    }
    else
    {
        res.render("login");
    }
})
app.get('/wish',(req,res)=>{
    if(req.session.number)
    {
        wish.find({number:req.session.number},(err,cart_data)=>{
            if(!err)
            {
                res.render('wish',{
                    number:req.session.number,
                    data:cart_data
                });
            }
        })
    }
    else
    {
        res.render("login");
    }
})
app.get('/cart',(req,res)=>{
    if(req.session.number)
    {
        cart.find({number:req.session.number},(err,cart_data)=>{
            if(!err)
            {
                res.render('cart',{
                    number:req.session.number,
                    data:cart_data
                });
            }
        })
    }
    else
    {
        res.render("login");
    }
})

app.post('/remove_cart',(req,res)=>{
    const number=req.body.number;
    const item_code=req.body.item_code;
    cart.deleteOne({item_code:item_code,number:number},function(err){
        if(err)
        {
            console.log('cant delete the cart');
        }
        else
        {
            console.log('cart deleted');
            cart.find({number:number},(err,data)=>{
                if(!err)
                {
                    res.render("cart",{number:number,data:data})
                }
            })
        }
    })
})
app.post('/remove_wish',(req,res)=>{
    const cart_or_wish=req.body.cart_or_wish;
    if(cart_or_wish==1)
    {
        const number=req.body.number;
        const item_code=req.body.item_code;
        const item_name=req.body.item_name;
        const cost=req.body.cost;
        const quantity=req.body.quantity;
        const image_url=req.body.image_url;
        const newcart=new cart({
        item_code:item_code,
        number:number,
        item_name:item_name,
        cost:cost,
        quantity:quantity,
        image_url:image_url
    })
        newcart.save(function(err)
        {
            if(err)
            {
                console.log('failed to add in cart from wish');
            }
            else
            {
                console.log('item added to cart');
                wish.deleteOne({item_code:item_code,number:number},function(err){
                    if(err)
                    {
                        console.log('cant delete the wish');
                    }
                    else
                    {
                        console.log('wish deleted');
                        wish.find({number:number},(err,data)=>{
                            if(!err)
                            {
                                res.render("wish",{number:number,data:data})
                            }
                        })
                    }
                })
            }
        })
    }
    else
    {
        const number=req.body.number;
        const item_code=req.body.item_code;
        wish.deleteMany({item_code:item_code,number:number},function(err){
            if(err)
            {
                console.log('cant delete the wish');
            }
            else
            {
                console.log('wish deleted');
                wish.find({number:number},(err,data)=>{
                    if(!err)
                    {
                        res.render("wish",{number:number,data:data})
                    }
                })
            }
        })        
    }
    
})
app.post('/add-cart',(req,res)=>{
    const number=req.body.number;
    const item_code=req.body.item_code;
    const item_name=req.body.item_name;
    const cost=req.body.cost;
    const quantity=req.body.quantity;
    const image_url=req.body.image_url;
    const newcart=new cart({
        item_code:item_code,
        number:number,
        item_name:item_name,
        cost:cost,
        quantity:quantity,
        image_url:image_url
    })
    newcart.save(function(err)
    {
        if(err)
        {
            console.log('Failed to add in cart');
        }
        else
        {
            cart.find({number:number},(err, cart_data) => {
                if (!err)
                {
                    seed.find((err, docs) => {
                        if (!err) {
                            wish.find({number:number},(err,wish_data)=>{
                                if(!err)
                                {
                                    var cart_list=[];
                                    for(var i=0;i<cart_data.length;i++)
                                    {
                                        cart_list.push(cart_data[i].item_code);
                                    }
                                    var wish_list=[];
                                    for(var i=0;i<wish_data.length;i++)
                                    {
                                        wish_list.push(wish_data[i].item_code);
                                    }
                                    res.render("home", 
                                    {
                                        data: docs,
                                        number:req.session.number,
                                        move_id:item_code,
                                        cart_data:cart_list,
                                        wish_data:wish_list
                                    });
                                    console.log(wish_list);
                                }
                            })
                        } else {
                            console.log('Failed to retrieve the Course List: ' + err);
                        }
                    });
                     
                    
                } else {
                    console.log('Failed to retrieve the Course List: ' + err);
                }
            });                        
        }
    })

})

app.post('/add-wish',(req,res)=>{
    const number=req.body.number;
    const item_code=req.body.item_code;
    const item_name=req.body.item_name;
    const cost=req.body.cost;
    const quantity=req.body.quantity;
    const image_url=req.body.image_url;
    const newwish=new wish({
        item_code:item_code,
        number:number,
        item_name:item_name,
        cost:cost,
        quantity:quantity,
        image_url:image_url
    })
    newwish.save(function(err)
    {
        if(err)
        {
            console.log('Failed to add in wish');
        }
        else
        {
            cart.find({number:number},(err, cart_data) => {
                if (!err)
                {
                    seed.find((err, docs) => {
                        if (!err) {
                            wish.find({number:number},(err,wish_data)=>{
                                if(!err)
                                {
                                    var cart_list=[];
                                    for(var i=0;i<cart_data.length;i++)
                                    {
                                        cart_list.push(cart_data[i].item_code);
                                    }
                                    var wish_list=[];
                                    for(var i=0;i<wish_data.length;i++)
                                    {
                                        wish_list.push(wish_data[i].item_code);
                                    }
                                    res.render("home", 
                                    {
                                        data: docs,
                                        number:req.session.number,
                                        move_id:item_code,
                                        cart_data:cart_list,
                                        wish_data:wish_list
                                    });
                                    console.log(wish_list);
                                }
                            })
                        } else {
                            console.log('Failed to retrieve the Course List: ' + err);
                        }
                    });
                     
                    
                } else {
                    console.log('Failed to retrieve the Course List: ' + err);
                }
            });                        
        }
    })

})

app.post("/login",(req,res)=>{
    //grabs user number
    const number=req.body.number;
    //generate otp
    let randomN=Math.floor(Math.random()*90000)+10000;
    //sending message
    client.messages
    .create({ body: randomN, from: "+15103992157", to:'+'+ number })
    .then(saveuser());
    //saves random number to database 
    function saveuser()
    {
        const newuser=new OTP({
            users:randomN,
        })
        newuser.save(function(err)
        {
            if(err)
            {
                console.log('error generated numb');
            }
            else
            {
                console.log('OTP generated'+randomN);
                res.render('verify',{mobile:number});
                
            }
        })
        

    }
})

app.listen(3000,()=>{
    console.log('app running on 3000')
})