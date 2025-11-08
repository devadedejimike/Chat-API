import mongoose,{ Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';


export interface IUser extends Document{
    username: string,
    email: string,
    password: string
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12)
    next();
})

export default mongoose.model<IUser>("User", userSchema);