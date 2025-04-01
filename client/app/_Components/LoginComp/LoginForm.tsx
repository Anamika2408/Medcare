"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Login.module.css";
import Image from "next/image";
import { useLogin } from "@/app/providers/loginProvider";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import { toast } from "sonner";

export default function LoginForm() {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const router = useRouter();

    const { fetchUser,user } = useLogin();
    useEffect(()=>{
        if(user){
            router.replace("/");
        }
    },[]);

    const processLogin = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();
        if (!userEmail || !userPassword) {
            toast.error("Please enter both email and password");
            return;
        }

        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userEmail, password: userPassword }),
                credentials: "include",
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response");
            }

            const result = await response.json();
            if (response.ok) {
                await fetchUser();
                toast.success("Logged in successfully!");
                router.push("/");
            } else {
                toast.error(result.message || "Login failed");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("An error occurred while logging in. Please try again.");
        }
    };

    const resetForm = () => {
        setUserEmail("");
        setUserPassword("");
        toast.info("Form reset");
    };

    const initiateGoogleLogin = () => {
        window.location.href = "http://localhost:3001/api/users/google";
    };

    return (
        <div className={styles.loginContainer}>
            <h2>Login</h2>
            <p>
                Are you a new member?{" "}
                <Link href="/register" className={styles.linkButton}>
                    Sign up here.
                </Link>
            </p>
            <br />
            <form onSubmit={processLogin}>
                <label>Email</label>
                <div className={styles.inputField}>
                    <section className={styles.inputcontainer}>
                        <span>
                            <Image
                                src="/email.svg"
                                alt="Email logo"
                                height={20}
                                width={20}
                            />
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
                            <Image
                                src="/lockPass.svg"
                                alt="Password logo"
                                height={20}
                                width={20}
                            />
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
                    className={`${styles.button} ${styles.loginButton}`}
                >
                    Login
                </button>
                <button
                    type="button"
                    onClick={resetForm}
                    className={`${styles.button} ${styles.resetButton}`}
                >
                    Reset
                </button>
                <br />
                <br />
                <p className={styles.forgot}>
                    <Link href="/forgot-password">Forgot Password?</Link>
                </p>
                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <GoogleSignInButton onClick={initiateGoogleLogin} />
            </form>
        </div>
    );
}