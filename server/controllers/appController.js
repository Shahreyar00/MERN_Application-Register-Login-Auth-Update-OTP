import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";


export async function verifyUser(req, res, next){
    try {
        const { username } = req.method == "GET" ? req.query : req.body;
        let exist = await User.findOne({ username });
        if(!exist) return res.status(404).send({ error : "Can't find User!"});
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error"});
    }
}

export async function register(req,res){

    try {
        const { username, password, profile, email } = req.body;        

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            User.findOne({ username }, function(err, user){
                if(err) reject(new Error(err))
                if(user) reject({ error : "Please use unique username"});

                resolve();
            })
        });

        // check for existing email
        const existEmail = new Promise((resolve, reject) => {
            User.findOne({ email }, function(err, email){
                if(err) reject(new Error(err))
                if(email) reject({ error : "Please use unique Email"});

                resolve();
            })
        });


        Promise.all([existUsername, existEmail])
            .then(() => {
                if(password){
                    bcrypt.hash(password, 10)
                        .then( hashedPassword => {
                            
                            const user = new User({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully"}))
                                .catch(error => res.status(500).send({error}))

                        }).catch(error => {
                            return res.status(500).send({
                                error : "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({ error })
            })


    } catch (error) {
        return res.status(500).send(error);
    }
}

export async function login(req, res){
    try{
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ error: "User does not exist. " });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials. " });

        const token = jwt.sign(
            {
                userId: user._id,
                username : user.username
            },
            process.env.JWT_SECRET,
            { expiresIn : "24h" }
        )

        const { password, ...others } = user._doc;
        res.status(200).json({
            msg: "Login Successful!",
            username: user.username,
            token
        })
    } catch(error){
        res.status(500).json({ error: error.message })
    }
}

export async function getUser(req,res){
    try{
        const { username } = req.params;
        const user = await User.findOne({ username });
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch(err){
        res.status(404).json({ message: "Cannot Find User Data" });
    }
}

export async function updateUser(req,res){
    try {
        // const id = req.query.id

        const { userId } = req.user;
        if(userId){
            if(req.body.password){
                req.body.password = await bcrypt.hash(req.body.password,10);
            }
            const body = req.body;
            User.findByIdAndUpdate({ _id : userId }, body, function(err, data){
                if(err) throw err;
                return res.status(201).send({ msg : "Record Updated...!"});
            })
        }else{
            return res.status(401).send({ error : "User Not Found...!"});
        }
    } catch (error) {
        return res.status(401).send({ error });
    }
}

export async function generateOTP(req,res){
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    res.status(201).send({ code: req.app.locals.OTP })
}

export async function verifyOTP(req,res){
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: "Verified Successsfully!"})
    }
    return res.status(400).send({ error: "Invalid OTP"});
}


// successfully redirect user when OTP is valid
export async function createResetSession(req,res){
   if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession})
   }
   return res.status(404).send({error : "Session expired!"})
}


// update the password when we have valid session
export async function resetPassword(req,res){
    try {
        if(!req.app.locals.resetSession) return res.status(404).send({error : "Session expired!"});
        const { username, password } = req.body;
        try {
            
            User.findOne({ username})
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            User.updateOne({ username : user.username },
                            { password: hashedPassword}, function(err, data){
                                if(err) throw err;
                                req.app.locals.resetSession = false; // reset session
                                return res.status(201).send({ msg : "Record Updated...!"})
                            });
                        })
                        .catch( e => {
                            return res.status(500).send({
                                error : "Enable to hashed password"
                            })
                        })
                })
                .catch(error => {
                    return res.status(404).send({ error : "Username not Found"});
                })
        } catch (error) {
            return res.status(500).send({ error })
        }
    } catch (error) {
        return res.status(401).send({ error })
    }
}
