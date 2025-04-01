"use client";

import { useState } from "react";
import {useEffect} from "react";
import Link from "next/link";
import styles from "./signup.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLogin } from "@/app/providers/loginProvider";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import { toast } from "sonner";

export default function RegisterForm() {
    const [fullName, setFullName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { fetchUser, setUser, user } = useLogin();
     useEffect(()=>{
            if(user){
                router.replace("/");
            }
        },[]);

    const processSignup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!fullName || !userEmail || !userPassword) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: fullName, email: userEmail, password: userPassword }),
                credentials: "include",
            });

            const result = await res.json();
            if (result.ok) {
                try {
                    const loginRes = await fetch("/api/users/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email: userEmail, password: userPassword }),
                        credentials: "include",
                    });

                    const loginData = await loginRes.json();

                    if (loginData.ok) {
                       // setUser(loginData.user);
                        await fetchUser();
                        toast.success("Signup and login successful!");
                        router.replace("/");
                    } else {
                        toast.error("Signup successful, but login failed. Please login manually.");
                        router.replace("/login");
                    }
                } catch (loginError) {
                    toast.error("Signup successful! Please login.");
                    router.replace("/login");
                }
            } else {
                toast.error(result.message || "Signup failed");
            }
        } catch (error) {
            toast.error("An error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFullName("");
        setUserEmail("");
        setUserPassword("");
        toast.info("Form cleared");
    };

    const initiateGoogleSignup = () => {
        window.location.href = "http://localhost:3001/api/users/google";
    };

    return (
        <div className={styles.signupContainer}>
            <h2>Register</h2>
            <p>
                Already have an account? <Link href="/login">Login.</Link>
            </p>

            <form onSubmit={processSignup}>
                <label>Full Name</label>
                <div className={styles.inputField}>
                    <section className={styles.inputcontainer}>
                        <span>
                            <Image src="/name.svg" alt="name icon" height={20} width={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </section>
                </div>

                <label>Email</label>
                <div className={styles.inputField}>
                    <section className={styles.inputcontainer}>
                        <span>
                            <Image src="/email.svg" alt="email icon" height={20} width={20} />
                        </span>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </section>
                </div>

                <label>Password</label>
                <div className={styles.inputField}>
                    <section className={styles.inputcontainer}>
                        <span>
                            <Image src="/lockPass.svg" alt="password icon" height={20} width={20} />
                        </span>
                        <input
                            type="password"
                            placeholder="********"
                            required
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                        />
                    </section>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.button} ${styles.submitButton}`}
                >
                    {loading ? "Registering..." : "Sign Up"}
                </button>
                <button
                    type="button"
                    onClick={resetForm}
                    className={`${styles.button} ${styles.resetButton}`}
                >
                    Reset
                </button>
                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <GoogleSignInButton onClick={initiateGoogleSignup} text="Sign up with Google" />
            </form>
        </div>
    );
}