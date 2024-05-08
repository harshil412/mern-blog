import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken'

export const signup = async (req,res, next) =>{
    const { username, email, password } = req.body;

    if (!username || !password || !email || email === '' || password === '' || username === ''){
        next(errorHandler(400, 'All field are required'))
    }

    const hashedPassword = bcryptjs.hashSync(password, 10)

    const newUser = new User({
        username,
        email,
        password: hashedPassword ,
    });
    
    try {
        await newUser.save();
        res.json({message: 'Signup successful'})       
    } catch (error) {
        next(error)
    }
}

export const signin = async (req,res,next) => {
    const {email, password} = req.body;

    if(!email || !password || email === '' || password === ''){
        next(errorHandler(400,'All Fields are required'))
    }

    try {
        const vaildEmail = await User.findOne({email})
        if(!vaildEmail){
            return next(errorHandler(404, "User not found"))
        }
        const vaildPassword = bcryptjs.compareSync(password , vaildEmail.password)
        if(!vaildPassword){
            return next(errorHandler(400, 'Invalid password'))
        }

        const token = jwt.sign({id : vaildEmail._id}, 'Harshil');

        const {password: pass , ...rest} = vaildEmail._doc;

        res.status(200).cookie('access_token', token, {
            httpOnly: true
        }).json(rest)
    } catch (error) {
        next(error);        
    }
}