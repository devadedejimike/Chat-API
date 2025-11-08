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
            required: true
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return; this.password = await bcrypt.hash(this.password, 12)
})



export default mongoose.model<IUser>("User", userSchema);