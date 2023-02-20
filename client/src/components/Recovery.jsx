import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/store";
import { generateOTP, verifyOTP } from "../helper/helper";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Username.module.css";

const Recovery = () => {
    const { username } = useAuthStore(state => state.auth);
    const [OTP, setOTP] = useState();
    const navigate = useNavigate();

    useEffect(()=> {
        generateOTP(username).then((OTP) => {
            console.log(OTP);
            if(OTP) return toast.success("OTP has been sent to your email");
            return toast.error("Problem with generating OTP!");
        })
    },[username]);

    const onSubmit = async(e)=>{
        e.preventDefault();
        try{
            let { status } = await verifyOTP({ username, code: OTP });
            if(status === 201){
                toast.success("Verified Successfully!");
                return navigate("/reset");
            }
        }catch(error){
            return toast.error("Wrong OTP! Check email again! ")
        }
    }

    const resendOTP = ()=>{
        let sentPromise = generateOTP(username);
        toast.promise(sentPromise,{
            loading: "Sending...!",
            success: <b>OTP has been sent to your registered email!</b>,
            error: <b>Could not send the OTP to the provided email!</b>
        });

        sentPromise.then((OTP) => {
            console.log(OTP);
        });
    }

     return (
        <div className="container mx-auto">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex justify-center items-center h-screen my-10">
                <div className={styles.glass} style={{ width: "45%", paddingTop: "3em"}}>
                    <div className="title flex flex-col items-center">
                        <h4 className="text-5xl font-bold">Recovery</h4>
                        <span className="py-4 text-xl w-2/3 text-center text-gray-500">
                            Enter OTP to recover password.
                        </span>
                    </div>

                    <form className="pt-20" onSubmit={onSubmit}>
                        <div className="textbox flex flex-col items-center gap-6">
                            <div className="input text-center">
                                <span className="py-4 text-sm text-left text-gray-500">
                                    Enter 6 digit OTP sent to your email address.
                                </span>
                                <input onChange={(e) => setOTP(e.target.value) } className={styles.textbox} type="text" placeholder="OTP" />
                            </div>
                            <button className={styles.btn} type="submit">
                                Recover
                            </button>
                        </div>
                    </form>

                    <div className="text-center py-4">
                        <span className="text-gray-500">
                            Can't get OTP?{" "} 
                            <button onClick={resendOTP} className="text-red-500">
                                Resend
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Recovery