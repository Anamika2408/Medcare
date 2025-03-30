import React from "react";
import styles from "./help.module.css";
import Link from "next/link";

const HelpPage = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Emergency Contact & Help</h1>
              
            </header>
            <section className={styles.contacts}>
                <div className={styles.card}>
                    <h2>Emergency Medical Services</h2>
                    <p>
                        Dial: <strong>111</strong> 
                    </p>
                </div>
                <div className={styles.card}>
                    <h2>Blood Bank</h2>
                    <p>
                        Dial: <strong>92007722282</strong>
                    </p>
                </div>
                <div className={styles.card}>
                    <h2>Ambulance</h2>
                    <p>
                        Dial: <strong>128</strong> 
                    </p>
                </div>
                <div className={styles.card}>
                    <h2>Explore surroundings</h2>
                    <p>
                        Find the hospital at{" "}
                        <Link
                            href="https://www.data.gov.in/catalog/hospital-directory-national-health-portal"
                            className={styles.link}
                            target="_blank"
                        >
                            Hospital Directory
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HelpPage;